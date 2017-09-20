suppressMessages({
  library(shiny)
  library(tidyverse)
  library(googlesheets)
  library(magrittr)
  library(shinyjs)
  library(stringr)
  library(lubridate)
  library(rjson)
  library(zoo)
  library(feather)
})

source('functions.R')

# Set Goals:

samsCalGoal <- 1800
amsCalGoal  <- 1600

## Dates ----- 


# Get the current week
if (wday(today(), label = TRUE) == "Mon") {
  ThisMonday <- today()
} else {
  pastSevenDays <- as.interval(make_difftime(day = -7), today())
  pastSevenDaysChr <- as.character(pastSevenDays) %>% str_split("--") %>% unlist()
  listofDatesinPastSevenDays <- seq(as.Date(pastSevenDaysChr[2]),
                                    as.Date(pastSevenDaysChr[1]), by = "days")
  names(listofDatesinPastSevenDays) <- wday(listofDatesinPastSevenDays, label = TRUE)
  listofDatesinPastSevenDays <- head(listofDatesinPastSevenDays, n = 7)
  ThisMonday <- listofDatesinPastSevenDays["Mon"]
}

# Get Dates this week & Dates Last Week
lastWeek <- as.interval(make_difftime(day = -7), ThisMonday) %>% 
  as.character() %>% str_split("--") %>% unlist()
listOfDatesLastWeek <- seq(as.Date(lastWeek[2]),
                           as.Date(lastWeek[1]), by = "days")
names(listOfDatesLastWeek) <- wday(listOfDatesLastWeek, label = TRUE)
listOfDatesLastWeek %<>% head(7)

lastWeekDF <- data_frame(
  "date" = listOfDatesLastWeek,
  "day"  = names(listOfDatesLastWeek)
)

lastWeekInterval <- as.interval(make_difftime(day = -6), ymd(lastWeekDF$date[7]))

thisWeek <- as.interval(make_difftime(day = 7), ThisMonday) %>% 
  as.character() %>% str_split("--") %>% unlist()
listOfDatesThisWeek <- seq(as.Date(thisWeek[1]),
                           as.Date(thisWeek[2]), by = "days")
names(listOfDatesThisWeek) <- wday(listOfDatesThisWeek, label = TRUE)
listOfDatesThisWeek %<>% head(7)

thisWeekDF <- data_frame(
  "date" = listOfDatesThisWeek,
  "day"  = names(listOfDatesThisWeek)
)

## Write out Feathers for Python Script

fullListOfDates <- bind_rows('lastWeek' = lastWeekDF, 'thisWeek' = thisWeekDF, .id = 'week') %>% 
  separate(date, into = c('year', 'month', 'date'), sep = "-") %T>% 
  write_feather('temp/datesOfInterest.feather')


## Google Sheets Auth & Retrieval -----
load('samGStoken.rds')
gs_auth(token = myToken)
# gd_token()
gs_user()

my_sheets <- gs_ls()

# Sam's Sheets

if ( my_sheets %>% filter(sheet_title == 'Sam_Weight') %>% extract2('updated') > 
     file.mtime('data/sam_weight_sheet.feather') ) {
  sam_weight_sheet <- gs_title("Sam_Weight")
  sam_weight_sheet <- gs_read(ss = sam_weight_sheet, col_names = c("date", "weight"))
  sam_weight_sheet %<>% mutate(date = str_sub(date, end = -12))
  sam_weight_sheet %<>% mutate(date = mdy(date))
  write_feather(sam_weight_sheet, 'data/sam_weight_sheet.feather')
} else {
  sam_weight_sheet <- read_feather('data/sam_weight_sheet.feather')
}

if ( my_sheets %>% filter(sheet_title == 'Sam_Exercise') %>% extract2('updated') > 
     file.mtime('data/sam_exercise_sheet.feather') ) {
  sam_exercise_sheet <- gs_title("Sam_Exercise")
  sam_exercise_sheet <- gs_read(ss = sam_exercise_sheet, col_names = c("date", "minutesExercised", "type"))
  sam_exercise_sheet %<>% mutate(date = str_sub(date, end = -12))
  sam_exercise_sheet %<>% mutate(date = mdy(date))
  write_feather(sam_exercise_sheet, 'data/sam_exercise_sheet.feather')
} else {
  sam_exercise_sheet <- read_feather('data/sam_exercise_sheet.feather')
}

## Check calorie results and run python script IF it wasn't updated today

if (today() > as.Date(format(file.mtime('temp/sam_MFP_calories.feather'), '%Y-%m-%d'))) {
  if (tolower(Sys.info()['nodename']) == 'samdesktop') {
    print('Updating MFP info via Python API')
    system2('/home/shinshaw/miniconda2/bin/python', args = c('get_calories.py'))
  } else {
    print('Updating MFP info via Python API')
    system2('/Users/samhinshaw/.miniconda2/bin/python', args = c('get_calories.py'))
  }
  sam_cals_sheet <- read_feather('temp/sam_MFP_calories.feather')
} else {
  sam_cals_sheet <- read_feather('temp/sam_MFP_calories.feather')
}

sam_sheet_full <- sam_cals_sheet %>% 
  dplyr::mutate(jsonFilename = paste0('temp/exercise/', year, '_', month, '_', date, '_sam_exercise.json')) %>% 
  dplyr::mutate(exercise = map(jsonFilename, mapMyJSON)) %>% unnest() %>% 
  select(-jsonFilename) %>% rename('calsBurnt' = 'cals1')

sam_sheet_full %<>% 
  unite(col = date, year, month, date, sep = "-") %>% 
  mutate(date = as.Date(date)) %>% 
  mutate(cals = as.numeric(cals)) %>% 
  mutate(calsRem = samsCalGoal - cals + calsBurnt)

# Amelia

if ( my_sheets %>% filter(sheet_title == 'Am_Exercise') %>% extract2('updated') > 
     file.mtime('data/am_exercise_sheet.feather') ) {
  am_exercise_sheet <- gs_title("Am_Exercise")
  am_exercise_sheet <- gs_read(ss = am_exercise_sheet, col_names = c("date", "minutesExercised", "type"))
  am_exercise_sheet %<>% mutate(date = str_sub(date, end = -12))
  am_exercise_sheet %<>% mutate(date = mdy(date))
  write_feather(am_exercise_sheet, 'data/am_exercise_sheet.feather')
} else {
  am_exercise_sheet <- read_feather('data/am_exercise_sheet.feather')
}


## Check calorie results and run python script IF it wasn't updated today

if (today() > as.Date(format(file.mtime('temp/am_MFP_calories.feather'), '%Y-%m-%d'))) {
  system2('/Users/samhinshaw/.miniconda2/bin/python', args = c('get_calories.py'))
  am_cals_sheet <- read_feather('temp/am_MFP_calories.feather')
} else {
  am_cals_sheet <- read_feather('temp/am_MFP_calories.feather')
}

am_sheet_full <- am_cals_sheet %>% 
  dplyr::mutate(jsonFilename = paste0('temp/exercise/', year, '_', month, '_', date, '_am_exercise.json')) %>% 
  dplyr::mutate(exercise = map(jsonFilename, mapMyJSON)) %>% unnest() %>% 
  select(-jsonFilename) %>% rename('calsBurnt' = 'cals1')

am_sheet_full %<>% 
  unite(col = date, year, month, date, sep = "-") %>% 
  mutate(date = as.Date(date)) %>% 
  mutate(cals = as.numeric(cals)) %>% 
  mutate(calsRem = amsCalGoal - cals + calsBurnt)


###########################################
#                                         #
#                This Week                #
#                                         #
###########################################

ThisWeekSoFar <- interval(ThisMonday, today())

###### Sam ######

# Clean up exercise names to fit with point system

sam_points_sheet <- sam_sheet_full %>% 
  rowwise() %>% 
  dplyr::mutate(name = cleanExerciseNames(name)) %>% 
  dplyr::mutate(exPoints = calculateExPoints(name, minutes) %>% round(3)) %>% 
  dplyr::mutate(calPoints = calculateCalPoints(calsRem) %>% round(3)) %>% 
  ungroup() %>% 
  group_by(date) %>% 
  summarize(
    day = head(day, 1),
    week = head(week, 1),
    cals = head(cals, 1),
    calsBurnt = head(calsBurnt, 1),
    name = paste0(list(name), collapse = "\\n"),
    minutes  = paste0(list(minutes), collapse = "\\n"),
    calsRem = head(calsRem, 1),
    exPoints = sum(exPoints), 
    calPoints = head(calPoints, 1)
  ) %>% 
  mutate(totalPoints = exPoints + calPoints)

sam_points_summary <- sam_points_sheet %>% 
  group_by(week) %>% 
  summarize(points = totalPoints %>% sum() %>% round())

SamTotalPointsThisWeek <- sam_points_summary %>% 
  filter(week == 'thisWeek') %>% 
  extract2('points')

SamTotalPointsLastWeek <- sam_points_summary %>% 
  filter(week == 'lastWeek') %>% 
  extract2('points')


###### Am ######

# Clean up exercise names to fit with point system

am_points_sheet <- am_sheet_full %>% 
  rowwise() %>% 
  mutate(name = cleanExerciseNames(name)) %>% 
  mutate(exPoints = calculateExPoints(name, minutes) %>% round(3)) %>% 
  mutate(calPoints = calculateCalPoints(calsRem) %>% round(3)) %>% 
  ungroup() %>% 
  group_by(date) %>% 
  summarize(
    day = head(day, 1),
    week = head(week, 1),
    cals = head(cals, 1),
    calsBurnt = head(calsBurnt, 1),
    name = paste0(list(name), collapse = "\\n"),
    minutes  = paste0(list(minutes), collapse = "\\n"),
    calsRem = head(calsRem, 1),
    exPoints = sum(exPoints), 
    calPoints = head(calPoints, 1)
  ) %>% 
  mutate(totalPoints = exPoints + calPoints)

am_points_summary <- am_points_sheet %>% 
  group_by(week) %>% 
  summarize(points = totalPoints %>% sum() %>% round())

AmTotalPointsThisWeek <- am_points_summary %>% 
  filter(week == 'thisWeek') %>% 
  extract2('points')

AmTotalPointsLastWeek <- am_points_summary %>% 
  filter(week == 'lastWeek') %>% 
  extract2('points')

# Separate for Display Charts

samDisplayThisWeek <- sam_points_sheet %>% 
  filter(week == 'thisWeek') %>% 
  mutate(exPoints = round(exPoints)) %>% 
  mutate(totalPoints = round(totalPoints)) %>% 
  mutate(date = format(date, '%b %d')) %>% 
  select(-week, -exPoints, -calPoints) %>% 
  rename('exercise' = 'name', 'points' = 'totalPoints')
  
samDisplayThisWeek %<>% 
  mutate(exercise = str_replace(exercise, 'c\\(', '')) %>% 
  mutate(exercise = str_replace(exercise, '\\)', '')) %>% 
  mutate(exercise = str_replace_all(exercise, '"', '')) %>% 
  mutate(exercise = str_replace(exercise, ', ', '<br>')) %>% 
  mutate(minutes = str_replace(minutes, 'c\\(', '')) %>% 
  mutate(minutes = str_replace(minutes, '\\)', '')) %>% 
  mutate(minutes = str_replace_all(minutes, '"', '')) %>% 
  mutate(minutes = str_replace(minutes, ', ', '<br>')) %>% 
  ##
  mutate(exercise = str_replace(exercise, 'NA', '')) %>% 
  mutate(calsRem = str_replace(calsRem, 'NA', '')) %>% 
  mutate(minutes = str_replace(minutes, '0', '')) %>% 
  mutate(calsBurnt = str_replace(calsBurnt, '0', '')) %>% 
  ##
  rename('cals remaining' = 'calsRem', 
         'cals burned' = 'calsBurnt', 
         'cals in' = 'cals')
# Amelia

amDisplayThisWeek <- am_points_sheet %>% 
  filter(week == 'thisWeek') %>% 
  mutate(exPoints = round(exPoints)) %>% 
  mutate(totalPoints = round(totalPoints)) %>% 
  mutate(date = format(date, '%b %d')) %>% 
  select(-week, -exPoints, -calPoints) %>% 
  rename('exercise' = 'name', 'points' = 'totalPoints')

amDisplayThisWeek %<>% 
  mutate(exercise = str_replace(exercise, 'c\\(', '')) %>% 
  mutate(exercise = str_replace(exercise, '\\)', '')) %>% 
  mutate(exercise = str_replace_all(exercise, '"', '')) %>% 
  mutate(exercise = str_replace(exercise, ', ', '<br>')) %>% 
  mutate(minutes = str_replace(minutes, 'c\\(', '')) %>% 
  mutate(minutes = str_replace(minutes, '\\)', '')) %>% 
  mutate(minutes = str_replace_all(minutes, '"', '')) %>% 
  mutate(minutes = str_replace(minutes, ', ', '<br>')) %>% 
  ##
  mutate(exercise = str_replace(exercise, 'NA', '')) %>% 
  mutate(calsRem = str_replace(calsRem, 'NA', '')) %>% 
  mutate(minutes = str_replace(minutes, '0', '')) %>% 
  mutate(calsBurnt = str_replace(calsBurnt, '0', '')) %>% 
  ##
  rename('cals remaining' = 'calsRem', 
         'cals burned' = 'calsBurnt', 
         'cals in' = 'cals')

###########################################
#                                         #
#                Last Week                #
#                                         #
###########################################

# using pre-calculated lastWeekInterval

###### Sam ######

# Separate for Display Charts

samDisplayLastWeek <- sam_points_sheet %>% 
  filter(week == 'lastWeek') %>% 
  mutate(exPoints = round(exPoints)) %>% 
  mutate(totalPoints = round(totalPoints)) %>% 
  mutate(date = format(date, '%b %d')) %>% 
  select(-week, -exPoints, -calPoints) %>% 
  rename('exercise' = 'name', 'points' = 'totalPoints')

samDisplayLastWeek %<>% 
  mutate(exercise = str_replace(exercise, 'c\\(', '')) %>% 
  mutate(exercise = str_replace(exercise, '\\)', '')) %>% 
  mutate(exercise = str_replace_all(exercise, '"', '')) %>% 
  mutate(exercise = str_replace(exercise, ', ', '<br>')) %>% 
  mutate(minutes = str_replace(minutes, 'c\\(', '')) %>% 
  mutate(minutes = str_replace(minutes, '\\)', '')) %>% 
  mutate(minutes = str_replace_all(minutes, '"', '')) %>% 
  mutate(minutes = str_replace(minutes, ', ', '<br>')) %>% 
  ##
  mutate(exercise = str_replace(exercise, 'NA', '')) %>% 
  mutate(calsRem = str_replace(calsRem, 'NA', '')) %>% 
  mutate(minutes = str_replace(minutes, '0', '')) %>% 
  mutate(calsBurnt = str_replace(calsBurnt, '0', '')) %>% 
  ##
  rename('cals remaining' = 'calsRem', 
         'cals burned' = 'calsBurnt', 
         'cals in' = 'cals')
# Amelia

amDisplayLastWeek <- am_points_sheet %>% 
  filter(week == 'lastWeek') %>% 
  mutate(exPoints = round(exPoints)) %>% 
  mutate(totalPoints = round(totalPoints)) %>% 
  mutate(date = format(date, '%b %d')) %>% 
  select(-week, -exPoints, -calPoints) %>% 
  rename('exercise' = 'name', 'points' = 'totalPoints')

amDisplayLastWeek %<>% 
  mutate(exercise = str_replace(exercise, 'c\\(', '')) %>% 
  mutate(exercise = str_replace(exercise, '\\)', '')) %>% 
  mutate(exercise = str_replace_all(exercise, '"', '')) %>% 
  mutate(exercise = str_replace(exercise, ', ', '<br>')) %>% 
  mutate(minutes = str_replace(minutes, 'c\\(', '')) %>% 
  mutate(minutes = str_replace(minutes, '\\)', '')) %>% 
  mutate(minutes = str_replace_all(minutes, '"', '')) %>% 
  mutate(minutes = str_replace(minutes, ', ', '<br>')) %>% 
  ##
  mutate(exercise = str_replace(exercise, 'NA', '')) %>% 
  mutate(calsRem = str_replace(calsRem, 'NA', '')) %>% 
  mutate(minutes = str_replace(minutes, '0', '')) %>% 
  mutate(calsBurnt = str_replace(calsBurnt, '0', '')) %>% 
  ##
  rename('cals remaining' = 'calsRem', 
         'cals burned' = 'calsBurnt', 
         'cals in' = 'cals')