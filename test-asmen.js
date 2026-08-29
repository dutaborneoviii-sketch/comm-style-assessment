require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = process.env.DIRECT_URL;
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      position: 'Asisten Manager'
    }
  });
  console.log("ASISTEN MANAGERS:");
  users.forEach(u => console.log(`${u.name} - ${u.workUnit} - ${u.department}`));
}
main();
