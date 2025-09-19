const Player = require('../models/Player');
const Team = require('../models/Team');
const Bid = require('../models/Bid');

// Place a bid
exports.placeBid = async (req, res) => {
  const { playerId, teamId, amount } = req.body;
  
  try {
    const player = await Player.findById(playerId);
    const team = await Team.findById(teamId);
    
    if (!player || !team) {
      return res.status(404).json({ message: 'Player or team not found' });
    }
    
    if (player.status !== 'in-auction') {
      return res.status(400).json({ message: 'Player is not in auction' });
    }
    
    // Check if bid is higher than current bid
    if (amount <= player.currentBid) {
      return res.status(400).json({ 
        message: `Bid must be higher than current bid (₹${player.currentBid.toLocaleString()})` 
      });
    }
    
    // Check if team has sufficient budget
    if (amount > team.budget) {
      return res.status(400).json({ 
        message: `Insufficient budget. Your budget is ₹${team.budget.toLocaleString()}` 
      });
    }
    
    // Check if team is already the highest bidder
    if (player.highestBidder && player.highestBidder.toString() === teamId) {
      return res.status(400).json({ message: 'You are already the highest bidder' });
    }
    
    // Create bid record
    const bid = new Bid({
      player: playerId,
      team: teamId,
      amount
    });
    
    await bid.save();
    
    // Update player
    player.currentBid = amount;
    player.highestBidder = teamId;
    await player.save();
    
    // Get team name for response
    const biddingTeam = await Team.findById(teamId);
    
    res.json({
      success: true,
      message: 'Bid placed successfully',
      currentBid: amount,
      teamName: biddingTeam.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Start auction for a player
exports.startAuction = async (req, res) => {
  const { playerId } = req.body;
  
  try {
    const player = await Player.findById(playerId);
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    if (player.status !== 'unsold') {
      return res.status(400).json({ message: 'Player is not available for auction' });
    }
    
    // Reset current bid
    player.currentBid = player.basePrice;
    player.status = 'in-auction';
    player.highestBidder = null;
    await player.save();
    
    res.json({
      success: true,
      message: 'Auction started for player',
      player
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// End auction for current player
exports.endAuction = async (req, res) => {
  try {
    const player = await Player.findOne({ status: 'in-auction' });
    
    if (!player) {
      return res.status(400).json({ message: 'No player currently in auction' });
    }
    
    const team = await Team.findById(player.highestBidder);
    
    if (team && player.currentBid > 0) {
      // Update team
      team.budget -= player.currentBid;
      team.players.push(player._id);
      await team.save();
      
      // Update player
      player.status = 'sold';
      await player.save();
      
      res.json({
        success: true,
        message: 'Auction ended',
        player,
        sold: true,
        teamName: team.name
      });
    } else {
      // No bids, mark as unsold
      player.status = 'unsold';
      player.currentBid = 0;
      player.highestBidder = null;
      await player.save();
      
      res.json({
        success: true,
        message: 'Auction ended',
        player,
        sold: false
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all players
exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get player by ID
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('players');
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current auction status
exports.getAuctionStatus = async (req, res) => {
  try {
    const currentPlayer = await Player.findOne({ status: 'in-auction' });
    const auctionActive = currentPlayer ? true : false;
    
    res.json({
      auctionActive,
      currentPlayer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bid history for a player
exports.getPlayerBidHistory = async (req, res) => {
  try {
    const bids = await Bid.find({ player: req.params.id })
      .populate('team', 'name')
      .sort({ timestamp: -1 });
    
    res.json(bids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bid history for a team
exports.getTeamBidHistory = async (req, res) => {
  try {
    const bids = await Bid.find({ team: req.params.id })
      .populate('player', 'name role')
      .sort({ timestamp: -1 });
    
    res.json(bids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};