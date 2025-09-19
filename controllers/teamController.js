const Team = require('../models/Team');
const Player = require('../models/Player');
const Bid = require('../models/Bid');

// Team dashboard
exports.getDashboard = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.user._id })
      .populate('players');
    
    if (!team) {
      return res.render('errors/404', {
        message: 'Team not found'
      });
    }
    
    // Calculate total spent
    const totalSpent = team.players.reduce((sum, player) => sum + player.currentBid, 0);
    const remainingBudget = team.budget - totalSpent;
    
    res.render('team/dashboard', {
      title: 'Team Dashboard',
      team,
      totalSpent,
      remainingBudget
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Players list
exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.find({ status: 'unsold' });
    const team = await Team.findOne({ user: req.user._id });
    
    res.render('team/players', {
      title: 'Available Players',
      players,
      team
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Player details
exports.getPlayerDetails = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    const team = await Team.findOne({ user: req.user._id });
    
    if (!player) {
      req.flash('error_msg', 'Player not found');
      return res.redirect('/team/players');
    }
    
    // Get bid history for this player
    const bidHistory = await Bid.find({ player: player._id })
      .populate('team', 'name')
      .sort({ timestamp: -1 });
    
    res.render('team/player-details', {
      title: 'Player Details',
      player,
      team,
      bidHistory
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Auction page
exports.getAuction = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.user._id });
    const currentPlayer = await Player.findOne({ status: 'in-auction' });
    
    // Get recent bids for the current player
    let recentBids = [];
    if (currentPlayer) {
      recentBids = await Bid.find({ player: currentPlayer._id })
        .populate('team', 'name')
        .sort({ timestamp: -1 })
        .limit(5);
    }
    
    res.render('team/auction', {
      title: 'Live Auction',
      team,
      currentPlayer,
      recentBids
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Team profile
exports.getProfile = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.user._id })
      .populate('players');
    
    if (!team) {
      return res.render('errors/404', {
        message: 'Team not found'
      });
    }
    
    res.render('team/profile', {
      title: 'Team Profile',
      team
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Update team profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, owner, logo } = req.body;
    const team = await Team.findOne({ user: req.user._id });
    
    if (!team) {
      req.flash('error_msg', 'Team not found');
      return res.redirect('/team/profile');
    }
    
    team.name = name;
    team.owner = owner;
    
    if (req.file) {
      team.logo = `/uploads/${req.file.filename}`;
    }
    
    await team.save();
    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/team/profile');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update profile');
    res.redirect('/team/profile');
  }
};

// Team players
exports.getMyPlayers = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.user._id })
      .populate('players');
    
    if (!team) {
      return res.render('errors/404', {
        message: 'Team not found'
      });
    }
    
    res.render('team/my-players', {
      title: 'My Players',
      team
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};

// Bid history
exports.getBidHistory = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.user._id });
    
    if (!team) {
      return res.render('errors/404', {
        message: 'Team not found'
      });
    }
    
    const bids = await Bid.find({ team: team._id })
      .populate('player', 'name role')
      .sort({ timestamp: -1 });
    
    res.render('team/bid-history', {
      title: 'Bid History',
      bids
    });
  } catch (err) {
    console.error(err);
    res.render('errors/404', {
      message: 'Server error'
    });
  }
};