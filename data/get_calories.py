import myfitnesspal
# import sys
import re
import json
import feather
import pandas as pd
import csv
# import os.path

# sys.argv[0] - script name
# sys.argv[1] - year
# sys.argv[2] - month
# sys.argv[3] - day

# Sam First!

datesOfInterest = feather.read_dataframe('temp/datesOfInterest.feather')

print 'Pulling in MyFitnessPal information for Sam...'
samMFP = myfitnesspal.Client('jetknife')

samCals = datesOfInterest

#### TESTING

# dateSummary = samMFP.get_date('2017', '08', '19')
# dateExercise = samMFP.get_exercise('2017', '08', '22')

######

# Define function with error handling to map IDs to reactions_of_compound

# was getting error trying to include the MFP client object as an argument, so embedded it into the function definition instead
def mapDatesToSamCals(year, month, day):
    try:
        date = samMFP.get_date(year, month, day)
        calsOnDate = date.totals['calories']
        return calsOnDate
    except:
        return None

def mapDatesToSamCalsBurnt(year, month, day):
    try:
        dateExercise = samMFP.get_exercise(year, month, day)
        calsBurnt = 0
        for n in range(0, len(dateExercise[0].entries)):
            calsBurnt = calsBurnt + dateExercise[0].entries[n]['calories burned']
        return calsBurnt
    except:
        return None

def mapDatesToSamExercise(year, month, day):
    try:
        dateExercise = samMFP.get_exercise(year, month, day)
        catFilename = 'temp/exercise/' + year + '_' + month + '_' + day + '_sam_exercise.json'
        df = []
        if len(dateExercise[0].entries) > 0:
            for n in range(0, len(dateExercise[0].entries)):
                df.append({'name': dateExercise[0].entries[n].name, 'minutes': dateExercise[0].entries[n]['minutes'], 'cals': dateExercise[0].entries[n]['calories burned']})
            with open(catFilename, 'w') as outfile:
                    json.dump(df, outfile)
        else:
            return None
    except:
        return None

print 'Pulling meal information for Sam...'
samCals["cals"] = ""
samCals["cals"] = samCals.apply(lambda l: map(mapDatesToSamCals, samCals['year'], samCals['month'], samCals['date']))

# print 'Pulling calories burnt information for Sam...'
# samCals["calsBurnt"] = ""
# samCals["calsBurnt"] = samCals.apply(lambda l: map(mapDatesToSamCalsBurnt, samCals['year'], samCals['month'], samCals['date']))

print 'Pulling exercise information for Sam...'
samCals.apply(lambda l: map(mapDatesToSamExercise, samCals['year'], samCals['month'], samCals['date']))

feather.write_dataframe(samCals, 'temp/sam_MFP_calories.feather')

# Now Amelia!
print 'Pulling in MyFitnessPal information for Amelia...'
AmMFP = myfitnesspal.Client('ameliaho')

amCals = datesOfInterest

# Define function with error handling to map IDs to reactions_of_compound

# was getting error trying to include the MFP client object as an argument, so embedded it into the function definition instead
def mapDatesToAmCals(year, month, day):
    try:
        date = AmMFP.get_date(year, month, day)
        calsOnDate = date.totals['calories']
        return calsOnDate
    except:
        return None

def mapDatesToAmCalsBurnt(year, month, day):
    try:
        dateExercise = AmMFP.get_exercise(year, month, day)
        calsBurnt = 0
        for n in range(0, len(dateExercise[0].entries)):
            calsBurnt = calsBurnt + dateExercise[0].entries[n]['calories burned']
        return calsBurnt
    except:
        return None

print 'Pulling meal information for Amelia...'
amCals["cals"] = ""
amCals["cals"] = amCals.apply(lambda l: map(mapDatesToAmCals, amCals['year'], amCals['month'], amCals['date']))

# print 'Pulling calories burned information for Amelia...'
# amCals["calsBurnt"] = ""
# amCals["calsBurnt"] = amCals.apply(lambda l: map(mapDatesToAmCalsBurnt, amCals['year'], amCals['month'], amCals['date']))

feather.write_dataframe(amCals, 'temp/am_MFP_calories.feather')
