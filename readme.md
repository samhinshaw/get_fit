# Get Fit!

## Notes

### Authentication Cookies

To get a url with authentication, we just need to pass the authentication cookie! Get the authentication cookie from an authenticated session with browser dev tools: [Application] -> [Cookies], and replace `<cookie string>` with the value, and (if necessary), `connect.sid` with the cookie name. 

For `curl`:

```
curl --cookie "connect.sid=<cookie string>" http://localhost:8005/user
```

For ApacheBench (`ab`):

```
ab -k -c 20 -n 250 -C "connect.sid=<cookie string>" "http://localhost:8005/user"
```

### GPG Signing

Check out [this reference](https://gist.github.com/danieleggert/b029d44d4a54b328c0bac65d46ba4c65) for signing commits with GPG keys. Note that to get the pinentry program to prompt you for your passphrase, you need to OMIT the line `no-tty`!!

## Important!!

- Change Flash Messaging Placeholder on Register Page

## Features to Implement

- Edit start date in user prefs
- Change account options in user prefs
- Save current calorie goal and weight from MFP in user data
- Handle signup flow for if no partner yet
- Styling bulma classes on registering inputs
- Live-checking of whether usernames, etc are taken
- Implement user storage of MFP passwords??
- Fix the fact that the primary color and the hover color are the same!
- ~~Fix exercise icon being on different level than text~~
    + Fix text overflow on small screen
- Make it so an exercise/day card 'update' button is enabled anytime the parent element is clicked.
- Implement last logged in value (either via passport.js or by storing in DB) and use it to see if a request was made or gift was sent since last access. If true, display popup modal. 
- Refactor point tallying. This could be done much better, and points don't need to be saved, may as well be recalculated each time. 
        + Also, it is going to get too expensive to recalculate ALL of the weeks each time. Instead, save old weeks and only recalculate the week totals when those values get updated. Name weeks based on the Monday?
        + Somehow we should save the totals and know when a value gets updated... (based on lastUpdated entry attribute?) and THEN recalculate if necessary. 
- ~~Insert blank cards if dates missing.~~
    + Show dropdown of when last updated?
- ~~Just use getMFP and pass dates instead of calling getDailyMFP.py~~
- ~~Make date link to partner's diary entry as well as yours!~~
    + Alternatively, make it not link at all if looking at partner

- Change flash messaging location on some pages!
    - Check account/spend (requests) to see the correct implementation

- Make "responses" tab for request responses!

- Store points in database for retrieval
    + Right now, points from a given timespan are calculated from daily point earnings **every time** the page renders
    + Cache calculations in front end
    + Update point calculations only when post request is made to update data
- Now we need framework for sending requests and getting approval
    + ~~Requests tab for each user?~~
    + Email notification? (Get fit logo + Sam has requested a reward!)

- ~~Implement authentication so we know who is logged in~~

- Implement spending points  
    + ~~create entry in db for request.~~  
    + ~~store bool states for 'agreedTo' and 'fulfilled'~~  
    + message through IFTTT prompting the receiver to check the request. 
    + when they're alone, they can check the request and accept or decline
    + ~~allow for user to respond to request (AJAX or POST?)~~

Front End  
- Transition animations between tabs!  
    + abrupt transition between similar looking tabs is jarring
- Cache middleware
- Change view engine to pull period database?
- Display two week period rolling points
- Display week's points on Sunday (on left of 'feed')

Update Sept 30th, 2017
Design
- ~~Remove `display: flex` from landing-page hero to allow columns to properly resize~~
- ~~HOWEVER, need to figure out how to vertically center columns then~~

~~Perhaps update media elements of 'days' to make them cards or tiles instead of media~~
~~Change all instances of 'purchases' to 'requests' for better semantics~~
~~Format dates of requests with `moment.format()`~~

Sketch out the layout of the app!
- What will our overview be?
    + How do we make this look really good?
- ~~Where do we locate a detailed day-by-day breakdown?~~
- ~~How do we best display information on the user page?~~

Then we can fix things. 
- ~~Stop using static 'sam' & 'amelia' routes.~~
    + ~~Switch to 'user' and 'partner' instead~~

~~Switch from using 'is-danger' (etc) classes to style different pages! Instead we should be specifying the page and then we'll style it differently ourselves.~~
Allow user to pick accent colors in account page. How to we save and implement that??

- ~~Update update-entry buttons to properly correspond to user/partner~~
- ~~Instead of using capitalized username as userName, actually use the user's name from their name field!~~
- ~~Stop pulling directly from req.user, always user res.locals.user~~
- ~~Then just pull from the partner object, which we'll set to res.locals.partner~~
