// User model for authentication

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  partner: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  mfp: {
    type: String,
    required: true
  },
  currentPoints: {
    type: Number,
    required: true
  },
  fitnessGoal: {
    type: String,
    required: false
  }
});

export default mongoose.model('User', userSchema);
