// bring in express for routing
const express = require('express');
const path = require('path'); // core module included with Node.js
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const expressValidator = require('express-validator');
// const flash = require('connect-flash');
const expMessages = require('express-messages');
const passport = require('passport');
const config = require('./config/database');
const _ = require('lodash');

const auth = require('./config/auth.js');

const moment = MomentRange.extendMoment(Moment);
moment().format(); // required by package entirely
const now = moment().tz('US/Pacific');
const today = now.clone().startOf('day');
// const startofTracking = moment('09-18-2017', 'MM-DD-YYYY')
//   .tz('US/Pacific')
//   .startOf('day');
const twoWeeksAgo = today.clone().subtract(14, 'days');
// .startOf('week')    = Sunday
// .startOf('isoweek') = Monday
// const customRanges = [
//   {
//     // We started Monday, Sept 18th
//     key: 'sinceStart',
//     startDate: startofTracking,
//     endDate: today
//   },
//   {
//     key: 'pastTwoWeeks',
//     startDate: twoWeeksAgo,
//     endDate: today
//   }
// ];
// Define Async middleware wrapper to avoid try-catch
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Connect to MongoDB
// NOTE, this syntax is deprecated
// http://mongoosejs.com/docs/connections.html#use-mongo-client
// http://mongoosejs.com/docs/promises.html
// THIS IS THE NEW SYNTAX
// promise.then((db) => {});
// const promise = mongoose.connect('mongodb://localhost/myapp', {
//   useMongoClient: true,
// });
mongoose.connect(config.database);
const db = mongoose.connection;

// Check connection
db.once('open', () => {
  console.log('Connected to MongoDB');
});
// Check for DB errors
db.on('error', err => {
  console.log(err);
});

// initialize app
const app = express();

// Include document Schemas
// const Purchase = require('./models/purchase');
// const Period = require('./models/period');
const Period = require('./models/period');
const User = require('./models/user');
const Entry = require('./models/entry');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Look up what these are in the bodyParser documentation
// bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Route for static assests such as CSS and JS
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for Lesson 8, Messaging & Validation
// Session Handling Middleware
app.use(
  session({
    secret: 'little chessie',
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
  })
);

// Messages Middleware (pretty client messaging)
app.use(require('connect-flash')());

app.use((req, res, next) => {
  res.locals.messages = expMessages(req, res);
  next();
});

// Form Validation Middleware
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      const namespace = param.split('.');
      const root = namespace.shift();
      let formParam = root;

      while (namespace.length) {
        formParam += `[${namespace.shift()}]`;
      }
      return {
        param: formParam,
        msg,
        value
      };
    }
  })
);

// Passport Config Middleware
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Init global user variable
app.use(
  asyncMiddleware(async (req, res, next) => {
    // This '||' will assign to NULL if req.user does not exist
    res.locals.user = req.user || null;

    // also store 'logged-in' status
    if (req.user) {
      res.locals.loggedIn = true;
      res.locals.partner = await User.findOne({
        username: req.user.partner
      });
    } else {
      res.locals.loggedIn = false;
    }

    next();
  })
);

// Include custom middleware
const mongoMiddleware = require('./middlewares/mongoMiddleware');

// /////////////////////////////////////////////////////////////////////////////
// /////////////// MIDDLEWARE TO CALCULATE POINTS & PURCHASES /////////////////
// /////////////////////////////////////////////////////////////////////////////
app.use(
  asyncMiddleware(async (req, res, next) => {
    // Don't need try, catch anymore since asyncMiddleware (see top of app.js) is
    // handling async errors

    // Get and concat all point tallies
    const samWeeks = await mongoMiddleware.queryWeeksFromMongo('sam');
    const samCustom = await mongoMiddleware.queryCustomPeriodsFromMongo('sam');
    const ameliaWeeks = await mongoMiddleware.queryWeeksFromMongo('amelia');
    const ameliaCustom = await mongoMiddleware.queryCustomPeriodsFromMongo('amelia');

    const periods = _.union(samWeeks, samCustom, ameliaWeeks, ameliaCustom);

    // make the points array available to the view engine
    res.locals.pointTotals = periods;

    // Save to periods collection

    periods.forEach(entry => {
      const period = {
        key: entry.key,
        startDate: entry.startDate,
        endDate: entry.endDate,
        points: entry.points,
        user: entry.user
      };
      // resave points
      Period.findOneAndUpdate(
        {
          key: period.key,
          user: period.user
        },
        { $set: period },
        { upsert: true },
        saveErr => {
          if (saveErr) {
            console.log(saveErr);
          }
        }
      );
    });

    // make the current running total easily accessible. if more specific ones
    // needed, we can get those within the views template
    // Array.filter to find ALL (returns array even if only one match)
    const pointTallies = periods.filter(period => period.key === 'sinceStart');

    // Array.find to find the FIRST match. returns the item (not an array), but
    // will only ever find one
    const samPointTally = pointTallies.find(period => period.user === 'sam');
    const ameliaPointTally = pointTallies.find(period => period.user === 'amelia');

    const pointTally = {
      sam: parseFloat(samPointTally.points),
      amelia: parseFloat(ameliaPointTally.points)
    };

    // make the point tallies array available to the view engine
    res.locals.pointTally = pointTally;

    pointTallies.forEach(period => {
      User.update(
        {
          name: period.user
        },
        {
          $set: {
            currentPoints: period.points
          }
        },
        { upsert: true },
        saveErr => {
          if (saveErr) {
            console.log(saveErr);
          }
        }
      );
    });

    next();
  })
);

app.use(
  asyncMiddleware(async (req, res, next) => {
    // only look for the pending purchases if user is logged in
    if (req.user) {
      // Don't need try, catch anymore since asyncMiddleware (see top of app.js) is
      // handling async errors

      // Get pending purchases -- we want to find the ones our PARTNER has
      // requested, because we only have a field in the document for requester,
      // not requestee. So we want to see what we have yet to approve
      const pendingRequests = await mongoMiddleware.getPendingPurchases(res.locals.user.partner);
      res.locals.pendingRequests = pendingRequests;
    }
    next();
  })
);

// /////////////////////////////////////////////////////////////////////////////
// /////////////// END MIDDLEWARE TO CALCULATE POINTS & PURCHASES /////////////////
// /////////////////////////////////////////////////////////////////////////////

// Use middleware to modify locals object (makes available to view engine!)
// https://stackoverflow.com/questions/12550067/expressjs-3-0-how-to-pass-res-locals-to-a-jade-view
app.use((req, res, next) => {
  res.locals.today = today; // do we want to pass an object instead?
  res.locals.require = require;
  next();
});

app.get('/', (req, res) => {
  if (res.locals.loggedIn) {
    res.render('landing_page', {
      routeInfo: {
        heroType: 'landing_page',
        route: `/`,
        user: res.locals.user.username,
        userName: req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1),
        partnerName: req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase()
      }
    });
  } else {
    res.render('landing_page', {
      routeInfo: {
        heroType: 'landing_page',
        route: `/`,
        user: null,
        userName: null,
        partnerName: null
      }
    });
  }
});

// Bring in User Data!
app.get('/overview', auth.ensureAuthenticated, (req, res) => {
  // Otherwise, query DB for entries to display!
  const user = res.locals.user.username;
  const partner = res.locals.user.partner;
  Entry.find(
    {
      date: {
        $gte: twoWeeksAgo.toDate(),
        $lte: today.toDate()
      }
    },
    (err, entries) => {
      if (err) {
        console.log(err);
      }
      // If we get the results back, split by user
      const userEntries = entries.filter(entry => entry.user === user);
      const partnerEntries = entries.filter(entry => entry.user === partner);

      // ...and order by date
      const sortedUserEntries = _.orderBy(userEntries, 'date', 'desc');
      const sortedPartnerEntries = _.orderBy(partnerEntries, 'date', 'desc');

      res.render('overview', {
        userEntries: sortedUserEntries,
        partnerEntries: sortedPartnerEntries,
        routeInfo: {
          heroType: 'dark',
          route: `/overview`,
          user: req.user.username || null,
          userName: req.user.username.charAt(0).toUpperCase() + req.user.username.slice(1) || null,
          partnerName: req.user.partner.charAt(0).toUpperCase() + req.user.partner.slice(1).toLowerCase() || null
        }
      });
    }
  );
});

// Send user data to client side (via cookie) when user is logged in
app.get('/api/user_data', auth.ensureAuthenticated, (req, res) => {
  if (req.user === undefined) {
    // The user is not logged in
    res.json({});
  } else {
    res.json({
      username: req.user
    });
  }
});

// Why doesn't this async version work?
//
// Update: I figured it out! I was using async/await wrong here...
// we can still update it to work properly
//
// app.get('/', async (req, res) => {
//   if (!res.locals.loggedIn) {
//     res.render('account_login');
//   } else {
//     const userEntries = await mongoMiddleware.getSortedEntries(res.locals.user.username);
//     const partnerEntries = await mongoMiddleware.getSortedEntries(res.locals.user.partner);
//     res.render('overview', {
//       userEntries: await userEntries,
//       partnerEntries: await partnerEntries
//     });
//   }
// });

// Bring in route files
// const data = require('./routes/data');
const account = require('./routes/account');
const landing = require('./routes/landing');
// const sam = require('./routes/sam');
// const amelia = require('./routes/amelia');
const user = require('./routes/user');
const partner = require('./routes/partner');

// app.use('/data', data);
app.use('/', landing);
app.use('/account', account);
// app.use('/sam', sam);
// app.use('/amelia', amelia);
app.use('/user', user);
app.use('/partner', partner);

// Start Server
app.listen(config.serverPort, () => {
  console.log(`Server started on port ${config.serverPort}`);
});
