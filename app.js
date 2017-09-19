// bring in express for routing
const express = require('express');
const path = require('path'); // core module included with Node.js
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');

// set prefs
const port = 8005;

// Connect to MongoDB
// NOTE, this syntax is deprecated
// http://mongoosejs.com/docs/connections.html#use-mongo-client
// http://mongoosejs.com/docs/promises.html
// THIS IS THE NEW SYNTAX
// promise.then((db) => {});
// const promise = mongoose.connect('mongodb://localhost/myapp', {
//   useMongoClient: true,
// });
mongoose.connect('mongodb://localhost:27025/get_fit');
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
const Article = require('./models/article');
const Date = require('./models/date');

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

// Print in the page info we're using to style the page with Bulma
const pageInfo = {
  heroType: 'dark',
  route: '/'
};

// Print in the user info we're using to style the page with Bulma
const userInfo = {
  sam: {
    points: 3,
    pointsClass: 'danger'
  },
  amelia: {
    points: 0,
    pointsClass: 'danger'
  }
};

// Use middleware to modify locals object (makes available to view engine!)
// https://stackoverflow.com/questions/12550067/expressjs-3-0-how-to-pass-res-locals-to-a-jade-view
app.use((req, res, next) => {
  res.locals.pageInfo = pageInfo;
  res.locals.userInfo = userInfo;
  next();
});

// Home Route
app.get('/', (req, res) => {
  Article.find(
    {
      // empty curly braces for blank find function
      // this will pull ALL results for us
    },
    (err, articles) => {
      if (err) {
        console.log(err);
      } else {
        res.render('index', {
          // Object to send data along with response
          title: 'Get Fit!',
          articles
        });
      }
    }
  );
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
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
