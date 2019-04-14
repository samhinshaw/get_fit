import bcrypt from 'bcryptjs';
import { Strategy } from 'passport-local';

import User from '../models/user';

// const LocalStrategy = require('passport-local').Strategy;

// const config = require('../config/database');

export default function authMiddleware(passport) {
  // Local Strategy
  passport.use(
    new Strategy((username, password, done) => {
      // Match username
      const query = {
        username,
      };
      User.findOne(query, (queryErr, user) => {
        if (queryErr) throw queryErr;
        if (!user) {
          return done(null, false, { message: 'No user found.' });
        }

        // Match Password
        bcrypt.compare(password, user.password, (compareErr, isMatch) => {
          if (compareErr) throw compareErr;
          if (isMatch) {
            return done(null, user);
          }
          return done(null, false, { message: 'Invalid password.' });
        });
        return true;
      });
    }));

  passport.serializeUser((user, done) => {
    done(null, {
      id: user.id,
      username: user.username,
    });
  });

  passport.deserializeUser((userObj, done) => {
    User.findById(userObj.id, (err, user) => done(err, user));
  });
}
