exports.uploadPlayersExcel = async (req, res) => {
  const ExcelJS = require('exceljs');
  const Player = require('../models/Player');
  try {
    if (!req.file) return res.status(400).send('No file uploaded');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0];
    const playersToAdd = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const [name, role, basePrice, currentBid, status, matches, runs, wickets] = row.values.slice(1);
      if (name && role && basePrice) {
        playersToAdd.push({
          name,
          role,
          basePrice,
          currentBid: currentBid || 0,
          status: status || 'unsold',
          stats: {
            matches: matches || 0,
            runs: runs || 0,
            wickets: wickets || 0
          }
        });
      }
    });
    await Player.insertMany(playersToAdd);
    res.redirect('/admin/players');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error importing players from Excel');
  }
};
const Team = require('../models/Team');

exports.downloadTeamExcel = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players');
    if (!team) return res.status(404).send('Team not found');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Team');
    worksheet.columns = [
      { header: 'Team Name', key: 'teamName', width: 20 },
      { header: 'Owner', key: 'owner', width: 20 },
      { header: 'Budget', key: 'budget', width: 15 },
      { header: 'Player Name', key: 'playerName', width: 20 },
      { header: 'Player Role', key: 'playerRole', width: 15 }
    ];
    if (team.players && team.players.length) {
      team.players.forEach(player => {
        worksheet.addRow({
          teamName: team.name,
          owner: team.owner,
          budget: team.budget,
          playerName: player.name,
          playerRole: player.role
        });
      });
    } else {
      worksheet.addRow({
        teamName: team.name,
        owner: team.owner,
        budget: team.budget,
        playerName: 'No players assigned',
        playerRole: ''
      });
    }
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${team.name}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating Excel file');
  }
};
const Player = require('../models/Player');
const ExcelJS = require('exceljs');

exports.downloadPlayersExcel = async (req, res) => {
  try {
    const players = await Player.find();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Players');
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Base Price', key: 'basePrice', width: 15 },
      { header: 'Current Bid', key: 'currentBid', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Matches', key: 'matches', width: 10 },
      { header: 'Runs', key: 'runs', width: 10 },
      { header: 'Wickets', key: 'wickets', width: 10 }
    ];
    players.forEach(player => {
      worksheet.addRow({
        name: player.name,
        role: player.role,
        basePrice: player.basePrice,
        currentBid: player.currentBid,
        status: player.status,
        matches: player.stats.matches,
        runs: player.stats.runs,
        wickets: player.stats.wickets
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=players.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating Excel file');
  }
};
