#!/bin/bash
echo "Running daily MFP update on `TZ=':America/Vancouver' date '+%Y-%m-%d'` at `TZ=':America/Vancouver' date '+%H:%M:%S'` (`TZ=':America/Vancouver' date +%Z`)."

## Setup platform detection
platform='unknown'
unamestr=`uname`
if [[ "$unamestr" == 'Linux' ]]; then
   platform='linux'
elif [[ "$unamestr" == 'Darwin' ]]; then
   platform='darwin'
fi

# Execute Python Scripts

# Differences:
# - Path to python Scripts
# - Method for getting yesterday's date from `date`
# - Explicit path to python to make sure we're using python3 from miniconda

if [[ $platform == 'linux' ]]; then
  # Change working directory
  cd /home/sam/projects/get_fit
  # Run Script for sam
  /home/sam/.miniconda3/bin/python data/getMFP.py `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'sam' 'jetknife'
  # Run Script for amelia
  /home/sam/.miniconda3/bin/python data/getMFP.py `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'amelia' 'ameliaho'
elif [[ $platform == 'darwin' ]]; then
  # Change working directory
  cd /Users/samhinshaw/projects/get_fit
  # Run Script for sam
  /Users/samhinshaw/.miniconda3/bin/python data/getMFP.py `TZ=':America/Vancouver' date -v-1d '+%Y-%m-%d'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'sam' 'jetknife'
  # Run Script for amelia
  /Users/samhinshaw/.miniconda3/bin/python data/getMFP.py `TZ=':America/Vancouver' date -v-1d '+%Y-%m-%d'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'amelia' 'ameliaho'
fi

## Notes

# Update yesterday and today
# python data/getMFP.py `TZ=':America/Vancouver' date '+%Y-%m-%d'` `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'` 'sam' 'jetknife'

# Both OSes get today 
# `TZ=':America/Vancouver' date '+%Y-%m-%d'`

# macOS get yesterday
# `TZ=':America/Vancouver' date -v-1d '+%Y-%m-%d'`

# Linux get yesterday
# `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'`