// User model for authentication

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  calGoal: {
    type: Number,
    required: true
  },
  currentPoints: {
    type: Number,
    required: true
  }
});

const User = mongoose.model('user', userSchema);
module.exports = User;
