// Bring in mongoose model for Users
import User from '../../models/user';
import logger from '../../methods/logger';

// Find all users
export default {
  Query: {
    users() {
      // compact version without error handling:
      // User.find({}).exec()
      return User.find({}, (err, res) => {
        if (err) {
          logger.error(err);
        }
        return res;
      }).exec();
    }
  },
  Mutation: {
    createUser(obj, { username }, context) {
      // Generate User object, which also generates ID!
      const user = new User({
        firstname: 'joe',
        lastname: 'schmo',
        username,
        email: 'joe.blow@gmail.com',
        password: 123,
        mfp: 'joe28',
        currentPoints: 0
      });

      // Save to database
      user.save(err => {
        if (err) {
          logger.error(err);
        }
      });

      // now take the instantiated ID and check for it!
      return user;
    }
  }
};
