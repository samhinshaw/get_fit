// Bring in mongoose model for Users
import Entry from '../../models/entry';
// Find all users
const response = Entry.find(
  {},
  // if we want to restrict return value
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
    entries() {
      return response.then(entries => entries);
    }
  }
};
