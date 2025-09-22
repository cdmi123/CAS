const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-auction', 'completed', 'cancelled'],
    default: 'scheduled'
  }
});

module.exports = mongoose.model('Auction', auctionSchema);
