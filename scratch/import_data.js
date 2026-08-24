const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('Importing data to PostgreSQL (Supabase)...');
  
  if (!fs.existsSync('data_backup.json')) {
    console.error('Backup file data_backup.json not found!');
    process.exit(1);
  }

  const rawData = fs.readFileSync('data_backup.json', 'utf8');
  const data = JSON.parse(rawData);

  // We need to insert data in the correct order to respect foreign key constraints.
  // Order: Department, User, SystemSetting, CommunicationDictionary, Question, Option, FeatureFlag, Assessment, CoachingLog, ActionItem, Account, Session, VerificationToken

  // Utility function for bulk insert using createMany
  async function importTable(model, tableName) {
    const records = data[tableName];
    if (records && records.length > 0) {
      console.log(`Importing ${records.length} records into ${tableName}...`);
      try {
        await model.createMany({
          data: records,
          skipDuplicates: true
        });
        console.log(`✅ ${tableName} imported.`);
      } catch (e) {
        console.error(`❌ Failed to import ${tableName}:`, e.message);
      }
    } else {
      console.log(`No records found for ${tableName}, skipping.`);
    }
  }

  await importTable(prisma.department, 'Department');
  await importTable(prisma.user, 'User');
  await importTable(prisma.systemSetting, 'SystemSetting');
  await importTable(prisma.communicationDictionary, 'CommunicationDictionary');
  await importTable(prisma.question, 'Question');
  await importTable(prisma.option, 'Option');
  await importTable(prisma.featureFlag, 'FeatureFlag');
  await importTable(prisma.assessment, 'Assessment');
  await importTable(prisma.coachingLog, 'CoachingLog');
  await importTable(prisma.actionItem, 'ActionItem');
  await importTable(prisma.account, 'Account');
  await importTable(prisma.session, 'Session');
  await importTable(prisma.verificationToken, 'VerificationToken');

  console.log('🎉 Data import completed!');
}

main()
  .catch((e) => {
    console.error('Error importing data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
