// creating a model gives us structure to our database which wouldn't otherwise
// exist in a NoSQL database. This structures it on the application level rather
// than the database level (as with a SQL database)

import mongoose from 'mongoose';

const { Schema } = mongoose;

// Date Schema

const requestSchema = new Schema(
  {
    reward: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    pointCost: {
      type: Number,
      required: true,
    },
    requester: {
      type: String,
      required: true,
    },
    timeRequested: {
      type: Date,
      required: true,
    },
    requestMessage: {
      type: String,
      required: false,
    },
    responseMessage: {
      type: String,
      required: false,
    },
    // dateRequestedFor: {
    //   type: Date,
    //   required: false
    // },
    status: {
      type: String,
      required: true,
    },
    timeResponded: {
      type: Date,
      required: false,
    },
    // dateScheduled: {
    //   type: Date,
    //   required: false
    // }
    // object: {
    //   type: Schema.Types.Mixed,
    //   required: false
    // }
    // lastUpdated: {
    //   type: Date,
    //   required: true
    // }
  },
  { collection: 'requests' }
);

const Request = mongoose.model('request', requestSchema);
export default Request;
