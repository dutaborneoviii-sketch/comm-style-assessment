import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Updating users' Lokasi Pegawai...");

  // Update all users who don't have an employeeLocation set
  const updateResult = await prisma.user.updateMany({
    where: {
      employeeLocation: null
    },
    data: {
      employeeLocation: "Kedeputian Wilayah VIII"
    }
  });
  
  console.log(`Updated ${updateResult.count} users to have employeeLocation = 'Kedeputian Wilayah VIII'.`);
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
