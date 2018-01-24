// creating a model gives us structure to our database which wouldn't otherwise
// exist in a NoSQL database. This structures it on the application level rather
// than the database level (as with a SQL database)

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Date Schema

const periodSchema = new Schema(
  {
    key: {
      type: String,
      required: true
    },
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
    },
    user: {
      type: String,
      required: true
    }
  },
  { collection: 'periods' }
);

const Period = mongoose.model('period', periodSchema);
export default Period;
