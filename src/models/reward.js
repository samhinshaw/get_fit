// creating a model gives us structure to our database which wouldn't otherwise
// exist in a NoSQL database. This structures it on the application level rather
// than the database level (as with a SQL database)

import mongoose from 'mongoose';

const { Schema } = mongoose;

// Date Schema

const rewardSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    for: {
      type: String,
      required: true,
    },
  },
  { collection: 'rewards' }
);

const Reward = mongoose.model('reward', rewardSchema);
export default Reward;
