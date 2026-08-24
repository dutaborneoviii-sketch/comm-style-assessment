const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAssessments() {
  const users = await prisma.user.findMany({
    where: {
      npp: {
        in: ["10101", "10102", "10111", "10112", "10121", "10122", "10131", "10132", "10141", "10142"]
      }
    }
  });

  const styles = ["Directive", "Expressive", "Harmonious", "Analytical", "Combination (Directive, Expressive)"];
  
  let count = 0;
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const style = styles[i % styles.length];
    const isCombo = style.includes("Combination");
    
    const existing = await prisma.assessment.findFirst({ where: { userId: user.id }});
    if (!existing) {
      await prisma.assessment.create({
        data: {
          userId: user.id,
          countA: 10,
          countB: 8,
          countC: 5,
          countD: 2,
          primaryStyle: style,
          isCombination: isCombo
        }
      });
      count++;
    }
  }
  
  // Assign admin 10030 to a department so they have a team
  try {
    await prisma.user.update({
      where: { npp: "10030" },
      data: { department: "Sumber Daya Manusia, Umum dan Komunikasi" }
    });
    console.log("Admin 10030 assigned to 'Sumber Daya Manusia, Umum dan Komunikasi'.");
  } catch (e) {
    console.log("Admin 10030 not found or could not be updated.");
  }
  
  console.log(`Added assessments for ${count} users.`);
}

seedAssessments()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
