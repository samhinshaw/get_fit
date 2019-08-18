// bring in express for routing
import express from 'express';

import path from 'path'; // core module included with Node.js
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';
import expressValidator from 'express-validator';
import expressSanitizer from 'express-sanitizer';
import cookieParser from 'cookie-parser';
import expMessages from 'express-messages';
import passport from 'passport';
import helmet from 'helmet';
import Promise from 'bluebird';

// Import middleware packages
import session from 'express-session';
import connectSession from 'connect-mongo';
import connectFlash from 'connect-flash';

// Include custom middleware
import { getPendingRequests } from './middlewares/mongoMiddleware';

// Bring in route files
import account from './routes/account';
import landing from './routes/landing';
import user from './routes/user';
import partner from './routes/partner';
import api from './routes/api';

// Include document Schemas
import User from './models/user';

// Bring in winston logger
import logger from './methods/logger';

import asyncMiddleware from './middlewares/async-middleware';

// Passport Config Middleware
import authMiddleware from './methods/passport';
import { updatePointTally } from './methods/update-point-tally';

const productionEnv = process.env.NODE_ENV === 'production';
const developmentEnv = process.env.NODE_ENV === 'development';

const PORT = 8005;

const moment = extendMoment(Moment);

// ************************** //
// * Configure Mongo Driver * //
// ************************** //

// Set mongoose to debug mode in dev environment
mongoose.set('debug', !!developmentEnv);
// Tell mongoose to use Node.js' Promise implementation
mongoose.Promise = Promise;
const MongoStore = connectSession(session);
// Set up our mongoDB connection URI and options
let mongoURI;
const mongoOptions = { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true };
if (productionEnv) {
  // if we're in production, connect to our production database
  mongoURI = `mongodb+srv://${process.env.MONGO_PROD_NODE_USER}:${
    process.env.MONGO_PROD_NODEJS_PASS
    }@${process.env.MONGO_PROD_CONNECTION}/${process.env.MONGO_PROD_DBNAME}?retryWrites=true`;
  // If we're in production, we also need to specify the dbName to connect to
  mongoOptions.dbName = process.env.MONGO_PROD_DBNAME;
} else {
  // Otherwise, connect to our local instance.
  mongoURI = `mongodb://${process.env.MONGO_DEV_NODE_USER}:${process.env.MONGO_DEV_NODE_PASS}@${
    process.env.MONGO_LOCAL_SERVICENAME
    }:${process.env.MONGO_LOCAL_PORT}/${process.env.MONGO_INITDB_DATABASE}?authMechanism=${
    process.env.MONGO_LOCAL_AUTHMECH
    }`;
}

// Declare a function to connect to mongo so that we can retry the connection
// should it error-out.
const connectToMongo = function connectToMongo() {
  return mongoose.connect(mongoURI, mongoOptions);
};
connectToMongo();
const db = mongoose.connection;

// Check connection
db.once('open', () => {
  logger.info('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) => {
  logger.error('Database error: %j', err);
  console.trace();
  db.close();
  setTimeout(connectToMongo, 5000);
});

// initialize app
const app = express();

// If we're in production, tell Express to trust/ignore local proxy IPs allow secure cookies
let shouldUseSecureCookies = false;
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 'loopback');
  shouldUseSecureCookies = true;
}

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
app.use('/', express.static('public'));

app.use(
  session({
    secret: process.env.NODEJS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      // Only set secure = true in production
      secure: shouldUseSecureCookies,
      httpOnly: true,
      sameSite: 'strict',
      // 7 days = 1000ms * 60s * 60m * 24h * 7d
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: new MongoStore({ mongooseConnection: db }),
  })
);

// Messages Middleware (pretty client messaging)
app.use(connectFlash());

app.use((req, res, next) => {
  res.locals.messages = expMessages(req, res);
  next();
});

// Continued config of auth middleware
authMiddleware(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set cookies so we can access user object on client side
app.use(cookieParser('hghsyd82h2hdy'));

const emptyUser = {
  firstname: '',
  lastname: '',
  username: '',
  email: '',
  mfp: '',
  partner: '',
  fitnessGoal: '',
  password: null,
  currentPoints: 0,
};

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
        value,
      };
    },
  })
);

// Init global user variable
app.use(
  asyncMiddleware(async (req, res, next) => {
    if (req.user) {
      req.user.password = null;

      res.locals.loggedIn = !!req.user;
      res.locals.user = req.user || null;

      const partnerUsername = req.user.partner;

      res.locals.partner =
        (partnerUsername ? await User.findOne({ username: partnerUsername }) : emptyUser) ||
        emptyUser;
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

    const tonight = today.clone().endOf('day');
    res.locals.tonight = tonight;

    const twoWeeksAgo = today.clone().subtract(14, 'days');
    res.locals.twoWeeksAgo = twoWeeksAgo;

    const startOfTracking = moment
      .tz(req.user.startDate, 'YYYY-MM-DD', 'US/Pacific')
      .startOf('day');

    res.locals.startDate = req.user.startDate;

    const customRange = {
      key: 'sinceStart',
      startDate: startOfTracking,
      endDate: today.clone().endOf('day'),
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
    // only run if logged in
    if (!req.user) {
      next();
      // If we have the pointTally cookie, use it! The invalidation of these cookies will be handled elsewhere
    } else if (req.cookies && req.cookies.pointTally) {
      res.locals.pointTally = req.cookies.pointTally;
      next();
      // Otherwise update the points!
    } else {
      updatePointTally(res, req.user.username, req.user.partner).then(() => next());
    }
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
        route: `/`,
      },
    });
  } else {
    res.render('landing_page', {
      routeInfo: {
        heroType: 'landing_page',
        route: `/`,
      },
    });
  }
});

// app.use('/data', data);
app.use('/', landing);
app.use('/account', account);
app.use('/user', user);
app.use('/partner', partner);
app.use('/api', api);

app.get('*', (req, res) => {
  logger.warn(`404ing at ${req.url}`);
  res.render('404', {
    routeInfo: {
      heroType: 'landing_page',
      route: `${req.url}`,
    },
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
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

// Graceful shutdown courtesy of:
// https://stackoverflow.com/questions/43003870/how-do-i-shut-down-my-express-server-gracefully-when-its-process-is-killed

let connections = [];

server.on('connection', connection => {
  connections.push(connection);
  connection.on('close', () => {
    connections = connections.filter(curr => curr !== connection);
  });
});

function shutDown() {
  logger.info('Received kill signal, shutting down gracefully');
  db.close();
  server.close(() => {
    logger.info('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    logger.warn('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  connections.forEach(curr => curr.end());
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}

// If our node process exits or is killed, close the db connection
process.on('SIGINT', () => {
  shutDown();
});
process.on('SIGTERM', () => {
  shutDown();
});
process.on('SIGHUP', () => {
  shutDown();
});

export default server;
