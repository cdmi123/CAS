const Auction = require('../models/Auction');
const Player = require('../models/Player');

module.exports = (io) => {
      // Periodically check for scheduled auctions starting soon (every 30 seconds)
      setInterval(async () => {
        const now = new Date();
        const soon = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
        // Find auctions scheduled to start within next 2 minutes and not yet started
        const auctions = await Auction.find({
          status: 'scheduled',
          scheduledFor: { $lte: soon, $gt: now }
        }).populate('player', 'name role');
        auctions.forEach(a => {
          io.to('auction').emit('scheduledAuctionStarting', {
            playerName: a.player.name,
            playerRole: a.player.role,
            scheduledFor: a.scheduledFor
          });
          // Optionally, mark as notified to avoid duplicate notifications
          // a.status = 'notified';
          // a.save();
        });
      }, 30000);

      io.on('connection', (socket) => {
        console.log('User connected');

        // Join auction room
        socket.on('joinAuction', () => {
          socket.join('auction');
          console.log('User joined auction room');
        });

        // Handle bid
        socket.on('placeBid', async (bidData) => {
          try {
            const { playerId, teamId, amount } = bidData;

            // Validate bid
            const Player = require('../models/Player');
            const Team = require('../models/Team');

            const player = await Player.findById(playerId);
            const team = await Team.findById(teamId);

            if (!player || !team) {
              socket.emit('bidError', { message: 'Player or team not found' });
              return;
            }

            if (player.status !== 'in-auction') {
              socket.emit('bidError', { message: 'Player is not in auction' });
              return;
            }

            if (amount <= player.currentBid) {
              socket.emit('bidError', {
                message: `Bid must be higher than current bid (₹${player.currentBid.toLocaleString()})`
              });
              return;
            }

            if (amount > team.budget) {
              socket.emit('bidError', {
                message: `Insufficient budget. Your budget is ₹${team.budget.toLocaleString()}`
              });
              return;
            }

            if (player.highestBidder && player.highestBidder.toString() === teamId) {
              socket.emit('bidError', { message: 'You are already the highest bidder' });
              return;
            }

            // Create bid record
            const Bid = require('../models/Bid');
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

            // Broadcast bid to all clients in auction room
            io.to('auction').emit('newBid', {
              playerId,
              amount,
              teamId,
              teamName: biddingTeam.name
            });

            // Update player status for all clients
            io.to('auction').emit('playerUpdated', {
              playerId,
              currentBid: amount,
              highestBidder: teamId
            });

          } catch (err) {
            console.error(err);
            socket.emit('bidError', { message: 'Server error' });
          }
        });

        // Handle auction start
        socket.on('startAuction', async (playerData) => {
          try {
            const { playerId } = playerData;

            const Player = require('../models/Player');
            const player = await Player.findById(playerId);

            if (!player) {
              socket.emit('auctionError', { message: 'Player not found' });
              return;
            }

            if (player.status !== 'unsold') {
              socket.emit('auctionError', { message: 'Player is not available for auction' });
              return;
            }

            // Reset current bid
            player.currentBid = player.basePrice;
            player.status = 'in-auction';
            player.highestBidder = null;
            await player.save();

            // Broadcast auction start to all clients
            io.to('auction').emit('auctionStarted', {
              playerId: player._id,
              playerName: player.name,
              playerRole: player.role,
              playerBasePrice: player.basePrice,
              playerImage: player.image
            });

          } catch (err) {
            console.error(err);
            socket.emit('auctionError', { message: 'Server error' });
          }
        });

        // Handle auction end
        socket.on('endAuction', async () => {
          try {
            const Player = require('../models/Player');
            const player = await Player.findOne({ status: 'in-auction' });

            if (!player) {
              socket.emit('auctionError', { message: 'No player currently in auction' });
              return;
            }

            const Team = require('../models/Team');
            const team = await Team.findById(player.highestBidder);

            if (team && player.currentBid > 0) {
              // Update team
              team.budget -= player.currentBid;
              team.players.push(player._id);
              await team.save();

              // Update player
              player.status = 'sold';
              await player.save();

              // Broadcast auction result
              io.to('auction').emit('auctionEnded', {
                playerId: player._id,
                playerName: player.name,
                sold: true,
                price: player.currentBid,
                teamName: team.name
              });
            } else {
              // No bids, mark as unsold
              player.status = 'unsold';
              player.currentBid = 0;
              player.highestBidder = null;
              await player.save();

              // Broadcast auction result
              io.to('auction').emit('auctionEnded', {
                playerId: player._id,
                playerName: player.name,
                sold: false,
                price: 0,
                teamName: null
              });
            }

            // Update player list for admin
            io.to('auction').emit('playerListUpdated');

          } catch (err) {
            console.error(err);
            socket.emit('auctionError', { message: 'Server error' });
          }
        });

        // Handle timer update
        socket.on('timerUpdate', (timeLeft) => {
          io.to('auction').emit('timerUpdated', timeLeft);
        });

        // Disconnect
        socket.on('disconnect', () => {
          console.log('User disconnected');
        });
      });
    };