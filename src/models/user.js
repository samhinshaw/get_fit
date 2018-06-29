// User model for authentication

import mongoose from 'mongoose';

const { Schema } = mongoose;

const exerciseGroupSchema = new Schema({
  group: {
    type: String,
    required: true
  },
  pointsPerHour: {
    type: Number,
    required: true
  },
  exercises: {
    type: [String],
    required: true
  }
});

const exerciseMappingSchema = new Schema({
  mfpName: {
    type: String,
    required: true
  },
  mappedName: {
    type: String,
    required: true
  }
});

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
  },
  exerciseMappings: {
    type: [exerciseMappingSchema],
    required: false
  },
  exerciseGroups: {
    type: [exerciseGroupSchema],
    required: true
  }
});

export default mongoose.model('User', userSchema);
