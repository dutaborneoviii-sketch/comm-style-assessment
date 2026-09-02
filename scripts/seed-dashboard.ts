import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STYLES = [
  { primary: "Direktif", secondary: null, isCombo: false },
  { primary: "Ekspresif", secondary: null, isCombo: false },
  { primary: "Harmonis", secondary: null, isCombo: false },
  { primary: "Analitis", secondary: null, isCombo: false },
  { primary: "Direktif", secondary: "Analitis", isCombo: true },
  { primary: "Ekspresif", secondary: "Harmonis", isCombo: true },
  { primary: "Direktif", secondary: "Ekspresif", isCombo: true },
  { primary: "Harmonis", secondary: "Analitis", isCombo: true },
  { primary: "Direktif", secondary: "Harmonis", isCombo: true },
  { primary: "Ekspresif", secondary: "Analitis", isCombo: true },
];

async function main() {
  console.log("Starting dummy data injection...");

  // Find the current Deputi user's department to seed relevant users
  const deputi = await prisma.user.findFirst({
    where: { pangkat: 'Deputi Direksi Wilayah' }
  });

  if (!deputi || !deputi.department) {
    console.log("Could not find a Deputi with a department. Seeding globally.");
  }
  
  const targetDepartment = deputi?.department || "Sumber Daya Manusia, Umum dan Komunikasi";

  // Create 20 dummy users in the same department
  console.log(`Creating 20 dummy members for department: ${targetDepartment}`);
  
  const dummyUsers = [];
  for (let i = 1; i <= 20; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Anggota Tim ${i}`,
        npp: `DUMMY-${i}`,
        email: `dummy${i}@example.com`,
        department: targetDepartment,
        pangkat: 'Staf',
        role: 'USER',
        status: 'ACTIVE',
      }
    });
    dummyUsers.push(user);
  }

  // Inject random assessments for all users in that department
  console.log("Injecting random communication style assessments...");
  for (const user of dummyUsers) {
    const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];
    
    await prisma.assessment.create({
      data: {
        userId: user.id,
        countA: Math.floor(Math.random() * 10),
        countB: Math.floor(Math.random() * 10),
        countC: Math.floor(Math.random() * 10),
        countD: Math.floor(Math.random() * 10),
        primaryStyle: randomStyle.primary,
        secondaryStyle: randomStyle.secondary,
        isCombination: randomStyle.isCombo,
      }
    });
  }

  // Inject some coaching logs between Deputi and these dummy users
  if (deputi) {
    console.log("Injecting dummy coaching logs...");
    for (let i = 0; i < 8; i++) {
      const coachee = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
      await prisma.coachingLog.create({
        data: {
          coachId: deputi.id,
          coacheeId: coachee.id,
          date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // random past date
          title: `Sesi Evaluasi Kinerja & Komunikasi ${i+1}`,
          notes: "Diskusi berjalan lancar. Perlu peningkatan dalam penyampaian ide secara analitis agar lebih terstruktur.",
          actionItems: {
            create: [
              { text: 'Selesaikan modul training ABC' }
            ]
          },
          response: Math.random() > 0.5 ? "Siap, akan saya pantau terus perkembangannya. Mohon asisten deputi terus memberikan pendampingan." : null,
        }
      });
    }
  }

  console.log("Dummy data injection completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
