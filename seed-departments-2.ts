import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newDepartments = [
  "Bagian Mutu Layanan Kepesertaan (KC)",
  "Bagian Mutu Layanan Fasilitas Kesehatan (KC)",
  "Bagian SDM, Umum dan Komunikasi (KC)",
  "Bagian Penjaminan Manfaat dan Utilisasi (KC)",
  "Bagian Kepesertaan (KC)",
  "Bagian Perencanaan, Keuangan dan Pemeriksaan (KC)",
  "Kedeputian Wilayah VIII",
  "Bidang SDM, Umum dan Komunikasi (SDMUK)",
  "Bidang Jaminan Pelayanan Kesehatan (JPK)",
  "Bidang Kepesertaan dan Mutu Layanan (KML)",
  "Bidang Perencanaan dan Keuangan (PK)",
  "TI Wilayah"
];

async function main() {
  console.log("Seeding new departments...");
  
  // First, we create or update the new departments
  for (const name of newDepartments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Next, we clean up the old ones that are no longer in the list (except GLOBAL)
  const allDepts = await prisma.department.findMany();
  for (const dept of allDepts) {
    if (dept.name !== "GLOBAL" && !newDepartments.includes(dept.name)) {
      console.log(`Deleting obsolete department: ${dept.name}`);
      try {
        await prisma.department.delete({ where: { name: dept.name } });
      } catch (e) {
        console.log(`Could not delete ${dept.name}, likely due to foreign key constraints.`);
      }
    }
  }

  console.log("Departments updated successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
