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
import Promise from 'bluebird';
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

const productionEnv = process.env.NODE_ENV === 'production';

// Bring in environment variable config file:
require('dotenv').config();

// Bring in remaining config files
const appConfig = require('../config/app_config.json');
const googleCreds = require('../config/secret/client_secret.json');
const secretConfig = require('../config/secret/secret_config.json');

// should probably change up these config files to work better with ES6 modules
const nodeConfig = secretConfig.node;

mongoose.Promise = Promise;

const MongoStore = require('connect-mongo')(session);

const moment = extendMoment(Moment);

// Define Async middleware wrapper to avoid try-catch
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Set up our mongoDB connection URI and options
let mongoURI;
const mongoOptions = { useMongoClient: true };
if (productionEnv) {
  // if we're in production, connect to our production database
  mongoURI = `mongodb+srv://nodejs:${process.env.MONGO_NODEJS_PASS}@${
    process.env.MONGO_PROD_CONNECTION
  }`;
  // If we're in production, we also need to specify the dbName to connect to
  mongoOptions.dbName = process.env.MONGO_PROD_DBNAME;
} else {
  // Otherwise, connect to our local instance.
  mongoURI = `mongodb://${process.env.MONGO_GETFIT_NODE_USER}:${
    process.env.MONGO_GETFIT_NODE_PASS
  }@${process.env.MONGO_LOCAL_SERVICENAME}:${process.env.MONGO_LOCAL_PORT}/${
    process.env.MONGO_PROD_DBNAME
  }?authMechanism=${process.env.MONGO_LOCAL_AUTHMECH}`;
}

mongoose.connect(
  mongoURI,
  mongoOptions
);

const db = mongoose.connection;

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

// Set environment
app.use((req, res, next) => {
  app.locals.env = process.env.NODE_ENV;
  next();
});

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
    res.locals.loggedIn = !!req.user;

    // Temporarily mock blank partner (if none)
    if (req.user) {
      if (req.user.partner == null || req.user.partner === '') {
        res.locals.partner = {
          firstname: '',
          lastname: '',
          username: '',
          email: '',
          mfp: '',
          partner: '',
          fitnessGoal: '',
          password: null,
          currentPoints: 0
        };
      } else if (!(await User.findOne({ username: req.user.partner }))) {
        // Otherwise if no user located in database, insert dummy user for now
        res.locals.partner = {
          firstname: '',
          lastname: '',
          username: '',
          email: '',
          mfp: '',
          partner: '',
          fitnessGoal: '',
          password: null,
          currentPoints: 0
        };
      } else {
        res.locals.partner = await User.findOne({
          username: req.user.partner
        });
      }
    }

    // Set capitalized names
    if (req.user) {
      res.locals.userName =
        res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1);
      res.locals.partnerName =
        res.locals.partner.firstname.charAt(0).toUpperCase() +
        res.locals.partner.firstname.slice(1).toLowerCase();

      res.locals.userLastName =
        res.locals.user.lastname.charAt(0).toUpperCase() + res.locals.user.lastname.slice(1);
      res.locals.partnerLastName =
        res.locals.partner.lastname.charAt(0).toUpperCase() +
        res.locals.partner.lastname.slice(1).toLowerCase();
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

    const startOfTracking = moment
      .tz(appConfig.startDate, 'MM-DD-YYYY', 'US/Pacific')
      .startOf('day');
    const customRange = {
      // We started Monday, Sept 18th
      key: 'sinceStart',
      startDate: startOfTracking,
      endDate: today.clone().endOf('day')
    };
    res.locals.customRange = customRange; // do we want to pass an object instead?
  }
  next();
});

// ------------------------------------------------------------------------------//
// --------------- MIDDLEWARE TO CALCULATE POINTS & PURCHASES -------------------//
// ------------------------------------------------------------------------------//
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

      const pointTally = {
        user: parseFloat(userCustom.points),
        partner: parseFloat(partnerCustom.points)
      };

      // make the point tallies array available to the view engine
      res.locals.pointTally = pointTally;
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

// ------------------------------------------------------------------------------//

app.get('/', (req, res) => {
  if (res.locals.loggedIn) {
    res.render('landing_page', {
      routeInfo: {
        heroType: 'landing_page',
        route: `/`
      }
    });
  } else {
    res.render('landing_page', {
      routeInfo: {
        heroType: 'landing_page',
        route: `/`
      }
    });
  }
});

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
    const weightDoc = new GoogleSpreadsheet('1q15E449k_0KP_elfptM7oyVx_qXsss9_K4ESExlM2MI'); // 2016 spreadsheet
    // const weightDoc = new GoogleSpreadsheet('13XR4qkzeMDVRPkiB3vUGV7n25sLqBpyLlE6yBC22aSM'); // All weight data

    weightDoc.useServiceAccountAuth(googleCreds, authErr => {
      if (authErr) {
        logger.info('auth error: ');
        logger.error(authErr);
      }
      // Get all of the rows from the spreadsheet.
      weightDoc.getRows(1, (getErr, rows) => {
        if (getErr) {
          logger.info('row fetch error: ');
          logger.error(getErr);
        }
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
      });
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

app.get('*', (req, res) => {
  logger.warn(`404ing at ${req.url}`);
  res.render('404', {
    routeInfo: {
      heroType: 'landing_page',
      route: `${req.url}`
    }
  });
});

// Set all errors to be sent to Winston!
// https://stackoverflow.com/questions/45101757/pug-error-handling-for-a-nodejs-express-and-pug-based-application
app.use((err, req, res, next) => {
  logger.error('uncaught error: %j', err);
  // logger.error(err.stack);
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

  req.flash('danger', err);
  // Shouldn't redirect, because upstream error handling may have redirected already!
  // res.redirect('/');
  // If XHR (Ajax) request, we don't want to call next!!! That
  if (req.xhr) {
    res.status(500).send({ error: 'Internal Server Error' });
  } else {
    next(err);
  }
});

// Start Server
app.listen(appConfig.serverPort, () => {
  logger.info(`Server started on port ${appConfig.serverPort}`);
});
