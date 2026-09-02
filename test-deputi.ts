import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const teamMembers = await prisma.user.findMany({
      where: {
        id: { not: 'test-id' },
        positionDetail: { not: 'Deputi Direksi Wilayah' }
      },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { department: 'asc' },
        { name: 'asc' }
      ]
    });
    console.log("Success! Members:", teamMembers.length);
  } catch (e) {
    console.error("Prisma Error:", e);
  }
}
main()
