// bring in express for routing
const express = require('express');
const path = require('path'); // core module included with Node.js
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const expressValidator = require('express-validator');
const expressSanitizer = require('express-sanitizer');
// const flash = require('connect-flash');
const expMessages = require('express-messages');
const passport = require('passport');
const _ = require('lodash');
const helmet = require('helmet');
const GoogleSpreadsheet = require('google-spreadsheet');

const config = require('./config/database');
const secretConfig = require('./config/secret_config.json');
const auth = require('./config/auth');
const googleCreds = require('./config/client_secret.json');

const MongoStore = require('connect-mongo')(session);

const nodeConfig = secretConfig.node;
const moment = MomentRange.extendMoment(Moment);
// moment().format(); // required by package entirely

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

const mongoURI = `mongodb://${nodeConfig.user}:${nodeConfig.password}@${nodeConfig.host}:${nodeConfig.port}/${nodeConfig.authSource}?authMechanism=${nodeConfig.authMechanism}`;

// mongoose.connect(config.database);
mongoose.connect(mongoURI);
// const connection = mongoose.createConnection(mongoURI);

const db = mongoose.connection;
// const db = connection;

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

// Let Express know it's behind a nginx proxy
app.set('trust proxy', '127.0.0.1');

// Include document Schemas
// const Request = require('./models/request');
// const Period = require('./models/period');
const Period = require('./models/period');
const User = require('./models/user');
const Entry = require('./models/entry');

// Use the helmet middleware to "protect your app from some well-known web
// vulnerabilities by setting HTTP headers appropriately"
app.use(helmet());

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Look up what these are in the bodyParser documentation
// bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); // this line follows bodyParser() instantiations

// Route for static assests such as CSS and JS
app.use(express.static(path.join(__dirname, 'public')));

// Include custom middleware
const mongoMiddleware = require('./middlewares/mongoMiddleware');

// Middleware for Lesson 8, Messaging & Validation
// Session Handling Middleware
// app.use(
//   session({
//   })
// );

app.use(
  session({
    secret: secretConfig.session.secret,
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true },
    // store: new MongoStore({ mongooseConnection: connection })
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

// Messages Middleware (pretty client messaging)
app.use(require('connect-flash')());

app.use((req, res, next) => {
  res.locals.messages = expMessages(req, res);
  next();
});

// Allow pug to bring in packages
app.use((req, res, next) => {
  res.locals.require = require;
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

// Make sure that our moment initialization is run as middleware! Otherwise
// functions will only be run when the app starts!!! Use middleware to modify
// locals object (makes available to view engine!)
// https://stackoverflow.com/questions/12550067/expressjs-3-0-how-to-pass-res-locals-to-a-jade-view
app.use((req, res, next) => {
  if (req.user) {
    const now = moment.tz('US/Pacific');
    res.locals.now = now;

    const today = now.clone().startOf('day');
    res.locals.today = today;

    const twoWeeksAgo = today.clone().subtract(14, 'days');
    res.locals.twoWeeksAgo = twoWeeksAgo;

    // .startOf('week')    = Sunday

    const startOfTracking = moment.tz(config.startDate, 'MM-DD-YYYY', 'US/Pacific').startOf('day');
    // res.locals.startOfTracking = startOfTracking;
    const customRanges = [
      {
        // We started Monday, Sept 18th
        key: 'sinceStart',
        startDate: startOfTracking,
        endDate: today
      },
      {
        key: 'pastTwoWeeks',
        startDate: twoWeeksAgo,
        endDate: today
      }
    ];
    res.locals.customRanges = customRanges; // do we want to pass an object instead?
  }
  next();
});

// /////////////////////////////////////////////////////////////////////////////
// /////////////// MIDDLEWARE TO CALCULATE POINTS & PURCHASES /////////////////
// /////////////////////////////////////////////////////////////////////////////
app.use(
  asyncMiddleware(async (req, res, next) => {
    // Workaround for now will simply not run this middleware if not logged in
    // In the future, can probably think of a better way to architect this
    if (req.user) {
      // Don't need try, catch anymore since asyncMiddleware (see top of app.js) is
      // handling async errors

      // Get and concat all point tallies
      const userWeeks = await mongoMiddleware.queryWeeksFromMongo(res.locals.user.username);
      const userCustom = await mongoMiddleware.queryCustomPeriodsFromMongo(
        res.locals.user.username,
        res.locals.customRanges
      );
      const partnerWeeks = await mongoMiddleware.queryWeeksFromMongo(res.locals.partner.username);
      const partnerCustom = await mongoMiddleware.queryCustomPeriodsFromMongo(
        res.locals.partner.username,
        res.locals.customRanges
      );

      const periods = _.union(userWeeks, userCustom, partnerWeeks, partnerCustom);

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
      const userPointTally = pointTallies.find(period => period.user === res.locals.user.username);
      const partnerPointTally = pointTallies.find(
        period => period.user === res.locals.partner.username
      );

      const pointTally = {
        user: parseFloat(userPointTally.points),
        partner: parseFloat(partnerPointTally.points)
      };

      // make the point tallies array available to the view engine
      res.locals.pointTally = pointTally;

      pointTallies.forEach(period => {
        User.update(
          {
            username: period.user
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
    }
    next();
  })
);

app.use(
  asyncMiddleware(async (req, res, next) => {
    // only look for the pending requests if user is logged in
    if (req.user) {
      // Don't need try, catch anymore since asyncMiddleware (see top of app.js) is
      // handling async errors

      // Get pending requests -- we want to find the ones our PARTNER has
      // requested, because we only have a field in the document for requester,
      // not requestee. So we want to see what we have yet to approve
      const pendingRequests = await mongoMiddleware.getPendingRequests(res.locals.partner.username);
      res.locals.pendingRequests = pendingRequests;
    }
    next();
  })
);

// /////////////////////////////////////////////////////////////////////////////
// /////////////// END MIDDLEWARE TO CALCULATE POINTS & PURCHASES /////////////////
// /////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res) => {
  if (res.locals.loggedIn) {
    res.render('landing_page', {
      routeInfo: {
        heroType: 'landing_page',
        route: `/`,
        userName:
          res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1),
        partnerName:
          res.locals.partner.firstname.charAt(0).toUpperCase() +
          res.locals.partner.firstname.slice(1).toLowerCase()
      }
    });
  } else {
    res.render('landing_page', {
      routeInfo: {
        heroType: 'landing_page',
        route: `/`,
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
  const partner = res.locals.partner.username;
  Entry.find(
    {
      date: {
        $gte: res.locals.twoWeeksAgo.toDate(),
        $lte: res.locals.today.toDate()
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
          userName:
            res.locals.user.firstname.charAt(0).toUpperCase() +
              res.locals.user.firstname.slice(1) || null,
          partnerName:
            res.locals.partner.firstname.charAt(0).toUpperCase() +
              res.locals.partner.firstname.slice(1).toLowerCase() || null
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
    // Sened everything EXCEPT PASSWORD
    // Blacklist method. Only needs to change if blacklist changes
    // First define function to omit object keys
    // const removeProps = (...propsToFilter) => obj => {
    //   const newObj = Object.assign({}, obj);
    //   propsToFilter.forEach(key => delete newObj[key]);
    //   return newObj;
    // };
    // However, overinclusive!! Includes properties/keys such as '_maxListeners'
    // const userJSON = removeProps('_id', 'password', '__v')(req.user);
    // res.json(userJSON);
    // Whitelist method--must be updated if user model changes
    res.json({
      username: res.locals.user.username,
      firstname: res.locals.user.firstname,
      lastname: res.locals.user.lastname,
      email: res.locals.user.email,
      partner: res.locals.user.partner,
      mfp: res.locals.user.mfp,
      currentPoints: res.locals.user.currentPoints,
      fitnessGoal: res.locals.user.fitnessGoal
    });
  }
});

// Send user data to client side (via cookie) when user is logged in
app.get('/api/user_weight', auth.ensureAuthenticated, (req, res) => {
  if (req.user.username !== 'sam') {
    // The user is not logged in
    res.json({});
  } else {
    const weightDoc = new GoogleSpreadsheet('1q15E449k_0KP_elfptM7oyVx_qXsss9_K4ESExlM2MI');

    weightDoc.useServiceAccountAuth(googleCreds, authErr => {
      console.log('auth error: ', authErr);
      // Get all of the rows from the spreadsheet.
      weightDoc.getRows(
        1,
        // {
        //   limit: 30,
        //   orderby: 'date',
        //   reverse: true
        // },
        (getErr, rows) => {
          console.log('row fetch error: ', getErr);
          // initialize empty array for us to gather pruned rows
          const prunedRows = [];
          // For each row in the array of rows, return just the weight & date
          rows.forEach(row => {
            const prunedRow = {
              date: row.date,
              weight: row.weight
            };
            prunedRows.push(prunedRow);
          });

          res.json({
            rows: prunedRows
          });
          // return rows;
          // rows.forEach(row => {
          //   console.log('date: ', row.date);
          //   console.log('weight: ', row.weight);
          // });
        }
      );
    });
  }
});

// Why doesn't this async version work?

// Update: I figured it out! I was using async/await wrong here...
// we can still update it to work properly

// app.get('/', async (req, res) => {
//   if (!res.locals.loggedIn) {
//     res.render('account_login');
//   } else {
//     const userEntries = await mongoMiddleware.getSortedEntries(
//       res.locals.user.username,
//       startDate,
//       endDate
//     );
//     const partnerEntries = await mongoMiddleware.getSortedEntries(
//       res.locals.partner.username,
//       startDate,
//       endDate
//     );
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
const user = require('./routes/user');
const partner = require('./routes/partner');

// app.use('/data', data);
app.use('/', landing);
app.use('/account', account);
app.use('/user', user);
app.use('/partner', partner);

// Start Server
app.listen(config.serverPort, () => {
  console.log(`Server started on port ${config.serverPort}`);
});
