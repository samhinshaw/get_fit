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

# NOTES
# - Later on I may wish to pull calorie goals straight from MFP
# MFPcals.goals['calories']

now = arrow.now('US/Pacific')
thisMorning = now.floor('day')
thisEvening = now.ceil('day')

if len(sys.argv) == 4:
  inputDate = sys.argv[1]
  user = sys.argv[2]
  mfp = sys.argv[3]
  inputDate = arrow.get(inputDate, 'YYYY-MM-DD', tzinfo='US/Pacific')
  startDate = inputDate
  endDate = inputDate
elif len(sys.argv) == 5:
  firstDate = sys.argv[1]
  secondDate = sys.argv[2]
  user = sys.argv[3]
  mfp = sys.argv[4]
  firstDate = arrow.get(firstDate, 'YYYY-MM-DD', tzinfo='US/Pacific')
  secondDate = arrow.get(secondDate, 'YYYY-MM-DD', tzinfo='US/Pacific')
  if firstDate <= secondDate:
    startDate = firstDate
    endDate = secondDate
  elif firstDate > secondDate:
    startDate = secondDate
    endDate = firstDate
  else:
    sys.exit('Error parsing the dates you provided.')
else:
  sys.exit('You must provide a date and a user or a start date, end date, and user.')

print('Connecting to MongoDB database...')
secretJSON = open(os.path.join('config', 'secret', 'secret_config.json')).read()
secretConfig = json.loads(secretJSON)
secretPyConfig = secretConfig['python']

# This auth mechanism wasn't working for the longest time because port was being
# brought in as a string, not an Int!! This makes sense that it would have
# worked when specifying the URI though, because that entire thing is a string.
# It also didn't work because I was using 'user' instead of 'username'
# client = MongoClient(
#     host=secretPyConfig['host'],
#     port=int(secretPyConfig['port']),
#     username=secretPyConfig['user'],
#     password=secretPyConfig['password'],
#     authSource=secretPyConfig['authSource'],
#     authMechanism=secretPyConfig['authMechanism']
# )

# Previous version for connecting.
mongoURI = \
  "mongodb://" + \
  secretPyConfig['user'] + \
  ":" + \
  secretPyConfig['password'] + \
  "@" + \
  secretPyConfig['host'] + \
  ":" + \
  str(secretPyConfig['port']) + \
  "/" + \
  secretPyConfig['authSource'] + \
  "?authMechanism=" + \
  secretPyConfig['authMechanism']

client = MongoClient(mongoURI)

db = client.get_fit
entries = db.entries
possibleExercises = db.exercises

# Pull in the user's exercise groups
exerciseGroups = db.users.find_one({'username': user}, {'exerciseGroups': 1})

print('Pulling in MyFitnessPal information for ' + user.capitalize() + '...')

# Attempt to get password (yipes!) from environment
auth = os.environ.get('MFP_PASS_' + mfp.upper())
# If present, auth should be possible
authPossible = not not auth
# If we got it, our user should be able to log in, so we can enable login
MFPclient = myfitnesspal.Client(mfp, password=auth, login=authPossible)

for date in arrow.Arrow.range(frame='day', start=startDate, end=endDate, tz='US/Pacific'):
  print('Loading data from ' + date.format('MMMM DD, YYYY'))
  # Try/Except is mostly for if the API fails
  try:
    MFPcals = MFPclient.get_date(date.year, date.month, date.day)

    # Check to see if the totals object is empty. If so, the entry is most
    # likely empty, and we can just return zero values for everything
    if 'calories' in MFPcals.totals:
      totalCals = MFPcals.totals['calories']
      goalCals = MFPcals.goals['calories']
      netCals = goalCals - totalCals
      isEmpty = False
      calPoints = round((netCals / 100), 2)
    else:
      totalCals = 0
      goalCals = 0
      netCals = 0
      isEmpty = True
      calPoints = 0

  except:
    sys.exit('There was an error retrieving your data from MyFitnessPal.')

  # First we need to sanitize our exercise names. We can't rely on good inputs
  # because of things like connected apps auto-inserting exercises.

  # Pull in dictionaries from JSON. Later on I'll add this to MongoDB.

  # A specific error is better than a silent error
  try:
    MFPexer = MFPclient.get_exercise(date.year, date.month, date.day)
    exerEntries = MFPexer[0].entries

  except:
    print('We were not able to retrieve your exercise for this date!')

  print('Processing MyFitnessPal data...')

  # set up empty exercise array to handle multiple exercises in a day
  exercises = []
  totalExerPoints = 0

  # set up empty array especially to handle walking (via RunKeeper pocket track)
  walking = {
    'name': 'walking',
    'minutes': 0,
    'cals': 0,
    'points': 0,
    'icon': 'walking.png'
  }
  steps = {'name': 'steps', 'minutes': 0, 'cals': 0, 'points': 0, 'icon': 'walking.png'}

  # loop through all of the exercises in a day (if more than 0) This might be
  # ideal as a while loop, but this works fine too. I like it because we can
  # use _entry without manually counting.
  if len(exerEntries) > 0:
    for _entry in range(0, len(exerEntries)):

      # rename complex variables
      exerName = exerEntries[_entry].name.lower()
      exerMins = exerEntries[_entry]['minutes']
      exerCals = exerEntries[_entry]['calories burned']

      # Since exerEntries is an MFP Client object, we can't do a {}.get() on it
      # and provide a default value. So check for None here.
      if exerMins is None:
        exerMins = 0

      # To find our exercise, we have to generate substrings of the exercise
      # name. Let's scan our word for each length that is valid. We'll start
      # with the total length of the string and go down to a minimum length of
      # 3. Note: have to specify that range is decreasing
      exerNameSubstrings = utils.generate_substrings(exerName, escape=True)
      numberOfQueries = 0
      # Python has a for/else setup which lets us run the else block if the for
      # loop runs without a break.
      for substrings in exerNameSubstrings.values():
        regex = "^" + "$|^".join(substrings) + "$"
        # Instead of multiple queries, we can construct one regex for each
        # substring length to match with. That way we're only every hitting the
        # database for N - 3 times, where N is the length of the exercise name.
        exerNameRegex = bson.regex.Regex(regex)

        queryResults = utils \
          .query_exercise_group(username=user, exercise_name=exerNameRegex, database=db)
        numberOfQueries += 1
        exerciseGroups = list(queryResults)
        if exerciseGroups:
          # For now, let's just pull the first hit blindly. We're starting with
          # the longest possible query string, so if we found more than one hit
          # of the same length, they are likely of equal importance. We could
          # probably refine this more in the future by using Mongo's text search
          # function with scoring.
          exerciseGroup = exerciseGroups[0].get('exerciseGroup')
          # and we found our hit, so no need to query more!
          break

      # If no hits at all, use sensible defaults
      else:
        exerciseGroup = {"group": None, "pointsPerHour": 0, "exercises": exerName}

      pointsPerHour = exerciseGroup.get('pointsPerHour', 0)
      matchedExercise = exerciseGroup.get('exercises', exerName)

      # Assign icons. We have already assigned sanitized names, so we can do a
      # simply dictionary replacement.

      exerciseIconSearch = db.exercises.find_one(
        {
          'exercise': matchedExercise,
        }, {
          '_id': 0,
          'image': 1
        }
      )

      if exerciseIconSearch is None:
        exerciseIcon = 'exercise.png'
      else:
        exerciseIcon = exerciseIconSearch.get('image', 'exercise.png')

      points = (exerMins / 60) * pointsPerHour

      # NOW, if this is walking or step-counting, let's concatenate the values
      if matchedExercise == "walking":
        # let's use 2 decimal places for now, and then shorten to 1 after concat
        points = round(points, 2)
        walking['points'] += points
        walking['minutes'] += exerMins
        walking['cals'] += exerCals
      elif matchedExercise == "steps":
        try:
          # let's use 2 decimal places for now, and then shorten to 1 after concat
          points = round(points, 2)
          steps['points'] += points
          steps['cals'] += exerCals
          steps['minutes'] += exerMins
        except TypeError:
          print(matchedExercise + "could not be properly added")
      else:
        # Round to 1 decimal place
        points = round(points, 1)
        totalExerPoints += points

        # Leave out step-counting for now
        exercises.append(
          {
            'name': matchedExercise,
            'minutes': exerMins,
            'cals': exerCals,
            'points': points,
            'icon': exerciseIcon
          }
        )

  # Briefly, add the concatenated steps and walking to the exercise list if
  # they are non-zero.
  if walking['points'] > 0:
    # take the total number of points from walking and round them before saving
    walking['points'] = round(walking['points'], 1)
    # then add them to that day's total exercise points
    totalExerPoints += walking['points']
    exercises.append(walking)
  if steps['points'] > 0:
    # take the total number of points from walking and round them before saving
    steps['points'] = round(steps['points'], 1)
    # then add them to that day's total exercise points
    totalExerPoints += steps['points']
    exercises.append(steps)

  # Double check everything got rounded properly
  totalExerPoints = round(totalExerPoints, 1)
  calPoints = round(calPoints, 1)

  # If day is complete, total points!
  if MFPcals.complete:
    totalDaysPoints = calPoints + totalExerPoints
    totalDaysPoints = round(totalDaysPoints, 1)
  # Otherwise, if it's still the same day, give it 0 points
  elif thisMorning <= date <= thisEvening:
    totalDaysPoints = 0
  # Otherwise, if it's an old day, give it -3 points!
  else:
    totalDaysPoints = -3

  # construct object for db insertion
  MFPdata = {
    'date': date.datetime,
    'totalCals': totalCals,
    'goalCals': goalCals,
    'netCals': netCals,
    'exercise': exercises,
    'isEmpty': isEmpty,
    'complete': MFPcals.complete,
    'points': totalDaysPoints,
    'user': user,
    'lastUpdated': now.datetime
  }

  print('Writing data to MongoDB...')

  # First check to see if date already exists in DB OH MY GOD, the field order of
  # the query matters when querying by subdocument in mongodb!!!!! OH for the love
  # of hell!! We have to use this structure of query instead, where the order will
  # NOT matter
  # {'date.year': 2017, 'date.month': 9, 'date.day': 15}

  if entries.find_one({'date': date.datetime, 'user': user}):
    print('Found existing data for date, overwriting...')
    entries.update_one(
      {
        'date': date.datetime,
        'user': user
      }, {'$set': MFPdata}, upsert=False
    )
  else:
    print('No data found yet for this date, creating record...')
    entries.insert_one(MFPdata)
