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


if [[ $platform == 'linux' ]]; then
   python /home/sam/projects/get_fit/data/getMFP.py `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'sam' 'jetknife'
   python /home/sam/projects/get_fit/data/getMFP.py `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'amelia' 'ameliaho'
elif [[ $platform == 'darwin' ]]; then
   python /Users/samhinshaw/projects/get_fit/data/getMFP.py `TZ=':America/Vancouver' date -v-1d '+%Y-%m-%d'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'sam' 'jetknife'
   python /Users/samhinshaw/projects/get_fit/data/getMFP.py `TZ=':America/Vancouver' date -v-1d '+%Y-%m-%d'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'amelia' 'ameliaho'
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