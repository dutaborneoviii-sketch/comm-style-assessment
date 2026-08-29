const { PrismaClient } = require('@prisma/client');
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
  "Kepesertaan dan Penagihan Iuran (Kabupaten)",
  "Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan (Kabupaten)",
  "Kantor Kabupaten",
  "TI Wilayah"
];

async function main() {
  for (const name of newDepartments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  
  // Optionally, remove old departments that are not in the new list,
  // but they might be tied to existing users. We won't delete them to prevent orphaned foreign keys,
  // or we could just rely on the new list for dropdowns.
  
  console.log("Departments synced");
}

main().catch(console.error).finally(() => prisma.$disconnect());
