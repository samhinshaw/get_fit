// This will contain all '/data/' routes

const express = require('express');
const auth = require('../config/auth.js');

const router = express.Router();

// Bring in Article model
const Article = require('../models/article');

// Print in the page info we're using to style the page with Bulma
const pageInfo = {
  heroType: 'success',
  route: '/data'
};

// Print in the user info we're using to style the page with Bulma
const userInfo = {
  sam: {
    points: 3,
    pointsClass: 'danger'
  },
  amelia: {
    points: -1,
    pointsClass: 'danger'
  }
};

// Use middleware to modify locals object (makes available to view engine!)
// https://stackoverflow.com/questions/12550067/expressjs-3-0-how-to-pass-res-locals-to-a-jade-view
router.use((req, res, next) => {
  res.locals.pageInfo = pageInfo;
  res.locals.userInfo = userInfo;
  next();
});

// Add a new route for submitting articles Note: For some reason, if this is
// called AFTER the route for individual articles, the view template 'data' gets
// called instead. Perhaps something to do with it trying to find an artcile
// with the `:id`/`._id` of 'submit'?
router.get('/submit', (req, res) => {
  res.render('data_submit', {});
});

// Add route for individual articles
router.get('/:id', auth.ensureAuthentication, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('data', {
      article
    });
  });
});

// Add route for editing articles
router.get('/edit/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author !== req.user._id) {
      req.flash('danger', 'Not authorized');
      res.redirect('/');
    }
    res.render('data_edit', {
      title: 'Edit Article',
      article
    });
  });
});

// Catch the POST requests from the edit form!
router.post('/edit/:id', (req, res) => {
  const article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  const query = { _id: req.params.id };

  Article.update(query, article, err => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

// Catch the POST requests from the submit form!
router.post('/submit', (req, res) => {
  // More validation examples available at express-validator
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  // Get the errors (if there are any)

  const errors = req.validationErrors();

  if (errors) {
    // If errors, re-render
    // res.render('data_submit', {
    //   errors
    // });
    // Or maybe instead flash a message rather than re-render?
    // using forEach instead of map because map is designed to return a new array!
    errors.forEach(error => {
      req.flash('danger', error.msg);
    });

    res.redirect('#');
  } else {
    // Otherwise, do what we were doing already!
    const article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(err => {
      if (err) {
        console.log(err);
      } else {
        // once we've submitted and everything is okay, let's give the user an
        // alert!
        req.flash('success', 'Article Added!');
        res.redirect('/');
      }
    });
  }
});

// Deleting is more difficult! With our forms and buttons we can only process
// POST and GET requests, but we want to process a DELETE request! So we'll have
// to use AJAX

router.delete('/:id', (req, res) => {
  const query = { _id: req.params.id };

  Article.remove(query, err => {
    if (err) {
      console.log(err);
    }

    res.send('Success'); // by default will send 200
  });
});

module.exports = router;
