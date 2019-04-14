// This will contain all '/' routes
import express from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import mongoose from 'mongoose';
import Promise from 'bluebird';
// Setup brute force prevention
// import ExpressBrute from 'express-brute';
// import MongooseStore from 'express-brute-mongoose';
// import bruteForceSchema from 'express-brute-mongoose/dist/schema';
import nodeEmailVer from 'email-verification';
import emoji from 'node-emoji';
import Moment from 'moment-timezone';
import { extendMoment } from 'moment-range';

import logger from '../methods/logger';
import ensureAuthenticated from '../methods/auth';
import User from '../models/user';
import asyncMiddleware from '../middlewares/async-middleware';
import {
  exerciseMappings,
  exerciseGroups,
  exerciseGroupPoints,
} from '../myfitnesspal/exercises.const';

const moment = extendMoment(Moment);

const COST_FACTOR = 16;

/*= ============================================
=          Email Verification Setup          =
============================================= */

const emailVer = Promise.promisifyAll(nodeEmailVer(mongoose));

function saltAndHash(pwd, tempUserData, insertTempUser, callback) {
  bcrypt.genSalt(COST_FACTOR, (saltErr, salt) => {
    if (saltErr) {
      logger.error('Error salting password: %j', saltErr);
      return;
    }
    bcrypt.hash(pwd, salt, (err, hash) => insertTempUser(hash, tempUserData, callback));
  });
}

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
        pass: process.env.NODEJS_ZOHO_PASS,
      },
    },
    verifyMailOptions: {
      from: 'Sam <welcome@getse.xyz>',
      subject: 'Please confirm account',
      html:
        '<p>Please verify your account by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and paste the following link into your browser:</p><p>${URL}</p>', // eslint-disable-line no-template-curly-in-string
      text: 'Please confirm your account by clicking the following link: ${URL}', // eslint-disable-line no-template-curly-in-string
    },
    shouldSendConfirmation: false,
    confirmMailOptions: {
      from: 'Sam <welcome@getse.xyz>',
      subject: 'Successfully verified!',
      html: '<p>Your account has been successfully verified.</p>',
      text: 'Your account has been successfully verified.',
    },
    hashingFunction: saltAndHash,
  },
  (err, options) => {
    if (err) {
      logger.error('Email verification configuration error: %j', err);
      return;
    }
    logger.debug(`configured:  ${typeof options === 'object'}`);
  }
);

emailVer
  .generateTempUserModelAsync(User)
  .then(tempUser => logger.debug(`generated temp user model: ${typeof tempUser === 'function'}`))
  .catch(err => logger.error('Error generating temporary user model: %j', err));

/*= ====  End of Email Verification Setup  ====== */

const router = express.Router();

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
      },
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
      },
    });
  }
});

// Login Process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (authErr, user) => {
    if (authErr) {
      req.flash('danger', authErr.message);
      return next(authErr);
    }
    req.logIn(user, loginErr => {
      if (loginErr) {
        req.flash('danger', loginErr.message);
        return next(loginErr);
      }
      res.cookie(
        'username',
        req.user.username,
        // 7 days = 1000ms * 60s * 60m * 24h * 7d
        {
          maxAge: 1000 * 60 * 60 * 24 * 7,
          signed: false,
          sameSite: 'strict',
          // only set to secure in production
          secure: process.env.NODE_ENV === 'production',
        }
      );
      res.redirect('/overview');
      return next();
    });
    return false;
  })(req, res, next);
});

// Logout option
router.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.clearCookie('pointTally');
  req.logout();
  req.flash('info', 'Logged out');
  res.redirect('/');
});

router.get('/overview', ensureAuthenticated, (req, res) => {
  const possibleEmojis = [
    'skier',
    'runner',
    'running',
    'swimmer',
    'dancer',
    'golfer',
    'surfer',
    'rowboat',
    'snowboarder',
    'mountain_bicyclist',
    'bicyclist',
    'walking',
    'weight_lifter',
    'horse_racing',
  ];
  const exerciseEmoji = possibleEmojis[Math.floor(Math.random() * possibleEmojis.length)];
  res.render('overview', {
    routeInfo: {
      heroType: 'dark',
      route: `/overview`,
    },
    emoji: emoji.get(exerciseEmoji),
  });
});

router.get('/help', (req, res) => {
  res.render('help', {
    routeInfo: {
      heroType: 'dark',
      route: `/help`,
    },
  });
});

router.get('/privacy', (req, res) => {
  res.render('privacy', {
    routeInfo: {
      heroType: 'dark',
      route: `/privacy`,
    },
  });
});

router.post('/login/resend', (req, res, next) => {
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

  emailVer
    .resendVerificationEmailAsync(email)
    .then(user => {
      if (!user) {
        // Handle tempuser expiration
        req.flash(
          'danger',
          'Either your verification code expired, or no user was found with that email address. Please sign up again.'
        );
        res.redirect('/login/help');
        return next();
      }
      // Handle success.
      req.flash('warning', `Verification email resent to ${email}.`);
      res.redirect('/login/help');
      return next();
    })
    .catch(err => {
      logger.error('error resending verification email: %j', err);
      req.flash('danger', 'Error resending verification email');
      res.redirect('/login/help');
      return next(err);
    });
  return true;
});

// Handle Registration POSTS
router.post(
  '/register',
  asyncMiddleware(async (req, res, next) => {
    // express-validator sanitizes in-place (mutable), and works by
    const firstname = req.sanitize('firstname').trim();
    const lastname = req.sanitize('lastname').trim();
    const username = req.sanitize('username').trim();
    const email = req.sanitize('email').trim();
    // Amazing operator!! Just converts anything to boolean, because it's the
    // inverse of the inverse boolean
    const withPartner = !!req.body.withPartner;
    const partner = req.sanitize('partner').trim();
    const partnerEmail = req.sanitize('partnerEmail').trim();
    // const fitnessGoal = req.sanitize('fitnessGoal').trim();
    // For now, set up all users with a default fitness goal.
    const fitnessGoal = 'Working to get fit!';
    const mfp = req.sanitize('mfp').trim();
    const accessCode = req.sanitize('accessCode').trim();
    // Do not sanitize the password, since all we do is salt & hash it.
    const { password } = req.body;
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
    req.checkBody('username', 'Username must be at least 3 characters long.').isLength({ min: 3 });
    // req.checkBody('partner', 'Partner is required').notEmpty();
    req.checkBody('accessCode', 'Access code is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password must be at least 5 characters long.').isLength({ min: 5 });
    req.checkBody('passwordConfirm', 'Passwords do not match').equals(req.body.password);

    // If registering with partner, make sure username and email were supplied
    if (withPartner) {
      req
        .checkBody('username', 'You cannot add yourself as a partner!')
        .not()
        .equals(req.body.partner);
      req.checkBody('partner', 'Partner username is required').notEmpty();
      req.checkBody('partnerEmail', 'Partner email is required').notEmpty();
      req
        .checkBody('partnerEmail', 'Partner email is not valid')
        .isEmail()
        .trim()
        .normalizeEmail();
    }

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
    }
    if (accessCode !== process.env.NODEJS_REGISTRATION_SECRET) {
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
    // kept running and called res.redirect already! So we need to make sure the
    // final chunk doesn't get called before we know the results of the query.
    // Hence await! Overall, this route needs to be refactored and split up
    // QUITE A BIT.
    const existingUserUsername = await User.findOne(
      {
        username,
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
    const existingUserEmail = await User.findOne({ email });

    if (existingUserEmail) {
      logger.warn(`${existingUserEmail.email} was attempted to be registered`);
      req.flash('danger', 'Sorry, that email address is already registered!');
      res.redirect('#');
      return next();
    }

    /*= ============================================
    =                 Valid User                  =
    ============================================= */

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
        startDate: moment.tz('US/Pacific').format('YYYY-MM-DD'),
        currentPoints: 0,
        // Default exercise mappings, groups, and points
        exerciseMappings,
        exerciseGroups,
        exerciseGroupPoints,
      });

      await emailVer.createTempUser(newUser, (createErr, existingPermUser, newTempUser) => {
        if (createErr) {
          logger.error('Error creating temp user: %j', createErr);
          req.flash(
            'danger',
            'Oops, something went wrong on our end and we failed to create your account.'
          );
          res.redirect('#');
          return next();
        }
        if (existingPermUser) {
          req.flash('danger', 'Username Taken');
          res.redirect('#');
          return next();
        }
        if (!newTempUser) {
          // otherwise if newTempUser is null
          logger.info('Temp user already exists');
          req.flash(
            'warning',
            "Hmm, it looks like you've already created an account! Check your email for a verification link."
          );
          res.redirect('#');
          return next();
        }
        logger.info('Creating user: %j', newTempUser);
        const URL = newTempUser[emailVer.options.URLFieldName];
        // Destructuring Assignment For The Win (https://www.npmjs.com/package/await-to-js)
        emailVer.sendVerificationEmail(email, URL, async (sendErr, sendInfo) => {
          if (sendErr) {
            logger.error('Error sending verification email: %j', sendErr);
            req.flash(
              'danger',
              'Oops, something went wrong on our end and we failed to send your verification email.'
            );
            res.redirect('#');
            return next();
          }
          if (sendInfo) {
            logger.info('Email send info: %j', sendInfo);
          }
          // If user has registered with partner, flow is:
          // 1. Check to see if username matches
          //    a) Check to see if that user already has a partner
          //        i) Invite user to be partner
          //        ii) Let user know that user has a partner
          // 2. Check to see if email is taken
          //    a) Inform user that email address is registered (and they should check username)
          //        i) \/\/\/\/\/ Think about prefilling username here if email is registered? /\/\/\/\/\
          //    b) Invite user to Get Fit if email address is unregistered
          if (withPartner) {
            // 1. Check to see if username matches
            const foundPartner = await User.findOne({ username: partner }, err => {
              if (err) logger.error(err);
            });
            if (foundPartner) {
              //    a) Check to see if that user already has a partner
              //        i) Invite user to be partner
            } else if (partnerEmail) {
              // 2. Check to see if email is taken
              const partnerByEmail = await User.findOne({ email: partnerEmail }, err => {
                if (err) logger.error(err);
              });
              if (partnerByEmail) {
                //    a) Inform user that email address is registered (and they should check username)
                req.flash(
                  'danger',
                  "The email address you entered for your partner is already registered&mdash;make sure you have your partner's username correct!"
                );
                res.redirect('#');
                return next();
              }
              // b) Invite user to Get Fit if email address is unregistered
            }
          }
          // Finally, let the user know they were successful
          req.flash('success', 'Success! Check your email for a verification link.');
          res.redirect('/');
          return next();
        });
        return false;
      });
    }
    return false;
  })
);

router.post(
  '/register/validate',
  asyncMiddleware(async (req, res) => {
    // Make sure we're not getting hit with anything malicious! No bruteforce prevention here!
    const name = req.sanitize('name').trim();
    const value = req.sanitize('value').trim();
    // Check usernames
    if (name === 'username') {
      // First just make sure username is long enough. We could do this
      // client-side, but I wanted to keep the logic flow pretty.
      if (value.length < 3) {
        res.status(200).json({
          message: 'Your username must be at least 3 characters.',
          classType: 'danger',
        });
      } else {
        // Otherwise, check for the user in the database!
        const user = await User.findOne({ username: value }, err => {
          if (err) logger.error(err);
        });
        if (user) {
          res.status(200).json({ message: 'This username is taken.', classType: 'danger' });
        } else {
          res.status(200).json({
            message: 'This username is available',
            classType: 'success',
          });
        }
      }
    } else if (name === 'email') {
      // Make sure the email is valid
      req
        .checkBody('value', 'Email is not valid')
        .isEmail()
        .trim()
        .normalizeEmail();
      const errors = req.validationErrors();
      if (errors) {
        // Or handle errors with flash
        res.status(200).json({
          message: 'This is not a valid email address',
          classType: 'danger',
        });
      } else {
        const userByEmail = await User.findOne({ email: value }, err => {
          if (err) logger.error(err);
        });
        if (userByEmail) {
          res.status(200).json({
            message: 'This email address is already registered.',
            classType: 'danger',
          });
        } else {
          res.status(200).json({
            message: 'This email address is unregistered.',
            classType: 'success',
          });
        }
      }
    } else if (name === 'partner') {
      const partner = await User.findOne({ username: value }, err => {
        if (err) logger.error(err);
      });
      if (partner) {
        res.status(200).json({
          message: "This user is already registered. We'll send them a partner request!",
          classType: 'success',
        });
      } else {
        res.status(200).json({
          message:
            "This user is not yet registered! Input their email address and we'll invite them to Get Fit!",
          classType: 'info',
        });
      }
    } else if (name === 'partnerEmail') {
      // Make sure the email is valid
      req
        .checkBody('value', 'Email is not valid')
        .isEmail()
        .trim()
        .normalizeEmail();
      const errors = req.validationErrors();
      if (errors) {
        // Or handle errors with flash
        res.status(200).json({
          message: 'This is not a valid email address',
          classType: 'danger',
        });
      } else {
        const partnerByEmail = await User.findOne({ email: value }, err => {
          if (err) logger.error(err);
        });
        if (partnerByEmail) {
          res.status(200).json({
            message:
              "This email address is already registered&mdash;make sure you have your partner's username correct!",
            classType: 'danger',
          });
        } else {
          res.status(200).json({
            message: "This email address is unregistered, we'll invite them!",
            classType: 'success',
          });
        }
      }
    }
    // console.log('response obj: ', res);
    // res.status(500).json({ message: 'Error updating from MyFitnessPal', type: 'danger' });
  })
);

// user accesses the link that is sent
router.get('/email-verification/:url', (req, res, next) => {
  const { url } = req.params;

  const user = emailVer
    .confirmTempUser(url, (confirmErr, foundUser) => {
      if (confirmErr) throw new Error(confirmErr);
      return foundUser;
    })
    .catch(err => {
      logger.error('Error confirming temporary user: %j', err);
      req.flash('danger', 'Error confirming email.');
      res.redirect('/');
      return next();
    });

  if (!user) {
    logger.error('No user returned');
    req.flash('danger', 'Error confirming email.');
    res.redirect('/');
    return next();
  }

  logger.info(`${user.username} confirmed`);
  req.flash('success', 'Success! Your email address has been confirmed. You may now log in.');
  res.redirect('/');
  return true;
});

export default router;
