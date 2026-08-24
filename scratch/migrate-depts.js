const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mapping = {
  "Sumber Daya Manusia, Umum dan Komunikasi": "Bidang SDM, Umum dan Komunikasi (SDMUK)",
  "SDM, Umum dan Komunikasi": "Bidang SDM, Umum dan Komunikasi (SDMUK)",
  "Jaminan Pelayanan Kesehatan": "Bidang Jaminan Pelayanan Kesehatan (JPK)",
  "Kualitas Mutu Layanan": "Bidang Kepesertaan dan Mutu Layanan (KML)",
  "Penagihan Iuran dan Keuangan": "Bidang Perencanaan dan Keuangan (PK)"
};

async function main() {
  for (const [oldName, newName] of Object.entries(mapping)) {
    // 1. Ensure new department exists
    await prisma.department.upsert({
      where: { name: newName },
      update: {},
      create: { name: newName }
    });

    // 2. Update users
    const result = await prisma.user.updateMany({
      where: { department: oldName },
      data: { department: newName }
    });
    console.log(`Updated ${result.count} users for ${oldName}`);

    // 3. Update feature flags
    const ffResult = await prisma.featureFlag.updateMany({
      where: { department: oldName },
      data: { department: newName }
    });
    console.log(`Updated ${ffResult.count} feature flags for ${oldName}`);
    
    // 4. Optionally delete old department if no one references it anymore
    try {
      await prisma.department.delete({
        where: { name: oldName }
      });
      console.log(`Deleted old department: ${oldName}`);
    } catch (e) {
      console.log(`Could not delete old department ${oldName} (might not exist or still referenced)`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
