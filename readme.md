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
    + ~~Requests tab for each user?~~
    + Email notification? (Get fit logo + Sam has requested a reward!)

- Implement authentication so we know who is logged in

- Implement spending points  
    + ~~create entry in db for request.~~  
    + ~~store bool states for 'agreedTo' and 'fulfilled'~~  
    + message through IFTTT prompting the receiver to check the request. 
    + when they're alone, they can check the request and accept or decline
    + allow for user to respond to request (AJAX or POST?)

Front End  
- Transition animations between tabs!  
    + abrupt transition between similar looking tabs is jarring
- Cache middleware
- Change view engine to pull period database?
- Display two week period rolling points
- Display week's points on Sunday (on left of 'feed')
- Redesign app with Bulma Tiles

Update Sept 30th, 2017
Design
- ~~Remove `display: flex` from landing-page hero to allow columns to properly resize~~
- ~~HOWEVER, need to figure out how to vertically center columns then~~

Perhaps update media elements of 'days' to make them cards or tiles instead of media
Change all instances of 'purchases' to 'requests' for better semantics
Format dates of requests with `moment.format()`

Sketch out the layout of the app!
- What will our overview be?
    + How do we make this look really good?
- Where do we locate a detailed day-by-day breakdown?
- How do we best display information on the user page?

Then we can fix things. 
- Stop using static 'sam' & 'amelia' routes.
    + Switch to 'user' and 'partner' instead

Switch from using 'is-danger' (etc) classes to style different pages! Instead we should be specifying the page and then we'll style it differently ourselves.  