const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/auth');
const teamController = require('../controllers/teamController');

// Team dashboard
router.get('/dashboard', ensureAuthenticated, teamController.getDashboard);

// Players list
router.get('/players', ensureAuthenticated, teamController.getPlayers);

// Player details
router.get('/players/:id', ensureAuthenticated, teamController.getPlayerDetails);

// Auction page
router.get('/auction', ensureAuthenticated, teamController.getAuction);

// Team profile
router.get('/profile', ensureAuthenticated, teamController.getProfile);

// Update team profile
router.post('/profile/update', ensureAuthenticated, teamController.updateProfile);

// Team players
router.get('/my-players', ensureAuthenticated, teamController.getMyPlayers);

// Bid history
router.get('/bid-history', ensureAuthenticated, teamController.getBidHistory);

module.exports = router;