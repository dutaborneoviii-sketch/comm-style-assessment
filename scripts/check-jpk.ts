import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const jpkUsers = await prisma.user.findMany({
    where: { department: { contains: "Jaminan Pelayanan" } },
    include: {
      assessments: true
    }
  });
  
  console.log(JSON.stringify(jpkUsers, null, 2));
}

main().finally(() => prisma.$disconnect());
