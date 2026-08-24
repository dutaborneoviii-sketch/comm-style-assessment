import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultDepts = [
    "Sumber Daya Manusia, Umum dan Komunikasi",
    "Jaminan Pelayanan Kesehatan",
    "Kualitas Mutu Layanan",
    "Penagihan Iuran dan Keuangan",
    "TI Wilayah",
    "GLOBAL"
  ];

  for (const name of defaultDepts) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Also fetch unique departments from User table just in case
  const users = await prisma.user.findMany({
    select: { department: true },
    distinct: ['department']
  });

  for (const u of users) {
    if (u.department) {
      await prisma.department.upsert({
        where: { name: u.department },
        update: {},
        create: { name: u.department },
      });
    }
  }

  console.log("Departments seeded successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
