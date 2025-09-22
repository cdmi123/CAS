// Player comparison API
const Player = require('../models/Player');

const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

router.get('/compare-players', async (req, res) => {
	try {
		const { id1, id2 } = req.query;
		if (!id1 || !id2) return res.status(400).json({ error: 'Missing player ids' });
		const p1 = await Player.findById(id1);
		const p2 = await Player.findById(id2);
		res.json({ p1, p2 });
	} catch (err) {
		res.status(500).json({ error: 'Server error' });
	}
});
// Place a bid
router.post('/bid', auctionController.placeBid);

// Start auction for a player
router.post('/auction/start', auctionController.startAuction);

// End auction for current player
router.post('/auction/end', auctionController.endAuction);

// Get all players
router.get('/players', auctionController.getAllPlayers);

// Get player by ID
router.get('/players/:id', auctionController.getPlayerById);

// Get all teams
router.get('/teams', auctionController.getAllTeams);

// Get team by ID
router.get('/teams/:id', auctionController.getTeamById);

// Get current auction status
router.get('/auction/status', auctionController.getAuctionStatus);

// Get bid history for a player
router.get('/bids/player/:id', auctionController.getPlayerBidHistory);

// Get bid history for a team
router.get('/bids/team/:id', auctionController.getTeamBidHistory);

module.exports = router;