import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Updating users' Satuan Kerja...");

  // Update all users EXCEPT those in 'TI Wilayah'
  const updateResult = await prisma.user.updateMany({
    where: {
      department: {
        not: "TI Wilayah"
      }
    },
    data: {
      workUnit: "Kedeputian Wilayah VIII"
    }
  });
  console.log(`Updated ${updateResult.count} users to 'Kedeputian Wilayah VIII'.`);

  // (Optional) Explicitly update 'TI Wilayah' users to 'Kedeputian Bidang Operasional dan Keamanan Teknologi Informasi'
  // based on the image, though the prompt just said "Kecuali untuk Bidang TI Wilayah"
  const updateTiResult = await prisma.user.updateMany({
    where: {
      department: "TI Wilayah",
      workUnit: null
    },
    data: {
      workUnit: "Kedeputian Bidang Operasional dan Keamanan Teknologi Informasi"
    }
  });
  console.log(`Updated ${updateTiResult.count} TI Wilayah users who had no workUnit.`);

  console.log("Database update complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
