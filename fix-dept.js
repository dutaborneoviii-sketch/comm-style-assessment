const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.user.updateMany({
    where: { department: { in: ['Bidang SDM, Umum, dan Komunikasi', 'SDM, Umum dan Komunikasi', 'SDM, Umum, dan Komunikasi'] } },
    data: { department: 'Sumber Daya Manusia, Umum dan Komunikasi' }
  });
  console.log("Database updated.");
}
run();
