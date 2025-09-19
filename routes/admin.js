const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');


// Admin dashboard
router.get('/dashboard', ensureAuthenticated, adminAuth, adminController.getDashboard);

// Add player page
router.get('/players/add', ensureAuthenticated, adminAuth, adminController.getAddPlayer);

// Add player handle
router.post('/players/add', ensureAuthenticated, adminAuth, adminController.addPlayer);

// Players list
router.get('/players', ensureAuthenticated, adminAuth, adminController.getPlayers);

// Edit player page
router.get('/players/edit/:id', ensureAuthenticated, adminAuth, adminController.getEditPlayer);

// Update player
router.post('/players/update/:id', ensureAuthenticated, adminAuth, adminController.updatePlayer);

// Delete player
router.post('/players/delete/:id', ensureAuthenticated, adminAuth, adminController.deletePlayer);

// Teams list
router.get('/teams', ensureAuthenticated, adminAuth, adminController.getTeams);

// View team details
router.get('/teams/:id', ensureAuthenticated, adminAuth, adminController.getTeamDetails);

// Auction control
router.get('/auction', ensureAuthenticated, adminAuth, adminController.getAuction);

// Start auction for a player
router.post('/auction/start', ensureAuthenticated, adminAuth, adminController.startAuction);

// End auction
router.post('/auction/end', ensureAuthenticated, adminAuth, adminController.endAuction);

// Get auction statistics
router.get('/auction/stats', ensureAuthenticated, adminAuth, adminController.getAuctionStats);



module.exports = router;