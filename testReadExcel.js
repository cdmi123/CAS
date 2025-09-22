const ExcelJS = require('exceljs');
const path = require('path');

const filePath = path.join(__dirname, 'players-20-unsold.xlsx');

console.log(filePath); 


async function testReadExcel() {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(filePath);
    console.log('File read successfully!');
    const worksheet = workbook.worksheets[0];
    worksheet.eachRow((row, rowNumber) => {
      console.log(`Row ${rowNumber}:`, row.values);
    });
  } catch (err) {
    console.error('Error reading Excel file:', err);
  }
}

testReadExcel();
