// creating a model gives us structure to our database which wouldn't otherwise
// exist in a NoSQL database. This structures it on the application level rather
// than the database level (as with a SQL database)

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Date Schema

const periodSchema = new Schema(
  {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    points: {
      type: Number,
      required: false
    }
  },
  { collection: 'periods' }
);

const Period = mongoose.model('period', periodSchema);
module.exports = Period;
