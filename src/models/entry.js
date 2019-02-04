// creating a model gives us structure to our database which wouldn't otherwise
// exist in a NoSQL database. This structures it on the application level rather
// than the database level (as with a SQL database)

import mongoose from 'mongoose';

const { Schema } = mongoose;

// Date Schema

const entrySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    totalCals: {
      type: Number,
      required: true,
    },
    goalCals: {
      type: Number,
      required: true,
    },
    netCals: {
      type: Number,
      required: true,
    },
    exercise: {
      type: Schema.Types.Mixed,
      required: false,
    },
    isEmpty: {
      type: Boolean,
      required: true,
    },
    complete: {
      type: Boolean,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
  },
  { collection: 'entries' },
);

const Entry = mongoose.model('entry', entrySchema);
export default Entry;
