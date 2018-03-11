// This will contain all '/' routes
import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';
import express from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import mongoose from 'mongoose';
// Setup brute force prevention
import ExpressBrute from 'express-brute';
import MongooseStore from 'express-brute-mongoose';
import bruteForceSchema from 'express-brute-mongoose/dist/schema';
import nodeEmailVer from 'email-verification';

import logger from '../methods/logger';
import ensureAuthenticated from '../methods/auth';
import User from '../models/user';

const moment = extendMoment(Moment);

// Define Async middleware wrapper to avoid try-catch
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// authentication assurance
const model = mongoose.model('bruteforce', bruteForceSchema);
const store = new MongooseStore(model);
const secretConfig = require('../../config/secret/secret_config.json');

const failCallback = (req, res, next, nextValidRequestDate) => {
  req.flash(
    'danger',
    `You've made too many failed attempts in a short period of time, please try again ${moment(
      nextValidRequestDate
    ).fromNow()}`
  );
  res.redirect('/'); // brute force protection triggered, send them back to the main page
};

const bruteforce = new ExpressBrute(store, {
  failCallback
});

/*= ============================================
=          Email Verification Setup          =
============================================= */

const emailVer = nodeEmailVer(mongoose);

const saltAndHash = function saltAndHash(pwd, tempUserData, insertTempUser, callback) {
  bcrypt.genSalt(10, (saltErr, salt) => {
    if (saltErr) {
      logger.error('Error salting password: %j', saltErr);
      return;
    }
    bcrypt.hash(pwd, salt, (err, hash) => insertTempUser(hash, tempUserData, callback));
  });
};

emailVer.configure(
  {
    verificationURL: 'https://getse.xyz/email-verification/${URL}', // eslint-disable-line no-template-curly-in-string
    persistentUserModel: User,
    tempUserCollection: 'tempusers',

    transportOptions: {
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, // ssl
      auth: {
        user: 'welcome@getse.xyz',
        pass: secretConfig.zohoWelcomePassword
      }
    },
    verifyMailOptions: {
      from: 'Sam <welcome@getse.xyz>',
      subject: 'Please confirm account',
      html:
        '<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and paste the following link into your browser:</p><p>${URL}</p>', // eslint-disable-line no-template-curly-in-string
      text: 'Please confirm your account by clicking the following link: ${URL}' // eslint-disable-line no-template-curly-in-string
    },
    shouldSendConfirmation: false,
    confirmMailOptions: {
      from: 'Sam <welcome@getse.xyz>',
      subject: 'Successfully verified!',
      html: '<p>Your account has been successfully verified.</p>',
      text: 'Your account has been successfully verified.'
    },
    hashingFunction: saltAndHash
  },
  (err, options) => {
    if (err) {
      logger.error('Email verification configuration error: %j', err);
      return;
    }
    logger.debug(`configured:  ${typeof options === 'object'}`);
  }
);

emailVer.generateTempUserModel(User, (err, tempUserModel) => {
  if (err) {
    logger.error('Error generating temporary user model: %j', err);
    return;
  }
  logger.debug(`generated temp user model: ${typeof tempUserModel === 'function'}`);
});

/*= ====  End of Email Verification Setup  ====== */

// const auth = require('../config/auth.js');

const router = express.Router();

// Get Started Handling

// router.get('/', ensureAuthenticated, (req, res) => {
//   res.render('landing_page');
// });

// Register Form Route
router.get('/register', (req, res) => {
  // If already logged in, reroute to landing_page
  if (res.locals.loggedIn) {
    res.redirect('/');
  } else {
    res.render('register', {
      routeInfo: {
        heroType: 'dark',
        route: `/register`,
        userName: null,
        partnerName: null
      }
    });
  }
});

// Login Form
router.get('/login', (req, res) => {
  // If already logged in, reroute to landing_page
  if (res.locals.loggedIn) {
    res.redirect('/');
  } else {
    res.render('login', {
      routeInfo: {
        heroType: 'dark',
        route: `/login`,
        userName: null,
        partnerName: null
      }
    });
  }
});

// Login Process
// router.post('/login', bruteforce.prevent, (req, res, next) => {
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (authErr, user) => {
    if (authErr) {
      return next(authErr);
    }
    if (!user) {
      req.flash('danger', 'No User Found.');
      res.redirect('/login');
      return next();
    }
    req.logIn(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      res.cookie(
        'username',
        req.user.username,
        // {
        //   id: req.user.id,
        //   username: req.user.username,
        //   partner: req.user.partner,
        //   mfp: req.user.mfp,
        //   currentPoints: req.user.currentPoints
        // },
        { maxAge: 2592000000, signed: false }
      );
      // secure: true for HTTPS only
      // res.cookie('userid', req.user.id, { maxAge: 2592000000, secure: true, signed: false });
      res.redirect('/overview');
      return next();
    });
    return false;
  })(req, res, next);
});

// Loogout option
router.get('/logout', (req, res) => {
  res.clearCookie('username');
  req.logout();
  req.flash('info', 'Logged out');
  res.redirect('/');
});

router.get('/overview', ensureAuthenticated, (req, res) => {
  let userName;
  let partnerName;
  if (res.locals.user) {
    userName =
      res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1);
    partnerName =
      res.locals.partner.firstname.charAt(0).toUpperCase() +
      res.locals.partner.firstname.slice(1).toLowerCase();
  } else {
    userName = 'User';
    partnerName = 'Partner';
  }
  res.render('overview', {
    routeInfo: {
      heroType: 'dark',
      route: `/overview`,
      userName,
      partnerName
    }
  });
});

router.get('/login/help', (req, res) => {
  let userName;
  let partnerName;
  if (res.locals.user) {
    userName =
      res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1);
    partnerName =
      res.locals.partner.firstname.charAt(0).toUpperCase() +
      res.locals.partner.firstname.slice(1).toLowerCase();
  } else {
    userName = 'User';
    partnerName = 'Partner';
  }
  res.render('login-help', {
    routeInfo: {
      heroType: 'dark',
      route: `/login/help`,
      userName,
      partnerName
    }
  });
});

router.post('/login/resend', bruteforce.prevent, (req, res, next) => {
  const email = req.sanitize('email').trim();
  req.checkBody('email', 'Email is required').notEmpty();
  req
    .checkBody('email', 'Email is not valid')
    .isEmail()
    .trim()
    .normalizeEmail();
  const errors = req.validationErrors();
  if (errors) {
    errors.forEach(error => {
      req.flash('danger', error.msg);
    });
    res.redirect('/login/help');
    return next();
  }

  emailVer.resendVerificationEmail(email, (sendErr, userFound) => {
    if (sendErr) {
      // Handle errors
      logger.error('error resending verification email: %j', sendErr);
      req.flash('danger', 'Error resending verification email');
      res.redirect('/login/help');
      return next(sendErr);
    } else if (!userFound) {
      // Handle tempuser expiration
      req.flash('danger', 'Your verification code has expired. Please sign up again.');
      res.redirect('/login/help');
      return next();
    } else if (userFound) {
      // Handle success.
      req.flash('warning', `Verification email resent to ${email}.`);
      res.redirect('/login/help');
      return next();
    }
    // Otherwise, resending email failed?
    return false;
  });
  // Otherwise, something went wrong!
  return false;
});

// Handle Registration POSTS
router.post(
  '/register',
  bruteforce.prevent,
  asyncMiddleware(async (req, res, next) => {
    // express-validator sanitizes in-place (mutable), and works by
    const firstname = req.sanitize('firstname').trim();
    const lastname = req.sanitize('lastname').trim();
    const username = req.sanitize('username').trim();
    const email = req.sanitize('email').trim();
    const partner = req.sanitize('partner').trim();
    const fitnessGoal = req.sanitize('fitnessGoal').trim();
    const mfp = req.sanitize('mfp').trim();
    const accessCode = req.sanitize('accessCode').trim();
    // Not sanitizing password for now, since we're salting & hashing it.
    const password = req.body.password;
    // const passwordConfirm = req.body.passwordConfirm;

    req.checkBody('firstname', 'Name is required').notEmpty();
    // req.checkBody('lastname', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req
      .checkBody('email', 'Email is not valid')
      .isEmail()
      .trim()
      .normalizeEmail();
    req.checkBody('mfp', 'MyFitnessPal username is required').notEmpty();
    // In the future, make sure username is not taken!!
    req.checkBody('username', 'Username is required').notEmpty();
    // req.checkBody('partner', 'Partner is required').notEmpty();
    req.checkBody('accessCode', 'Access code is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('passwordConfirm', 'Passwords do not match').equals(req.body.password);
    // logger.log('Store code is: ', secretConfig.registrationSecret);

    const errors = req.validationErrors();
    // Set up for checking whether users already exist with the username

    if (errors) {
      // Or handle errors with flash
      errors.forEach(error => {
        req.flash('danger', error.msg);
      });
      res.redirect('#');
      return next(errors);
      // temporarily hard-wiring adding access code
    } else if (accessCode !== secretConfig.registrationSecret) {
      logger.error('Access code provided: ');
      logger.error(accessCode);
      req.flash('danger', 'Incorrect Access Code');
      res.redirect('#');
      return next();
    }
    // First make sure username or email is not already taken

    // Because the MongoDB function calls are async, if we specify a redirect
    // within the callback, it's not going to get evaluated right away.
    // Thereore, `return next()` won't get called until after the script has
    // kept running and called res.redirect already! So we need to make sure the final chunk doesn't get called before we know the results of the query. Hence await!
    const existingUserUsername = await User.findOne(
      {
        username
      },
      (queryErr, user) => {
        if (queryErr) {
          logger.error('Error finding existing user: %j', queryErr);
        }
        return user;
      }
    );

    if (existingUserUsername) {
      logger.warn(`${existingUserUsername.username} was attempted to be registered`);
      req.flash('danger', 'Sorry, that username is already registered!');
      res.redirect('#');
      return next();
    }
    const existingUserEmail = await User.findOne(
      {
        email
      },
      (queryErr, user) => {
        if (queryErr) {
          logger.error('Error finding existing user: %j', queryErr);
        }
        return user;
      }
    );

    if (existingUserEmail) {
      logger.warn(`${existingUserEmail.email} was attempted to be registered`);
      req.flash('danger', 'Sorry, that email address is already registered!');
      res.redirect('#');
      return next();
    }

    if (!existingUserUsername && !existingUserEmail) {
      // If we haven't redirected already, create a new user!
      const newUser = new User({
        firstname,
        lastname,
        username,
        email,
        mfp,
        partner,
        fitnessGoal,
        password,
        currentPoints: 0
      });

      emailVer.createTempUser(newUser, (createErr, existingPersistentUser, newTempUser) => {
        if (createErr) {
          logger.error('Error creating temp user: %j', createErr);
          req.flash(
            'danger',
            'Oops, something went wrong on our end and we failed to create your account.'
          );
          res.redirect('#');
          return next();
        }

        // user already exists in persistent collection...
        if (existingPersistentUser) {
          req.flash('danger', 'Username Taken');
          res.redirect('#');
          return next();
        }

        // a new user
        if (newTempUser) {
          const URL = newTempUser[emailVer.options.URLFieldName];
          // We're awaiting here so no redirecting is attempted within an async callback
          emailVer.sendVerificationEmail(email, URL, (sendErr, info) => {
            if (sendErr) {
              logger.error('Error sending verification email: %j', sendErr);
              req.flash(
                'danger',
                'Oops, something went wrong on our end and we failed to send your verification email.'
              );
              res.redirect('#');
              return next();
            }
            logger.info('Email send info: %j', info);
            req.flash('success', 'Success! Check your email for a verification link.');
            res.redirect('/');
            return next();
          });

          // otherwise if newTempUser is null
        } else {
          req.flash(
            'warning',
            "Hmm, it looks like you've already created an account! Check your email for a verification link."
          );
          res.redirect('#');
          return next();
        }
        return false;
      });
    }
    return false;
  })
);

// user accesses the link that is sent
router.get('/email-verification/:url', (req, res, next) => {
  const url = req.params.url;

  let userName;
  let partnerName;
  if (res.locals.user) {
    userName =
      res.locals.user.firstname.charAt(0).toUpperCase() + res.locals.user.firstname.slice(1);
    partnerName =
      res.locals.partner.firstname.charAt(0).toUpperCase() +
      res.locals.partner.firstname.slice(1).toLowerCase();
  } else {
    userName = 'User';
    partnerName = 'Partner';
  }

  emailVer.confirmTempUser(url, (confirmErr, user) => {
    if (confirmErr) {
      logger.error('Error confirming temporary user: %j', confirmErr);
      req.flash('danger', 'Error confirming email.');
      res.redirect('/');
      return next();
    } else if (!user) {
      logger.error('No user returned');
      req.flash('danger', 'Error confirming email.');
      res.redirect('/');
      return next();
    }
    logger.info(`${user.username} confirmed`);
    req.flash('success', 'Success! Your email address has been confirmed. You may now log in.');
    res.render('landing_page', {
      routeInfo: {
        heroType: 'landing_page',
        route: `/`,
        userName,
        partnerName
      }
    });
    return true;
  });
});

export default router;
