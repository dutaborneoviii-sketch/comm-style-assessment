import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const departments = [
  "Bagian Mutu Layanan Kepesertaan",
  "Bagian Mutu Layanan Fasilitas Kesehatan",
  "Kepala Cabang Sampit",
  "Bagian SDM, Umum dan Komunikasi",
  "Bagian Penjaminan Manfaat dan Utilisasi",
  "Bagian Kepesertaan",
  "Bagian Perencanaan, Keuangan dan Pemeriksaan",
  "Kedeputian Wilayah VIII",
  "Bidang SDM, Umum dan Komunikasi (SDMUK)",
  "Bidang Jaminan Pelayanan Kesehatan (JPK)",
  "Bidang Kepesertaan dan Mutu Layanan (KML)",
  "Bidang Perencanaan dan Keuangan (PK)",
  "TI Wilayah"
];

async function main() {
  console.log("Seeding departments...");
  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Departments seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
