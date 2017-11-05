// creating a model gives us structure to our database which wouldn't otherwise
// exist in a NoSQL database. This structures it on the application level rather
// than the database level (as with a SQL database)

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Date Schema

const giftSchema = new Schema(
  {
    reward: {
      type: String,
      required: false
    },
    displayName: {
      type: String,
      required: false
    },
    points: {
      type: Number,
      required: false
    },
    sender: {
      type: String,
      required: true
    },
    timeSent: {
      type: Date,
      required: true
    },
    message: {
      type: String,
      required: false
    }
  },
  { collection: 'gifts' }
);

const Gift = mongoose.model('gift', giftSchema);
module.exports = Gift;
