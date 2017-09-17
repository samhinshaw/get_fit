// bring in express for routing
const express = require('express');
const path = require('path'); // core module included with Node.js
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

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

// Route to Sam's Data
app.get('/sam', (req, res) => {
  Date.find(
    {
      // maybe we'll want a Date object in MongoDB later
      // maybe logic for date range
    },
    (err, dates) => {
      if (err) {
        console.log(err);
      } else {
        res.render('sam', {
          // Object to send data along with response
          title: 'Get Sam Fit!',
          dates
        });
      }
    }
  );
});

// Add a new route for submitting articles Note: For some reason, if this is
// called AFTER the route for individual articles, the view template 'data' gets
// called instead. Perhaps something to do with it trying to find an artcile
// with the `:id`/`._id` of 'submit'?
app.get('/data/submit', (req, res) => {
  res.render('data_submit', {
    title: 'Submit Data'
  });
});

// Add route for individual articles
app.get('/data/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('data', {
      article
    });
  });
});

// Add route for editing articles
app.get('/data/edit/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('data_edit', {
      title: 'Edit Article',
      article
    });
  });
});

// Catch the POST requests from the edit form!
app.post('/data/edit/:id', (req, res) => {
  const article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  const query = { _id: req.params.id };

  Article.update(query, article, (err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

// Catch the POST requests from the submit form!
app.post('/data/submit', (req, res) => {
  const article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

// Deleting is more difficult! With our forms and buttons we can only process
// POST and GET requests, but we want to process a DELETE request! So we'll have
// to use AJAX

app.delete('/article/:id', (req, res) => {
  const query = { _id: req.params.id };

  Article.remove(query, (err) => {
    if (err) {
      console.log(err);
    }

    res.send('Success'); // by default will send 200
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
