#!/bin/bash
echo "Running daily MFP update on `date '+%Y-%m-%d'` at `date '+%H:%M:%S'`."
# Using a special python script here to be sure we're being consistent with
# datetime handling, because it can be so finicky!! I'd rather manage two python
# scripts than add a new datetime/timezone implementation to handle!
python /home/sam/projects/get_fit/data/getDailyMFP.py 'sam' 'jetknife' 
python /home/sam/projects/get_fit/data/getDailyMFP.py 'amelia' 'ameliaho'