const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mapping = {
  "Kepesertaan dan Mutu Layanan": "Bidang Kepesertaan dan Mutu Layanan (KML)",
  "Perencanaan dan Keuangan": "Bidang Perencanaan dan Keuangan (PK)"
};

async function main() {
  for (const [oldName, newName] of Object.entries(mapping)) {
    // Update users
    await prisma.user.updateMany({
      where: { department: oldName },
      data: { department: newName }
    });

    // Update feature flags
    await prisma.featureFlag.updateMany({
      where: { department: oldName },
      data: { department: newName }
    });
    
    // Delete old department
    try {
      await prisma.department.delete({
        where: { name: oldName }
      });
    } catch (e) {
      console.log(`Could not delete old department ${oldName} (might not exist or still referenced)`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
