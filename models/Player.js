const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'],
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: '/images/default-player.png'
  },
  currentBid: {
    type: Number,
    default: 0
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  status: {
    type: String,
    enum: ['unsold', 'sold', 'in-auction'],
    default: 'unsold'
  },
  stats: {
    matches: {
      type: Number,
      default: 0
    },
    runs: {
      type: Number,
      default: 0
    },
    wickets: {
      type: Number,
      default: 0
    }
  }
});

module.exports = mongoose.model('Player', playerSchema);