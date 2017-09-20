// creating a model gives us structure to our database which wouldn't otherwise
// exist in a NoSQL database. This structures it on the application level rather
// than the database level (as with a SQL database)

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Date Schema

const ameliaSchema = new Schema(
  {
    date: {
      type: Date,
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
    },
    isEmpty: {
      type: Boolean,
      required: true
    },
    points: {
      type: Number,
      required: true
    }
    // lastUpdated: {
    //   type: Date,
    //   required: true
    // }
  },
  { collection: 'amelia' }
);

const Amelia = mongoose.model('amelia', ameliaSchema);
module.exports = Amelia;
