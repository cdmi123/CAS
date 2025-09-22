const ExcelJS = require('exceljs');
const path = require('path');

const filePath = path.join(__dirname, 'players-20-unsold.xlsx');

async function createSampleExcel() {
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

  const players = [
    { name: 'Player 1', role: 'Batsman', basePrice: 100000, currentBid: 0, status: 'unsold', matches: 10, runs: 500, wickets: 0 },
    { name: 'Player 2', role: 'Bowler', basePrice: 120000, currentBid: 0, status: 'unsold', matches: 12, runs: 100, wickets: 20 },
    { name: 'Player 3', role: 'All-Rounder', basePrice: 150000, currentBid: 0, status: 'unsold', matches: 15, runs: 300, wickets: 10 },
    { name: 'Player 4', role: 'Wicket-Keeper', basePrice: 110000, currentBid: 0, status: 'unsold', matches: 11, runs: 400, wickets: 0 },
    { name: 'Player 5', role: 'Batsman', basePrice: 130000, currentBid: 0, status: 'unsold', matches: 13, runs: 600, wickets: 0 },
    { name: 'Player 6', role: 'Bowler', basePrice: 140000, currentBid: 0, status: 'unsold', matches: 14, runs: 150, wickets: 25 },
    { name: 'Player 7', role: 'All-Rounder', basePrice: 160000, currentBid: 0, status: 'unsold', matches: 16, runs: 350, wickets: 15 },
    { name: 'Player 8', role: 'Wicket-Keeper', basePrice: 115000, currentBid: 0, status: 'unsold', matches: 12, runs: 420, wickets: 0 },
    { name: 'Player 9', role: 'Batsman', basePrice: 125000, currentBid: 0, status: 'unsold', matches: 14, runs: 550, wickets: 0 },
    { name: 'Player 10', role: 'Bowler', basePrice: 135000, currentBid: 0, status: 'unsold', matches: 13, runs: 120, wickets: 18 },
    { name: 'Player 11', role: 'All-Rounder', basePrice: 170000, currentBid: 0, status: 'unsold', matches: 17, runs: 370, wickets: 12 },
    { name: 'Player 12', role: 'Wicket-Keeper', basePrice: 118000, currentBid: 0, status: 'unsold', matches: 13, runs: 410, wickets: 0 },
    { name: 'Player 13', role: 'Batsman', basePrice: 128000, currentBid: 0, status: 'unsold', matches: 15, runs: 580, wickets: 0 },
    { name: 'Player 14', role: 'Bowler', basePrice: 138000, currentBid: 0, status: 'unsold', matches: 14, runs: 130, wickets: 22 },
    { name: 'Player 15', role: 'All-Rounder', basePrice: 175000, currentBid: 0, status: 'unsold', matches: 18, runs: 390, wickets: 17 },
    { name: 'Player 16', role: 'Wicket-Keeper', basePrice: 120000, currentBid: 0, status: 'unsold', matches: 14, runs: 430, wickets: 0 },
    { name: 'Player 17', role: 'Batsman', basePrice: 132000, currentBid: 0, status: 'unsold', matches: 16, runs: 610, wickets: 0 },
    { name: 'Player 18', role: 'Bowler', basePrice: 142000, currentBid: 0, status: 'unsold', matches: 15, runs: 140, wickets: 28 },
    { name: 'Player 19', role: 'All-Rounder', basePrice: 180000, currentBid: 0, status: 'unsold', matches: 19, runs: 410, wickets: 20 },
    { name: 'Player 20', role: 'Wicket-Keeper', basePrice: 125000, currentBid: 0, status: 'unsold', matches: 15, runs: 440, wickets: 0 }
  ];

  players.forEach(player => worksheet.addRow(player));

  await workbook.xlsx.writeFile(filePath);
  console.log('Sample Excel file created:', filePath);
}

createSampleExcel();
