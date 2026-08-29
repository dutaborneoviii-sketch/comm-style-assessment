require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = process.env.DIRECT_URL;
const prisma = new PrismaClient();

async function main() {
  const elly = await prisma.user.findFirst({
    where: { name: { contains: 'Elly' } }
  });
  console.log("ELLY:", elly);

  if (elly) {
    const allStaff = await prisma.user.findMany({
      where: { employeeLocation: elly.employeeLocation }
    });
    console.log("ALL STAFF IN SAME LOCATION:\n", allStaff.map(s => `${s.name} - ${s.position} - ${s.status} - LOC:${s.employeeLocation} - UNIT:${s.workUnit} - DEPT:${s.department}`).join('\n'));
  }
}
main();
