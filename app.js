// bring in express for routing
const express = require('express');
const path = require('path'); // core module included with Node.js
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const config = require('./config/database');

const moment = MomentRange.extendMoment(Moment);
moment().format(); // required by package entirely
const now = moment().tz('US/Pacific');
const today = now.clone().startOf('day');
const startofTracking = moment('09-18-2017', 'MM-DD-YYYY')
  .tz('US/Pacific')
  .startOf('day');
const twoWeeksAgo = today.clone().subtract(14, 'days');
// .startOf('week')    = Sunday
// .startOf('isoweek') = Monday
const customRanges = [
  {
    // We started Monday, Sept 18th
    key: 'sinceStart',
    startDate: startofTracking,
    endDate: today
  },
  {
    key: 'pastTwoWeeks',
    startDate: twoWeeksAgo,
    endDate: today
  }
];
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
db.on('error', (err) => {
  console.log(err);
});

// initialize app
const app = express();

// Include document Schemas
// const Purchase = require('./models/purchase');
// const Period = require('./models/period');
const Sam = require('./models/sam');
const Amelia = require('./models/amelia');

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
app.use(session({
  secret: 'little chessie',
  resave: true,
  saveUninitialized: true
  // cookie: { secure: true }
}));

// Messages Middleware (pretty client messaging)
app.use(require('connect-flash')());

app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Form Validation Middleware
app.use(expressValidator({
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
}));

// Passport Config Middleware
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Include custom middleware
const mongoMiddleware = require('./middlewares/mongoMiddleware');

// ////////////////////////////////////////////////////////////////
// /////////.///// MIDDLEWARE TO CALCULATE POINTS /////////////////
// ////////////////////////////////////////////////////////////////
app.use(asyncMiddleware(async (req, res, next) => {
  // Don't need try, catch anymore since asyncMiddleware (see top of app.js) is
  // handling async errors
  const samWeekPeriods = await mongoMiddleware.queryWeeksFromMongo(Sam);
  const samCustomPeriods = await mongoMiddleware.queryCustomPeriodsFromMongo(Sam);
  const ameliaWeekPeriods = await mongoMiddleware.queryWeeksFromMongo(Amelia);
  const ameliaCustomPeriods = await mongoMiddleware.queryCustomPeriodsFromMongo(Amelia);

  const pointTotals = {
    sam: {
      weekTotals: samWeekPeriods,
      customTotals: samCustomPeriods
    },
    amelia: {
      weekTotals: ameliaWeekPeriods,
      customTotals: ameliaCustomPeriods
    }
  };
  res.locals.pointTotals = pointTotals;

  // make the most important entries available at the top level
  // if more specific ones needed, we can get those within the views template
  const samPointTally = samCustomPeriods.find(element => element.key === 'sinceStart');
  const ameliaPointTally = ameliaCustomPeriods.find(element => element.key === 'sinceStart');

  const pointTally = {
    sam: parseFloat(samPointTally.points),
    amelia: parseFloat(ameliaPointTally.points)
  };

  res.locals.pointTally = pointTally;
  next();
}));

// ////////////////////////////////////////////////////////////////
// /////////.///// MIDDLEWARE TO CALCULATE POINTS /////////////////
// ////////////////////////////////////////////////////////////////

// Print in the page info we're using to style the page with Bulma
const pageInfo = {
  heroType: 'dark',
  route: '/',
  user: 'main'
};

// Use middleware to modify locals object (makes available to view engine!)
// https://stackoverflow.com/questions/12550067/expressjs-3-0-how-to-pass-res-locals-to-a-jade-view
app.use((req, res, next) => {
  res.locals.pageInfo = pageInfo;
  next();
});

// Home Route
app.get('/', (req, res) => {
  res.render('index', {
    // Object to send data along with response
    title: 'Get Fit!'
  });
});

// Bring in route files
const data = require('./routes/data');
const users = require('./routes/users');
const sam = require('./routes/sam');
const amelia = require('./routes/amelia');

app.use('/data', data);
app.use('/users', users);
app.use('/sam', sam);
app.use('/amelia', amelia);

// Start Server
app.listen(config.serverPort, () => {
  console.log(`Server started on port ${config.serverPort}`);
});
