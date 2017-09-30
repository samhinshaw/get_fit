const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
// const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = passport => {
  // Local Strategy
  passport.use(
    new LocalStrategy((username, password, done) => {
      // Match username
      const query = {
        username
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
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
};
