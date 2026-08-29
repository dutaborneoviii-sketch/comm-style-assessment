const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      npp: {
        contains: "2834"
      }
    }
  });
  console.log(users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
