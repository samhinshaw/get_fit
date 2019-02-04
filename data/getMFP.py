"""
Pull user's data from MyFitnessPal
"""
import sys  # for system operations such as exit status codes
import re  # regex library
import json  # for parsing json
import os
import arrow  # datetime handling
from dateutil.tz import tzutc  # timezone functions # pip install python-dateutil
from pymongo import MongoClient  # mongodb operations
import bson
import myfitnesspal  # myfitnesspal API!
import utils
from urllib import parse
import logging

# define log levels
log_levels = {
  "production": "WARNING",
  "testing": "INFO",
  "development": "DEBUG",
}

log_level_for_env = log_levels.get(os.getenv('NODE_ENV'))

# Set up logging options
logging.basicConfig(level=log_level_for_env)
# Set up a file to write logs to
fileHandler = logging.FileHandler('/app/logs/python.log')
fileHandler.setLevel(log_level_for_env)
# create a console handler too
consoleHandler = logging.StreamHandler()
consoleHandler.setLevel(log_level_for_env)

# create formatter and add it to the handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fileHandler.setFormatter(formatter)
consoleHandler.setFormatter(formatter)

# create a new logger to
logger = logging.getLogger('get-fit-py')
logger.addHandler(fileHandler)
logger.addHandler(consoleHandler)

try:

  # NOTES
  # - Later on I may wish to pull calorie goals straight from MFP
  # MFPcals.goals['calories']

  now = arrow.now('US/Pacific')
  this_morning = now.floor('day')
  this_evening = now.ceil('day')

  if len(sys.argv) == 4:
    input_date = sys.argv[1]
    user = sys.argv[2]
    mfp = sys.argv[3]
    input_date = arrow.get(input_date, 'YYYY-MM-DD', tzinfo='US/Pacific')
    start_date = input_date
    end_date = input_date
  elif len(sys.argv) == 5:
    first_date = sys.argv[1]
    second_date = sys.argv[2]
    user = sys.argv[3]
    mfp = sys.argv[4]
    first_date = arrow.get(first_date, 'YYYY-MM-DD', tzinfo='US/Pacific')
    second_date = arrow.get(second_date, 'YYYY-MM-DD', tzinfo='US/Pacific')
    if first_date <= second_date:
      start_date = first_date
      end_date = second_date
    elif first_date > second_date:
      start_date = second_date
      end_date = first_date
    else:
      sys.exit('Error parsing the dates you provided.')
  else:
    sys.exit('You must provide a date and a user or a start date, end date, and user.')

  logger.info('Connecting to MongoDB database...')

  if os.getenv('NODE_ENV') == 'production':
    # Connect to the production server
    mongoURI = \
      "mongodb+srv://" + \
      parse.quote_plus(os.getenv('MONGO_PROD_PYTHON_USER')) + \
      ":" + \
      parse.quote_plus(os.getenv('MONGO_PROD_PYTHON_PASS')) + \
      "@" + \
      parse.quote_plus(os.getenv('MONGO_PROD_CONNECTION')) + \
      "/" + \
      parse.quote_plus(os.getenv('MONGO_PROD_DBNAME')) + \
      "?retryWrites=true"

  else:
    # Otherwise connect to our local development server
    mongoURI = \
      "mongodb://" + \
      parse.quote_plus(os.getenv('MONGO_DEV_PYTHON_USER')) + \
      ":" + \
      parse.quote_plus(os.getenv('MONGO_DEV_PYTHON_PASS')) + \
      "@" + \
      parse.quote_plus(os.getenv('MONGO_LOCAL_SERVICENAME')) + \
      ":" + \
      parse.quote_plus(str(os.getenv('MONGO_LOCAL_PORT'))) + \
      "/" + \
      parse.quote_plus(os.getenv('MONGO_INITDB_DATABASE')) + \
      "?authMechanism=" + \
      parse.quote_plus(os.getenv('MONGO_LOCAL_AUTHMECH'))

  client = MongoClient(mongoURI)

  db = client.get_fit
  entries = db.entries
  possibleExercises = db.exercises

  # Pull in the user's exercise groups
  exercise_groups = db.users.find_one({'username': user}, {'exerciseGroups': 1})

  logger.info('Pulling in MyFitnessPal information for ' + user.capitalize() + '...')

  # Attempt to get password from environment (yipes!)
  auth = os.getenv('MFP_PASS_' + mfp.upper())
  # If present, auth should be possible
  authPossible = not not auth
  # If we got it, our user should be able to log in, so we can enable login
  mfp_user = myfitnesspal.Client(mfp, password=auth, login=authPossible)

  for date in arrow.Arrow.range(
    frame='day', start=start_date, end=end_date, tz='US/Pacific'
  ):
    logger.info('Loading data from ' + date.format('MMMM DD, YYYY'))
    # Try/Except is mostly for if the API fails
    try:
      mfp_date = mfp_user.get_date(date.year, date.month, date.day)

      # Check to see if the totals object is empty. If so, the entry is most
      # likely empty, and we can just return zero values for everything
      if 'calories' in mfp_date.totals:
        total_cals = mfp_date.totals['calories']
        goal_cals = mfp_date.goals['calories']
        net_cals = goal_cals - total_cals
        is_empty = False
        cal_points = round((net_cals / 100), 2)
      else:
        total_cals = 0
        goal_cals = 0
        net_cals = 0
        is_empty = True
        cal_points = 0

    except:
      sys.exit('There was an error retrieving your data from MyFitnessPal.')

    # First we need to sanitize our exercise names. We can't rely on good inputs
    # because of things like connected apps auto-inserting exercises.

    # Pull in dictionaries from JSON. Later on I'll add this to MongoDB.

    # A specific error is better than a silent error
    try:
      exercise_entries = mfp_date.exercises
      cardio_entries = exercise_entries[0].entries

    except Exception as get_exercise_exception:
      logger.warning('We were not able to retrieve your exercise data for this date!')
      raise get_exercise_exception

    logger.info('Processing MyFitnessPal data...')

    # set up empty exercise array to handle multiple exercises in a day
    exercises = []
    total_exercise_points = 0

    # set up empty array especially to handle walking (via RunKeeper pocket track)
    walking = {
      'name': 'walking',
      'minutes': 0,
      'cals': 0,
      'points': 0,
      'icon': 'walking.png',
    }
    steps = {
      'name': 'steps',
      'minutes': 0,
      'cals': 0,
      'points': 0,
      'icon': 'walking.png',
    }

    # loop through all of the exercises in a day (if more than 0) This might be
    # ideal as a while loop, but this works fine too. I like it because we can
    # use _entry without manually counting.
    if len(cardio_entries) > 0:
      for _entry in range(0, len(cardio_entries)):

        # rename complex variables
        exercise_name = cardio_entries[_entry].name.lower()
        exercise_minutes = cardio_entries[_entry]['minutes']
        exercise_calories = cardio_entries[_entry]['calories burned']

        # Since cardio_entries is an MFP Client object, we can't do a {}.get() on it
        # and provide a default value. So check for None here.
        if exercise_minutes is None:
          exercise_minutes = 0

        # To find our exercise, we have to generate substrings of the exercise
        # name. Let's scan our word for each length that is valid. We'll start
        # with the total length of the string and go down to a minimum length of
        # 3. Note: have to specify that range is decreasing
        exercise_name_substrings = utils.generate_substrings(exercise_name, escape=True)
        number_of_queries = 0
        # Python has a for/else setup which lets us run the else block if the for
        # loop runs without a break.
        for substrings in exercise_name_substrings.values():
          regex = "^" + "$|^".join(substrings) + "$"
          # Instead of multiple queries, we can construct one regex for each
          # substring length to match with. That way we're only every hitting the
          # database for N - 3 times, where N is the length of the exercise name.
          exercise_name_regex = bson.regex.Regex(regex)

          query_results = utils \
            .query_exercise_group(username=user, exercise_name=exercise_name_regex, database=db)
          number_of_queries += 1
          exercise_groups = list(query_results)
          if exercise_groups:
            # For now, let's just pull the first hit blindly. We're starting with
            # the longest possible query string, so if we found more than one hit
            # of the same length, they are likely of equal importance. We could
            # probably refine this more in the future by using Mongo's text search
            # function with scoring.
            exercise_group = exercise_groups[0].get('exerciseGroup')
            # and we found our hit, so no need to query more!
            break

        # If no hits at all, use sensible defaults
        else:
          exercise_group = {"group": None, "pointsPerHour": 0, "exercises": exercise_name}

        points_per_hour = exercise_group.get('pointsPerHour', 0)
        matched_exercise = exercise_group.get('exercises', exercise_name)

        # Assign icons. We have already assigned sanitized names, so we can do a
        # simply dictionary replacement.

        exercise_icon_search = db.exercises.find_one(
          {
            'exercise': matched_exercise,
          }, {
            '_id': 0,
            'image': 1,
          }
        )

        if exercise_icon_search is None:
          exercise_icon = 'exercise.png'
        else:
          exercise_icon = exercise_icon_search.get('image', 'exercise.png')

        points = (exercise_minutes / 60) * points_per_hour

        # NOW, if this is walking or step-counting, let's concatenate the values
        if matched_exercise == "walking":
          # let's use 2 decimal places for now, and then shorten to 1 after concat
          points = round(points, 2)
          walking['points'] += points
          walking['minutes'] += exercise_minutes
          walking['cals'] += exercise_calories
        elif matched_exercise == "steps":
          try:
            # let's use 2 decimal places for now, and then shorten to 1 after concat
            points = round(points, 2)
            steps['points'] += points
            steps['cals'] += exercise_calories
            steps['minutes'] += exercise_minutes
          except TypeError:
            logger.error(matched_exercise + "could not be properly added")
        else:
          # Round to 1 decimal place
          points = round(points, 1)
          total_exercise_points += points

          # Leave out step-counting for now
          exercises.append(
            {
              'name': matched_exercise,
              'minutes': exercise_minutes,
              'cals': exercise_calories,
              'points': points,
              'icon': exercise_icon,
            }
          )

    # Briefly, add the concatenated steps and walking to the exercise list if
    # they are non-zero.
    if walking['points'] > 0:
      # take the total number of points from walking and round them before saving
      walking['points'] = round(walking['points'], 1)
      # then add them to that day's total exercise points
      total_exercise_points += walking['points']
      exercises.append(walking)
    if steps['points'] > 0:
      # take the total number of points from walking and round them before saving
      steps['points'] = round(steps['points'], 1)
      # then add them to that day's total exercise points
      total_exercise_points += steps['points']
      exercises.append(steps)

    # Double check everything got rounded properly
    total_exercise_points = round(total_exercise_points, 1)
    cal_points = round(cal_points, 1)

    # If day is complete, total points!
    if mfp_date.complete:
      total_days_points = cal_points + total_exercise_points
      total_days_points = round(total_days_points, 1)
    # Otherwise, if it's still the same day, give it 0 points
    elif this_morning <= date <= this_evening:
      total_days_points = 0
    # Otherwise, if it's an old day, give it -3 points!
    else:
      total_days_points = -3

    # construct object for db insertion
    mfp_date_data = {
      'date': date.datetime,
      'totalCals': total_cals,
      'goalCals': goal_cals,
      'netCals': net_cals,
      'exercise': exercises,
      'isEmpty': is_empty,
      'complete': mfp_date.complete,
      'points': total_days_points,
      'user': user,
      'lastUpdated': now.datetime,
    }

    logger.info('Writing data to MongoDB...')

    # First check to see if date already exists in DB OH MY GOD, the field order of
    # the query matters when querying by subdocument in mongodb!!!!! OH for the love
    # of hell!! We have to use this structure of query instead, where the order will
    # NOT matter
    # {
    #   'date.year': 2017,
    #   'date.month': 9,
    #   'date.day': 15,
    # }

    if entries.find_one({'date': date.datetime, 'user': user}):
      logger.warning('Found existing data for date, overwriting...')
      entries.update_one(
        {
          'date': date.datetime,
          'user': user,
        }, {
          '$set': mfp_date_data,
        }, upsert=False
      )
    else:
      logger.warning('No data found yet for this date, creating record...')
      entries.insert_one(mfp_date_data)

  # Close our connection to the mongoDB Database
  client.close()

except Exception as global_exception:
  client.close()
  logger.exception(global_exception)
  raise global_exception
