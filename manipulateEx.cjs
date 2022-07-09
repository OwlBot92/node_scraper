const xl = require('excel4node');
const fs = require('fs');

const manipulator = () => {
  let json = JSON.parse(fs.readFileSync('./data/scrapedData.json').toString());
  const data = json.data
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Worksheet Name');

  const headingColumnNames = [
    "nome",
    "indirizzo",
    "città",
    "provincia",
  ]
  let headingColumnIndex = 1; // riga in cui scrivere i nomi delle colonne 
  headingColumnNames.forEach(heading => { // per ogni nome di colonna 
    ws.cell(1, headingColumnIndex++).string(heading) // scrivo il nome della colonna in una cella in riga 1
  });

  let rowIndex = 2;
  data.forEach(record => {
    let columnIndex = 1;
    Object.keys(record).forEach(columnName => {
      ws.cell(rowIndex, columnIndex++)
        .string(record[columnName])
    });
    rowIndex++;
  });

  wb.write('./data/cucinaveneta.xlsx');
}

module.exports = manipulator;