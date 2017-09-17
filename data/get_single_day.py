import myfitnesspal
# import sys
import re
import json
import feather
import pandas as pd
import csv
# import pymongo
from pymongo import MongoClient

## NOTES
# - Later on I may wish to pull calorie goals straight from MFP
# fitnessObject.goals['calories']

print 'Connecting to MongoDB database...'
client = MongoClient('mongodb://localhost:27025/')
db = client.get_fit
sam = db.sam

print 'Pulling in MyFitnessPal information for Sam...'
samMFP = myfitnesspal.Client('jetknife')

# insert fake date for now
date = {'year': 2017, 'month': 9, 'day': 15}

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

# First check to see if date already exists in DB

if sam.find_one({'date': date}):
    print 'Found existing data for date, overwriting...'
    sam.update_one({'date': date}, {"$set": samSummary}, upsert=False)
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