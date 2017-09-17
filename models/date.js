// creating a model gives us structure to our database which wouldn't otherwise
// exist in a NoSQL database. This structures it on the application level rather
// than the database level (as with a SQL database)

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Article Schema

const dateSchema = new Schema(
  {
    date: {
      type: Schema.Types.Mixed,
      required: true
    },
    totalCals: {
      type: Number,
      required: true
    },
    exercise: {
      type: Schema.Types.Mixed,
      required: false
    },
    goalCals: {
      type: Number,
      required: true
    },
    netCals: {
      type: Number,
      required: true
    }
  },
  { collection: 'sam' }
);

const Date = mongoose.model('date', dateSchema);
module.exports = Date;
