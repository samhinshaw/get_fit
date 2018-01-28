// Bring in mongoose model for Users
import Entry from '../../models/entry';

export default {
  Query: {
    entries() {
      // compact version without error handling:
      // Entry.find({}).exec()
      return Entry.find({}, (err, res) => {
        if (err) {
          console.log(err);
        }
        return res;
      }).exec();
    }
  }
  // Mutation: {
  //   updateEntry() {

  //   }
  // }
};
