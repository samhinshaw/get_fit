"""
Python script for pulling user's data from MyFitnessPal
"""
import sys
# import re
# import json
# import feather
# import pandas as pd
# import csv
import arrow
from dateutil.tz import tzutc
# import pymongo
# from datetime import datetime
from pymongo import MongoClient
import myfitnesspal

## NOTES
# - Later on I may wish to pull calorie goals straight from MFP
# MFPcals.goals['calories']

############
# receive new date-string
inputDate = sys.argv[1]
user = sys.argv[2]

# insert false date
date = arrow.get(inputDate, 'YYYY-MM-DD', tzinfo=tzutc())
# dateObj = {'year': date.year, 'month': date.month, 'day': date.day}

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

# date = datetime(2017, 9, 15)

print 'Connecting to MongoDB database...'
client = MongoClient('mongodb://localhost:27025/')
db = client.get_fit

# Assign database collection and MFP connection
if user == 'sam':
    collection = db.sam
    MFPclient = myfitnesspal.Client('jetknife')
elif user == 'amelia':
    collection = db.amelia
    MFPclient = myfitnesspal.Client('ameliaho')
else:
    sys.exit('Could not find user "' + user + '" in the database.')

print 'Pulling in MyFitnessPal information for ' + user + '...'

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
    else:
        totalCals = 0
        goalCals = 0
        netCals = 0
        isEmpty = True

except:
    sys.exit('There was an error retrieving your data from MyFitnessPal.')

# A specific error is better than a silent error
try:
    MFPexer = MFPclient.get_exercise(date.year, date.month, date.day)
except:
    sys.exit('We were not able to retrieve your exercise for this date!')
exercises = []
if len(MFPexer[0].entries) > 0:
    for n in range(0, len(MFPexer[0].entries)):
        exercises.append({
            'name': MFPexer[0].entries[n].name,
            'minutes': MFPexer[0].entries[n]['minutes'],
            'cals': MFPexer[0].entries[n]['calories burned']
        })

# construct object for db insertion
MFPdata = {
    'date': date.datetime,
    'totalCals': totalCals,
    'goalCals': goalCals,
    'netCals': netCals,
    'exercise': exercises,
    'isEmpty': isEmpty
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

# define how we get calorie summary
# def mapDateCals(year, month, day):
#     try:
#         date = samMFP.get_date(year, month, day)
#         calsOnDate = MFPcals.totals['calories']
#         return calsOnDate
#     except:
#         return None

# define how we get exercise summary
# def mapDateEx(year, month, day):
#     try:
#         MFPexer = samMFP.get_exercise(year, month, day)
#         catFilename = 'temp/exercise/' + year + '_' + month + '_' + day + '_sam_exercise.json'
#         df = []
#         if len(MFPexer[0].entries) > 0:
#             for n in range(0, len(MFPexer[0].entries)):
#                 df.append({
#                     'name': MFPexer[0].entries[n].name,
#                     'minutes': MFPexer[0].entries[n]['minutes'],
#                     'cals': MFPexer[0].entries[n]['calories burned']
#                 })
#             with open(catFilename, 'w') as outfile:
#                 json.dump(df, outfile)
#         else:
#             return None
#     except:
#         return None