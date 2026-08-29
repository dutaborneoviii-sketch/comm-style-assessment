require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = process.env.DIRECT_URL;
const prisma = new PrismaClient();

async function main() {
  const allStaff = await prisma.user.findMany({
    where: { department: { contains: 'SDMUK' } }
  });
  console.log("ALL STAFF SDMUK:\n", allStaff.map(s => `${s.name} - ${s.position} - ${s.status} - LOC:${s.employeeLocation} - UNIT:${s.workUnit}`).join('\n'));

  const agung = await prisma.user.findMany({
    where: { name: { contains: 'AGUNG' } }
  });
  console.log("AGUNG USERS:\n", agung.map(s => `${s.name} - ${s.position} - ${s.status} - LOC:${s.employeeLocation} - UNIT:${s.workUnit} - DEPT:${s.department}`).join('\n'));
}
main();
