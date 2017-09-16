const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nunjucks = require('nunjucks');
const expressValidator = require('express-validator');

// Databases!
var mongojs = require('mongojs');
var db = mongojs('usersapp', ['users']);

const app = express();
const isDev = app.get('env') === 'development';
// const expressNunjucks = require('express-nunjucks');

const port = '8005';

const ObjectId = mongojs.ObjectId;

nunjucks.configure('views', {
  express: app
});
// app.set('views', path.join(__dirname, 'views'));

// so we don't need to specify .njk exts in filenames
app.set('view engine', 'njk');

// Look up what these are in the bodyParser documentation
// bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// middleware for our static assets If we wanted to use a client-side
// framework, we could put that all in this folder to be sent down.
// However, in this example we'll be doing server-side rendering.
app.use(express.static(path.join(__dirname, 'public')));

// Global Vars
app.use((req, res, next) => {
  res.locals.errors = null;
  next();
});

// express form validation
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      const namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

app.get('/', (req, res, next) => {
  db.users.find(function(err, docs) {
    res.render('index', {
      users: docs,
      title: 'Customers'
    });
  });
});

app.post('/users/add', (req, res) => {
  req.checkBody('firstName', 'First name is required').notEmpty;
  req.checkBody('lastName', 'Last name is required').notEmpty;
  req.checkBody('email', 'Email name is required').notEmpty;

  const validationErrors = req.validationErrors();

  if (validationErrors) {
    res.render('index', {
      users: docs,
      title: 'Customers',
      errors: validationErrors
    });
    console.log('Failure');
  } else {
    const newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    };
    console.log('Success');

    db.users.insert(newUser, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  }
});

app.delete('/users/delete/:id', (req, res) => {
  db.users.remove(
    {
      _id: ObjectId(req.params.id)
    },
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    }
  );
});

// look up form validation libraries

app.listen(port, () => {
  console.log('Server started in port ' + port);
});
