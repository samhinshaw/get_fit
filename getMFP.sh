#!/bin/bash
echo "Running daily MFP update on `TZ=':America/Vancouver' date '+%Y-%m-%d'` at `TZ=':America/Vancouver' date '+%H:%M:%S'` (`TZ=':America/Vancouver' date +%Z`)."


## Execute Python Scripts

# Change working directory
cd /app
# Run Script for sam
python data/getMFP.py `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'sam' 'jetknife'
# Run Script for amelia
python data/getMFP.py `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'` `TZ=':America/Vancouver' date '+%Y-%m-%d'` 'amelia' 'ameliaho'

## Notes

# Update yesterday and today
# python data/getMFP.py `TZ=':America/Vancouver' date '+%Y-%m-%d'` `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'` 'sam' 'jetknife'

# Both OSes get today
# `TZ=':America/Vancouver' date '+%Y-%m-%d'`

# macOS get yesterday
# `TZ=':America/Vancouver' date -v-1d '+%Y-%m-%d'`

# Linux get yesterday
# `TZ=':America/Vancouver' date '+%Y-%m-%d' -d 'yesterday'`
