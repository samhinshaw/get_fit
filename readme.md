# Get Fit!




## Features to Implement

Back End  
- ~~Calculate points earned~~  
    + ~~By day, in total, and in the past two weeks~~
- Store points in database for retrieval
    + Right now, points from a given timespan are calculated from daily point earnings **every time** the page renders
    + Update point calculations only when post request is made to update data

- Implement authentication so we know who is logged in

- Implement spending points  
    + create entry in db for request. 
    + store bool states for 'agreedTo' and 'fulfilled' 
    + message through IFTTT prompting the receiver to check the request. 
    + when they're alone, they can check the request and accept or decline

Front End  
- Transition animations between tabs!  
    + abrupt transition between similar looking tabs is jarring
- Theme body in the same color as the hero
    + shrink the main containers so the app has a card view (on desktop only)