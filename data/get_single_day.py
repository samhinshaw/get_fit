import myfitnesspal
import sys
import re
import json
import feather
import pandas as pd
import csv
# import pymongo
from datetime import datetime
from pymongo import MongoClient

## NOTES
# - Later on I may wish to pull calorie goals straight from MFP
# fitnessObject.goals['calories']

# receive arguments
# sys.argv[0] name of the script
year = sys.argv[1]  # first arg, year
month = sys.argv[2]  # second arg, month
day = sys.argv[3]  # third arg, day

# construct date object from passed date arguments
# IMPORTANT!!!!!
# Make sure these are treated as numeric values, not strings!!!
date = {'year': int(year), 'month': int(month), 'day': int(day)}

# date = sys.argv[1]

# insert false date

# date = datetime(2017, 9, 15)

print 'Connecting to MongoDB database...'
client = MongoClient('mongodb://localhost:27025/')
db = client.get_fit
sam = db.sam

print 'Pulling in MyFitnessPal information for Sam...'
samMFP = myfitnesspal.Client('jetknife')

fitnessObject = samMFP.get_date(date['year'], date['month'], date['day'])
totalCals = fitnessObject.totals['calories']
goalCals = fitnessObject.goals['calories']
netCals = goalCals - totalCals

dateExercise = samMFP.get_exercise(date['year'], date['month'], date['day'])
exerciseArray = []
if len(dateExercise[0].entries) > 0:
    for n in range(0, len(dateExercise[0].entries)):
        exerciseArray.append({
            'name':
            dateExercise[0].entries[n].name,
            'minutes':
            dateExercise[0].entries[n]['minutes'],
            'cals':
            dateExercise[0].entries[n]['calories burned']
        })

# construct object for db insertion
samSummary = {
    'date': date,
    'totalCals': totalCals,
    'goalCals': goalCals,
    'netCals': netCals,
    'exercise': exerciseArray
}

print 'Writing data to MongoDB...'

# First check to see if date already exists in DB OH MY GOD, the field order of
# the query matters when querying by subdocument in mongodb!!!!! OH for the love
# of hell!! We have to use this structure of query instead, where the order will
# NOT matter
# {'date.year': 2017, 'date.month': 9, 'date.day': 15}

if sam.find_one({
        'date.year': date['year'],
        'date.month': date['month'],
        'date.day': date['day']
}):
    print 'Found existing data for date, overwriting...'
    sam.update_one(
        {
            'date.year': date['year'],
            'date.month': date['month'],
            'date.day': date['day']
        }, {'$set': samSummary},
        upsert=False)
else:
    print 'No data found yet for this date, creating record...'
    sam.insert_one(samSummary)

# define how we get calorie summary
# def mapDateCals(year, month, day):
#     try:
#         date = samMFP.get_date(year, month, day)
#         calsOnDate = fitnessObject.totals['calories']
#         return calsOnDate
#     except:
#         return None

# define how we get exercise summary
# def mapDateEx(year, month, day):
#     try:
#         dateExercise = samMFP.get_exercise(year, month, day)
#         catFilename = 'temp/exercise/' + year + '_' + month + '_' + day + '_sam_exercise.json'
#         df = []
#         if len(dateExercise[0].entries) > 0:
#             for n in range(0, len(dateExercise[0].entries)):
#                 df.append({
#                     'name': dateExercise[0].entries[n].name,
#                     'minutes': dateExercise[0].entries[n]['minutes'],
#                     'cals': dateExercise[0].entries[n]['calories burned']
#                 })
#             with open(catFilename, 'w') as outfile:
#                 json.dump(df, outfile)
#         else:
#             return None
#     except:
#         return None