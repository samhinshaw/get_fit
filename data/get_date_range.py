"""
Pull user's data from MyFitnessPal
"""
# since we're using python 2, we need to import this. OTHERWISE when calculating
# points for exercise we get stuck with 0s because int/int = int. So 14/15 = 0.
# SUCKS!!! I should switch to python 3.
from __future__ import division
import sys  # for system operations such as exit status codes
import re  # regex library
import json  # for parsing json
# import os
# import feather
# import pandas as pd
# import csv
import arrow  # datetime handling
from dateutil.tz import tzutc  # timezone functions
# import pymongo
# from datetime import datetime
from pymongo import MongoClient  # mongodb operations
import myfitnesspal  # myfitnesspal API!

## NOTES
# - Later on I may wish to pull calorie goals straight from MFP
# MFPcals.goals['calories']

############
# receive new date-string
try:
    firstDate = sys.argv[1]
    secondDate = sys.argv[2]
    user = sys.argv[3]
except:
    sys.exit("""
    This script requires 3 arguments:
    1. The date you wish to query FROM (earlier in time). 
    2. The date you wish to query TO (later in time). 
    3. The user whose data you wish to query. 
    """)
# date = arrow.get(inputDate, 'YYYY-MM-DD', tzinfo=tzutc())
# now = arrow.utcnow()
firstDate = arrow.get(firstDate, 'YYYY-MM-DD', tzinfo='US/Pacific')
secondDate = arrow.get(secondDate, 'YYYY-MM-DD', tzinfo='US/Pacific')
# now = arrow.now('US/Pacific')
# dateObj = {'year': date.year, 'month': date.month, 'day': date.day}

# make sure args passed in proper order
if firstDate < secondDate:
    startDate = firstDate
    endDate = secondDate
elif firstDate > secondDate:
    startDate = secondDate
    endDate = firstDate
elif firstDate == secondDate:
    sys.exit('You supplied the same date twice!')
else:
    sys.exit('Error parsing the dates you provided.')

############

# receive arguments
# sys.argv[0] name of the script
# year = sys.argv[1]  # first arg, year
# month = sys.argv[2]  # second arg, month
# day = sys.argv[3]  # third arg, day
# user = sys.argv[4]

# construct date object from passed date arguments
# IMPORTANT!!!!!
# Make sure these are treated as numeric values, not strings!!!
# date = {'year': int(year), 'month': int(month), 'day': int(day)}

# if we want to insert fake date
# date = datetime(2017, 9, 15)

### Import JSON Dictionaries ###
# This will potentially be replaced by mongoDB entries down the line

#  probably should use os.path.join here
dictFile = open('data/exerciseIconDictionary.json')
parsedDict = dictFile.read()
exerciseDict = json.loads(parsedDict)['exercises']
iconDict = json.loads(parsedDict)['icons']
exerTypeDict = json.loads(parsedDict)['exerciseTypes']

print 'Connecting to MongoDB database...'
client = MongoClient('mongodb://localhost:27025/')
db = client.get_fit

print 'Pulling in MyFitnessPal information for ' + user + '...'

# Assign database collection and MFP connection
if user == 'sam':
    collection = db.sam
    MFPclient = myfitnesspal.Client('jetknife')
elif user == 'amelia':
    collection = db.amelia
    MFPclient = myfitnesspal.Client('ameliaho')
else:
    sys.exit('Could not find user "' + user + '" in the database.')

# Calculate points based on that day's statistics!
# Current values are:
# NET CALS:
#   - netCals >= 0    //  1pt
#   - netCals < 0     //  0pt
#   - netCals < -300  // -1pt
#   - isEmpty == True // -1pt
# Exercise!
#   - flex   = 1pt/60min
#   - cardio = 1pt/30min
#   - XT     = 1pt/15min

# queryDates = []
for date in arrow.Arrow.range(
        frame='day', start=startDate, end=endDate, tz='US/Pacific'):
    print 'Loading data from ' + date.format('MMMM DD, YYYY')
    # queryDates.extend(date)

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

            if netCals >= 0:
                calPoints = 1
            elif netCals < -300:
                calPoints = -1
            else:
                calPoints = 0
        else:
            totalCals = 0
            goalCals = 0
            netCals = 0
            isEmpty = True
            calPoints = -1

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
        sys.exit('We were not able to retrieve your exercise for this date!')

    print 'Processing MyFitnessPal data...'

    # set up empty exercise array to handle multiple exercises in a day
    exercises = []
    totExerPoints = 0

    # loop through all of the exercises in a day (if more than 0)
    if len(exerEntries) > 0:
        for n in range(0, len(exerEntries)):

            # rename complex variables
            exerName = exerEntries[n].name.lower()
            exerMins = exerEntries[n]['minutes']
            exerCals = exerEntries[n]['calories burned']

            exerciseHits = []
            # check for exercises and set name to key
            for key in exerciseDict:
                # .group(0) to extract result from match object
                exerNameMatch = re.search(key, exerName)
                # if match was found, pull out answer!
                # DOES NOT HANDLE MULTIPLES
                # Will only pull LAST hit
                if exerNameMatch is not None:
                    matchedEx = exerNameMatch.group(0)
                    # then change from key to value
                    exerciseHits.extend([exerciseDict[matchedEx]])

            # After searching, if no hits keep original
            if len(exerciseHits) == 0:
                renamedEx = exerName
            elif len(exerciseHits) == 1:
                renamedEx = exerciseHits[0]
            elif len(exerciseHits) > 1:
                print("We found more than one hit for this exercise. '" +
                      exerName + "' mapped to all of these hits: " +
                      ', '.join(exerciseHits) +
                      ". By default, we will map to the first hit, " +
                      exerciseHits[0])
                renamedEx = exerciseHits[0]
            else:
                print "No hits!"
                renamedEx = exerName

            # Assign icons. We have already assigned sanitized names, so we can do a
            # simply dictionary replacement.
            try:
                exerIcon = iconDict[renamedEx]
            # if no hits, use generic exercise icons
            except:
                exerIcon = 'exercise.png'

            # award points based on workout type
            if renamedEx in exerTypeDict["coolDown"]:
                points = (exerMins / 60)
            elif renamedEx in exerTypeDict["cardio"]:
                points = (exerMins / 30)
            elif renamedEx in exerTypeDict["crossTrain"]:
                points = (exerMins / 15)
            else:
                points = 0

            # Then round to 2 decimal places
            points = round(points, 1)

            totExerPoints += points

            exercises.append({
                'name': renamedEx,
                'minutes': exerMins,
                'cals': exerCals,
                'points': points,
                'icon': exerIcon
            })

    # Double check everything got rounded properly
    totExerPoints = round(totExerPoints, 1)
    calPoints = round(calPoints, 1)
    # Final tally of points, add exercise points + calorie points
    totalDaysPoints = calPoints + totExerPoints
    totalDaysPoints = round(totalDaysPoints, 1)

    # construct object for db insertion
    MFPdata = {
        'date': date.datetime,
        'totalCals': totalCals,
        'goalCals': goalCals,
        'netCals': netCals,
        'exercise': exercises,
        'isEmpty': isEmpty,
        'points': totalDaysPoints
        # 'lastUpdated': now.datetime
    }

    print 'Writing data to MongoDB...'

    # First check to see if date already exists in DB OH MY GOD, the field order of
    # the query matters when querying by subdocument in mongodb!!!!! OH for the love
    # of hell!! We have to use this structure of query instead, where the order will
    # NOT matter
    # {'date.year': 2017, 'date.month': 9, 'date.day': 15}

    if collection.find_one({'date': date.datetime}):
        print 'Found existing data for date, overwriting...'
        collection.update_one(
            {
                'date': date.datetime
            }, {'$set': MFPdata}, upsert=False)
    else:
        print 'No data found yet for this date, creating record...'
        collection.insert_one(MFPdata)
