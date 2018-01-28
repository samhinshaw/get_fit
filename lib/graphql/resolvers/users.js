// Bring in mongoose model for Users
import User from '../../models/user';
// Find all users
const response = User.find(
  {},
  // for now JUST return the number of points!
  // { firstname: 1 },
  (err, res) => {
    if (err) {
      console.log(err);
    }
    return res;
  }
);

export default {
  Query: {
    users() {
      return response.then(users => users);
    }
  }
};
