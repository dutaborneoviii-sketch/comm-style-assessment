const ExcelJS = require('exceljs');

async function main() {
  const workbook = new ExcelJS.Workbook();
  const optionsSheet = workbook.addWorksheet('Options');
  optionsSheet.getCell('A1').value = "Option 1";
  optionsSheet.getCell('A2').value = "Option 2";

  const sheet = workbook.addWorksheet('Template');
  sheet.getCell('A1').dataValidation = {
    type: 'list',
    allowBlank: true,
    formulae: ['Options!$A$1:$A$2']
  };

  await workbook.xlsx.writeFile('test.xlsx');
  console.log("Done");
}
main();
