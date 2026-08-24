const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const departments = [
  "Sumber Daya Manusia, Umum dan Komunikasi",
  "Jaminan Pelayanan Kesehatan",
  "Kualitas Mutu Layanan",
  "Penagihan Iuran dan Keuangan",
  "TI Wilayah"
];

const dummyNames = [
  "Agung Priyono", "Handi Widyatno",       // SDM
  "Dian Kusuma", "Reza Pahlevi",           // Jaminan
  "Agus Pratama", "Dewi Lestari",          // Kualitas
  "Siti Aminah", "Hendra Gunawan",         // Penagihan
  "Rina Melati", "Budi Santoso"            // TI
];

async function seed() {
  console.log("Seeding users...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  let count = 0;
  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    for (let j = 1; j <= 2; j++) {
      const npp = `101${i}${j}`;
      const name = dummyNames[i * 2 + (j - 1)];
      const email = `pegawai${i}${j}@cognit.id`.toLowerCase();
      
      try {
        await prisma.user.upsert({
          where: { npp },
          update: { name },
          create: {
            npp,
            name,
            email,
            department: dept,
            role: 'USER',
            password: hashedPassword
          }
        });
        count++;
        console.log(`Created user: ${name} (NPP: ${npp}) - ${dept}`);
      } catch (err) {
        console.error(`Error creating user ${npp}:`, err.message);
      }
    }
  }
  
  console.log(`Seeding complete. Added ${count} sample users.`);
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
