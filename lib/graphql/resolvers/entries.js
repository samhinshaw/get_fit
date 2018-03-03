// Bring in mongoose model for Users
import Entry from '../../models/entry';
import logger from '../../methods/logger';

export default {
  Query: {
    entries() {
      // compact version without error handling:
      // Entry.find({}).exec()
      return Entry.find({}, (err, res) => {
        if (err) {
          logger.error(err);
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
