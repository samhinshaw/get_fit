// User model for authentication

import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  partner: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  mfp: {
    type: String,
    required: true,
  },
  currentPoints: {
    type: Number,
    required: true,
  },
  fitnessGoal: {
    type: String,
    required: false,
  },
  startDate: {
    type: String,
    required: false,
  },
  exerciseMappings: {
    type: [[String, String]],
    required: true,
  },
  exerciseGroups: {
    type: [[String, String]],
    required: true,
  },
  exerciseGroupPoints: {
    type: [[String, Number]],
    required: true,
  },
});

export default mongoose.model('User', userSchema);
