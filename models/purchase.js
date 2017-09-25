// creating a model gives us structure to our database which wouldn't otherwise
// exist in a NoSQL database. This structures it on the application level rather
// than the database level (as with a SQL database)

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Date Schema

const purchaseSchema = new Schema(
  {
    reward: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    pointCost: {
      type: Number,
      required: true
    },
    requester: {
      type: String,
      required: true
    },
    timeRequested: {
      type: Date,
      required: true
    },
    // dateRequestedFor: {
    //   type: Date,
    //   required: false
    // },
    approved: {
      type: Boolean,
      required: true
    },
    timeApproved: {
      type: Date,
      required: false
    }
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
  { collection: 'purchases' }
);

const Purchase = mongoose.model('purchase', purchaseSchema);
module.exports = Purchase;
