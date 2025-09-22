const multer = require('multer');
const upload = multer({ dest: 'uploads/' });



const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const excelController = require('../controllers/excelController');
// Download all players as Excel
router.get('/players/download-excel', ensureAuthenticated, adminAuth, excelController.downloadPlayersExcel);

// Schedule auction page
router.get('/schedule-auction', ensureAuthenticated, adminAuth, adminController.getScheduleAuction);
// Handle schedule auction POST
router.post('/schedule-auction', ensureAuthenticated, adminAuth, adminController.postScheduleAuction);
// Auction history data (JSON for real-time updates)
router.get('/auction-history/data', ensureAuthenticated, adminAuth, async (req, res) => {
	try {
		const bids = await require('../models/Bid').find()
			.populate('player', 'name')
			.populate('team', 'name')
			.sort({ timestamp: -1 });
		res.json(bids);
	} catch (err) {
		res.status(500).json([]);
	}
});

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

// Add team page
router.get('/teams/add', ensureAuthenticated, adminAuth, adminController.getTeamAdd);

// Handle add team POST
router.post('/teams/add', ensureAuthenticated, adminAuth, adminController.addTeam);

// View team details
router.get('/teams/:id', ensureAuthenticated, adminAuth, adminController.getTeamDetails);

// Edit team
router.post('/teams/edit/:id', ensureAuthenticated, adminAuth, adminController.editTeam);

// Delete team
router.post('/teams/delete/:id', ensureAuthenticated, adminAuth, adminController.deleteTeam);


// Auction control
router.get('/auction', ensureAuthenticated, adminAuth, adminController.getAuction);

// Auction history report
router.get('/auction-history', ensureAuthenticated, adminAuth, adminController.getAuctionHistory);

// Start auction for a player
router.post('/auction/start', ensureAuthenticated, adminAuth, adminController.startAuction);

// End auction
router.post('/auction/end', ensureAuthenticated, adminAuth, adminController.endAuction);

// Get auction statistics
router.get('/auction/stats', ensureAuthenticated, adminAuth, adminController.getAuctionStats);

// Upload Excel and add playersacroding yo
router.get('/teams/:id/download-excel', ensureAuthenticated, adminAuth, excelController.downloadTeamExcel);

// Download particular team as Excel
router.post('/players/upload-excel', ensureAuthenticated, adminAuth, upload.single('excel'), excelController.uploadPlayersExcel);


module.exports = router;