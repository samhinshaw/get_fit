// bring in express for routing
import express from 'express';

// import { parse, format, isValid, addMinutes } from 'date-fns';

import path from 'path'; // core module included with Node.js
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from 'express-session';
import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';
import expressValidator from 'express-validator';
import expressSanitizer from 'express-sanitizer';
import cookieParser from 'cookie-parser';
// const flash = require('connect-flash');
import expMessages from 'express-messages';
import passport from 'passport';
// import _ from 'lodash';
import helmet from 'helmet';
import GoogleSpreadsheet from 'google-spreadsheet';
// import winston from 'winston';

// Include custom middleware
import { queryCustomPeriodsFromMongo, getPendingRequests } from './middlewares/mongoMiddleware';
import ensureAuthenticated from './methods/auth';

// Bring in route files
// const data = require('./routes/data');
import account from './routes/account';
import landing from './routes/landing';
import user from './routes/user';
import partner from './routes/partner';

// Include document Schemas
// import Request from './models/request';
// import Period from './models/period';
// import Entry from './models/entry';
import User from './models/user';

// Bring in winston logger
import logger from './methods/logger';

// Passport Config Middleware
import authMiddleware from './methods/passport';

// Set NODE_ENV if undefined
// const env = process.env.NODE_ENV || 'development';

// function convertDateToUTC(date) {
//   return new Date(
//     date.getUTCFullYear(),
//     date.getUTCMonth(),
//     date.getUTCDate(),
//     date.getUTCHours(),
//     date.getUTCMinutes(),
//     date.getUTCSeconds()
//   );
// }

// function convertToUTC(datetime) {
//   const parsed = parse(datetime);

//   if (!isValid(parsed)) {
//     // return empty & log error for invalid dates
//     console.error('invalid date:', datetime);
//     return '';
//   }

//   const utcOffset = parsed.getTimezoneOffset();
//   const isDST = utcOffset < new Date(2016, 1, 1).getTimezoneOffset();
//   const edtOffset = isDST ? 240 : 300; // 300mins or 240mins during Daylight savings
//   const offsetDiff = utcOffset - edtOffset;
//   let adjustedTime = parsed;
//   if (offsetDiff) {
//     adjustedTime = addMinutes(parsed, offsetDiff);
//   }

//   return adjustedTime;
// }

// const unchangedDate = new Date();
// console.log('untouched date: ', format(parse(unchangedDate), 'MMM Do, hh:mma'));
// console.log('timezoneOffset: ', unchangedDate.getTimezoneOffset());

// const timeShifted = new Date().toLocaleString('en-US', { timeZone: 'America/Vancouver' });
// const parseDate = parse(timeShifted);

// console.log('timeShifted: ', format(timeShifted, 'MMM Do, hh:mma'));
// console.log('parsed: ', format(parseDate, 'MMM Do, hh:mma'));
// console.log('parsed timezone offset: ', parseDate.getTimezoneOffset());

const dbConfig = require('../config/database.json');
const googleCreds = require('../config/secret/client_secret.json');
const secretConfig = require('../config/secret/secret_config.json');

// should probably change up these config files to work better with ES6 modules
const nodeConfig = secretConfig.node;

mongoose.Promise = Promise;

const MongoStore = require('connect-mongo')(session);

const moment = extendMoment(Moment);
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

// mongoose.connect(dbConfig.database);
mongoose.connect(mongoURI, { useMongoClient: true });
// const connection = mongoose.createConnection(mongoURI);

const db = mongoose.connection;
// const db = connection;

// Check connection
db.once('open', () => {
  logger.info('Connected to MongoDB');
});
// Check for DB errors
db.on('error', err => {
  logger.error(err);
});

// initialize app
const app = express();

// Let Express know it's behind a nginx proxy
app.set('trust proxy', '127.0.0.1');

// Use the helmet middleware to "protect your app from some well-known web
// vulnerabilities by setting HTTP headers appropriately"
app.use(helmet());

// Load View Engine
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// Look up what these are in the bodyParser documentation
// bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); // this line follows bodyParser() instantiations

// Route for static assests such as CSS and JS
app.use(express.static(path.join(__dirname, '../public')));

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

// Continued config of auth middleware
authMiddleware(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

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

// Init global user variable
app.use(
  asyncMiddleware(async (req, res, next) => {
    if (req.user) {
      req.user.password = null;
    }
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

// Set cookies so we can access user object on client side
app.use(cookieParser());

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

    const startOfTracking = moment
      .tz(dbConfig.startDate, 'MM-DD-YYYY', 'US/Pacific')
      .startOf('day');
    // res.locals.startOfTracking = startOfTracking;
    const customRange = {
      // We started Monday, Sept 18th
      key: 'sinceStart',
      startDate: startOfTracking,
      endDate: today.clone().endOf('day')
    };
    // const customRanges = [
    //   {
    //     // We started Monday, Sept 18th
    //     key: 'sinceStart',
    //     startDate: startOfTracking,
    //     endDate: today
    //   },
    //   {
    //     key: 'pastTwoWeeks',
    //     startDate: twoWeeksAgo,
    //     endDate: today
    //   }
    // ];
    res.locals.customRange = customRange; // do we want to pass an object instead?
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
      // const userWeeks = await mongoMiddleware.queryWeeksFromMongo(res.locals.user.username);
      const userCustom = await queryCustomPeriodsFromMongo(
        res.locals.user.username,
        res.locals.customRange
      );
      // const partnerWeeks = await mongoMiddleware.queryWeeksFromMongo(res.locals.partner.username);
      const partnerCustom = await queryCustomPeriodsFromMongo(
        res.locals.partner.username,
        res.locals.customRange
      );

      // NOTE: as of 2018-01-14, not using week tallies, since it turned out we
      // weren't rendering these anywhere or using them in any calculations.
      // It'd be nice to have them added up in the UI, but for now just cutting
      // them out. Next up is intelligent caching of point tallies!

      // const periods = _.union(userWeeks, userCustom, partnerWeeks, partnerCustom);
      // const periods = _.union(userCustom, partnerCustom);

      // make the points array available to the view engine
      // res.locals.pointTotals = periods;

      // As of 2018-01-23, not saving point totals into database, will just
      // recalculate every time

      // periods.forEach(entry => {
      //   const period = {
      //     key: entry.key,
      //     startDate: entry.startDate,
      //     endDate: entry.endDate,
      //     points: entry.points,
      //     user: entry.user
      //   };
      //   // resave points
      //   Period.findOneAndUpdate(
      //     {
      //       key: period.key,
      //       user: period.user
      //     },
      //     { $set: period },
      //     { upsert: true },
      //     saveErr => {
      //       if (saveErr) {
      //         console.log(saveErr);
      //       }
      //     }
      //   );
      // });

      // make the current running total easily accessible. if more specific ones
      // needed, we can get those within the views template
      // Array.filter to find ALL (returns array even if only one match)
      // const pointTallies = periods.filter(period => period.key === 'sinceStart');

      // Array.find to find the FIRST match. returns the item (not an array), but
      // will only ever find one
      // const userPointTally = pointTallies.find(period => period.user === res.locals.user.username);
      // const partnerPointTally = pointTallies.find(
      //   period => period.user === res.locals.partner.username
      // );

      // const pointTally = {
      //   user: parseFloat(userPointTally.points),
      //   partner: parseFloat(partnerPointTally.points)
      // };
      const pointTally = {
        user: parseFloat(userCustom.points),
        partner: parseFloat(partnerCustom.points)
      };

      // make the point tallies array available to the view engine
      res.locals.pointTally = pointTally;

      // pointTallies.forEach(period => {
      //   User.update(
      //     {
      //       username: period.user
      //     },
      //     {
      //       $set: {
      //         currentPoints: period.points
      //       }
      //     },
      //     { upsert: true },
      //     saveErr => {
      //       if (saveErr) {
      //         console.log(saveErr);
      //       }
      //     }
      //   );
      // });
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
      const pendingRequests = await getPendingRequests(res.locals.partner.username);
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
// app.get('/overview', ensureAuthenticated, (req, res) => {
//   // Otherwise, query DB for entries to display!
//   const user = res.locals.user.username;
//   const partner = res.locals.partner.username;
//   Entry.find(
//     {
//       date: {
//         $gte: res.locals.twoWeeksAgo.toDate(),
//         $lte: res.locals.today.toDate()
//       }
//     },
//     (err, entries) => {
//       if (err) {
//         logger.error(err);
//       }
//       // If we get the results back, split by user
//       const userEntries = entries.filter(entry => entry.user === user);
//       const partnerEntries = entries.filter(entry => entry.user === partner);

//       // ...and order by date
//       const sortedUserEntries = _.orderBy(userEntries, 'date', 'desc');
//       const sortedPartnerEntries = _.orderBy(partnerEntries, 'date', 'desc');

//       res.render('overview', {
//         userEntries: sortedUserEntries,
//         partnerEntries: sortedPartnerEntries,
//         routeInfo: {
//           heroType: 'dark',
//           route: `/overview`,
//           userName:
//             res.locals.user.firstname.charAt(0).toUpperCase() +
//               res.locals.user.firstname.slice(1) || null,
//           partnerName:
//             res.locals.partner.firstname.charAt(0).toUpperCase() +
//               res.locals.partner.firstname.slice(1).toLowerCase() || null
//         }
//       });
//     }
//   );
// });

// Send user data to client side (via cookie) when user is logged in
app.get('/api/user_data', ensureAuthenticated, (req, res) => {
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
app.get('/api/user_weight', ensureAuthenticated, (req, res) => {
  if (req.user.username !== 'sam') {
    // The user is not logged in
    res.json({});
  } else {
    const weightDoc = new GoogleSpreadsheet('1q15E449k_0KP_elfptM7oyVx_qXsss9_K4ESExlM2MI');

    weightDoc.useServiceAccountAuth(googleCreds, authErr => {
      logger.info('auth error: ');
      logger.error(authErr);
      // Get all of the rows from the spreadsheet.
      weightDoc.getRows(
        1,
        // {
        //   limit: 30,
        //   orderby: 'date',
        //   reverse: true
        // },
        (getErr, rows) => {
          logger.info('row fetch error: ');
          logger.error(getErr);
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

// app.use('/data', data);
app.use('/', landing);
app.use('/account', account);
app.use('/user', user);
app.use('/partner', partner);

// Set all errors to be sent to Winston!
// https://stackoverflow.com/questions/45101757/pug-error-handling-for-a-nodejs-express-and-pug-based-application
app.use((err, req, res, next) => {
  logger.error(err.stack);
  // show user some message - for Ajax requests which expects a specific format
  // res.json({ ok: false, message: err.message });

  // OR
  // more advanced:
  // check error type, context etc. and act accordingly
  // - log message
  // - send appropriaty error page etc.
  // - eventually use next handler
  // - set res.status
  // sth. like this

  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' });
  } else {
    req.flash('danger', err.message);
    res.redirect('/');
    next(err);
  }
});

// Start Server
app.listen(dbConfig.serverPort, () => {
  logger.info(`Server started on port ${dbConfig.serverPort}`);
});
