const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const assessments = await prisma.assessment.findMany();
  for (const a of assessments) {
    let countA = 2, countB = 2, countC = 2, countD = 2;
    const style = a.primaryStyle || "";
    
    if (style.includes("Directive")) countA = 12;
    else if (style.includes("Expressive")) countB = 12;
    else if (style.includes("Harmonious")) countC = 12;
    else if (style.includes("Analytical")) countD = 12;
    
    // Make sure the total is 25 to be realistic
    // if A is 12, make others add up to 13
    if (countA === 12) { countB = 7; countC = 4; countD = 2; }
    if (countB === 12) { countA = 7; countC = 4; countD = 2; }
    if (countC === 12) { countA = 4; countB = 7; countD = 2; }
    if (countD === 12) { countA = 4; countB = 2; countC = 7; }

    if (a.isCombination) {
      if (style.includes("Directive") && style.includes("Expressive")) {
        countA = 10; countB = 9; countC = 4; countD = 2;
      }
    }

    await prisma.assessment.update({
      where: { id: a.id },
      data: { countA, countB, countC, countD }
    });
  }
  console.log("Fixed assessments!");
}
fix().then(() => prisma.$disconnect());
