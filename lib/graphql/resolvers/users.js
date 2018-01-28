// Bring in mongoose model for Users
import User from '../../models/user';
// Find all users
export default {
  Query: {
    users() {
      // compact version without error handling:
      // User.find({}).exec()
      return User.find({}, (err, res) => {
        if (err) {
          console.log(err);
        }
        return res;
      }).exec();
    }
  }
};
