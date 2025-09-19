const Player = require('../models/Player');
const Team = require('../models/Team');
const Bid = require('../models/Bid');

// Admin dashboard
exports.getDashboard = async (req, res) => {
  try {
    const players = await Player.find();
    const teams = await Team.find().populate('user', 'username email');
    const soldPlayers = await Player.find({ status: 'sold' });
    const unsoldPlayers = await Player.find({ status: 'unsold' });
    const totalBids = await Bid.countDocuments();
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      players,
      teams,
      soldPlayers,
      unsoldPlayers,
      totalBids
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Add player page
exports.getAddPlayer = (req, res) => {
  res.render('admin/add-player', {
    title: 'Add Player'
  });
};

// Add player handle
exports.addPlayer = async (req, res) => {
  const { name, role, basePrice, matches, runs, wickets } = req.body;
  
  try {
    const player = new Player({
      name,
      role,
      basePrice,
      stats: {
        matches,
        runs,
        wickets
      }
    });
    
    await player.save();
    req.flash('success_msg', 'Player added successfully');
    res.redirect('/admin/players');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add player');
    res.redirect('/admin/players/add');
  }
};

// Players list
exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.render('admin/players', {
      title: 'Players',
      players
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Edit player page
exports.getEditPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      req.flash('error_msg', 'Player not found');
      return res.redirect('/admin/players');
    }
    
    res.render('admin/edit-player', {
      title: 'Edit Player',
      player
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Update player
exports.updatePlayer = async (req, res) => {
  try {
    const { name, role, basePrice, matches, runs, wickets } = req.body;
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      req.flash('error_msg', 'Player not found');
      return res.redirect('/admin/players');
    }
    
    player.name = name;
    player.role = role;
    player.basePrice = basePrice;
    player.stats.matches = matches;
    player.stats.runs = runs;
    player.stats.wickets = wickets;
    
    await player.save();
    req.flash('success_msg', 'Player updated successfully');
    res.redirect('/admin/players');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update player');
    res.redirect('/admin/players');
  }
};

// Delete player
exports.deletePlayer = async (req, res) => {
  try {
    await Player.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Player deleted successfully');
    res.redirect('/admin/players');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete player');
    res.redirect('/admin/players');
  }
};

// Teams list
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate('user', 'username email').populate('players');
    res.render('admin/teams', {
      title: 'Teams',
      teams
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// View team details
exports.getTeamDetails = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('user', 'username email')
      .populate('players');
    
    if (!team) {
      req.flash('error_msg', 'Team not found');
      return res.redirect('/admin/teams');
    }
    
    res.render('admin/team-details', {
      title: 'Team Details',
      team
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Auction control
exports.getAuction = async (req, res) => {
  try {
    // Get all unsold players
    let players = await Player.find({ status: 'unsold' });
    
    // If no unsold players, get all players that are not sold
    if (players.length === 0) {
      players = await Player.find({ status: { $ne: 'sold' } });
    }
    
    const currentPlayer = await Player.findOne({ status: 'in-auction' });
    
    res.render('admin/auction', {
      title: 'Auction Control',
      players,
      currentPlayer
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Start auction for a player
exports.startAuction = async (req, res) => {
  try {
    const player = await Player.findById(req.body.playerId);
    
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

// End auction
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

// Get auction statistics
exports.getAuctionStats = async (req, res) => {
  try {
    const totalPlayers = await Player.countDocuments();
    const soldPlayers = await Player.countDocuments({ status: 'sold' });
    const unsoldPlayers = await Player.countDocuments({ status: 'unsold' });
    const inAuctionPlayers = await Player.countDocuments({ status: 'in-auction' });
    const totalTeams = await Team.countDocuments();
    const totalBids = await Bid.countDocuments();
    
    // Get top 5 most expensive players
    const topPlayers = await Player.find({ status: 'sold' })
      .sort({ currentBid: -1 })
      .limit(5);
    
    // Get team spending
    const teamSpending = await Team.aggregate([
      {
        $lookup: {
          from: 'players',
          localField: 'players',
          foreignField: '_id',
          as: 'playerDetails'
        }
      },
      {
        $project: {
          name: 1,
          owner: 1,
          budget: 1,
          spent: { $sum: '$playerDetails.currentBid' },
          players: { $size: '$players' }
        }
      }
    ]);
    
    res.json({
      totalPlayers,
      soldPlayers,
      unsoldPlayers,
      inAuctionPlayers,
      totalTeams,
      totalBids,
      topPlayers,
      teamSpending
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};