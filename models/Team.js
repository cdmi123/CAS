const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    required: false
  },
  ownerPhone: {
    type: String,
    required: false
  },
  budget: {
    type: Number,
    default: 10000000
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  logo: {
    type: String,
    default: '/images/default-team.png'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Team', teamSchema);