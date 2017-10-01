# Get Fit!




## Features to Implement

Back End  
- ~~Redo models~~: 
    + ~~User~~
        + ~~Name~~
        + ~~Username~~
        + ~~Email~~
        + ~~Password~~
        + ~~Calorie Goal (calGoal)~~
        + ~~Current Points (currentPoints)~~
    + ~~Entries~~
        + ~~netCals~~
        + ~~totalCals~~
        + ~~points~~
        + ~~isEmpty~~
        + ~~goalCals~~
        + ~~date~~
        + ~~exercise~~
    + ~~Period~~
        + ~~startDate~~
        + ~~endDate~~
        + ~~points~~
        + ~~user~~
- ~~Calculate points earned~~  
    + ~~By day, in total, and in the past two weeks~~
- Store points in database for retrieval
    + Right now, points from a given timespan are calculated from daily point earnings **every time** the page renders
    + Cache calculations in front end
    + Update point calculations only when post request is made to update data
- Now we need framework for sending requests and getting approval
    + Requests tab for each user?
    + Email notification? (Get fit logo + Sam has requested a reward!)

- Implement authentication so we know who is logged in

- Implement spending points  
    + ~~create entry in db for request.~~  
    + ~~store bool states for 'agreedTo' and 'fulfilled'~~  
    + message through IFTTT prompting the receiver to check the request. 
    + when they're alone, they can check the request and accept or decline

Front End  
- Transition animations between tabs!  
    + abrupt transition between similar looking tabs is jarring
- Theme body in the same color as the hero
    + shrink the main containers so the app has a card view (on desktop only)
- Cache middleware
- Change view engine to pull period database?
- Display two week period rolling points
- Display week's points on Sunday (on left of 'feed')
- Redesign app with Bulma Tiles

Update Sept 30th, 2017
Design
- Remove `display: flex` from landing-page hero to allow columns to properly resize
- HOWEVER, need to figure out how to vertically center columns then
Perhaps update media elements of 'days' to make them cards or tiles instead of media

Change all instances of 'purchases' to 'requests' for better semantics
Format dates of requests with `moment.format()`
