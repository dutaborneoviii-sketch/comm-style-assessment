const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('Exporting data from SQLite...');
  const data = {};

  // Export all tables
  data.Department = await prisma.department.findMany();
  data.User = await prisma.user.findMany();
  data.CoachingLog = await prisma.coachingLog.findMany();
  data.ActionItem = await prisma.actionItem.findMany();
  data.Account = await prisma.account.findMany();
  data.Session = await prisma.session.findMany();
  data.VerificationToken = await prisma.verificationToken.findMany();
  data.Assessment = await prisma.assessment.findMany();
  data.Question = await prisma.question.findMany();
  data.Option = await prisma.option.findMany();
  data.FeatureFlag = await prisma.featureFlag.findMany();
  data.SystemSetting = await prisma.systemSetting.findMany();
  data.CommunicationDictionary = await prisma.communicationDictionary.findMany();

  // Write to a JSON file
  fs.writeFileSync('data_backup.json', JSON.stringify(data, null, 2));
  console.log('Export completed successfully. Data saved to data_backup.json');
}

main()
  .catch((e) => {
    console.error('Error exporting data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
