const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const positions = await prisma.user.findMany({
    select: { position: true },
    distinct: ['position']
  });
  console.log(positions);
}
main().catch(console.error).finally(() => prisma.$disconnect());
