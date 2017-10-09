// User model for authentication

const mongoose = require('mongoose');

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
  calGoal: {
    type: Number,
    required: true
  },
  password: {
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

const User = mongoose.model('user', userSchema);
module.exports = User;
