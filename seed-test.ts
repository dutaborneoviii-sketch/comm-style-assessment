import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'testdeputi@example.com' } });
  if (existing) {
    console.log("already exists");
    return;
  }
  await prisma.user.create({
    data: {
      email: 'testdeputi@example.com',
      name: 'Test Deputi',
      npp: '999999',
      position: 'Deputi Direksi Wilayah',
      department: 'Wilayah VIII',
      password: 'test',
      role: 'USER',
      status: 'APPROVED'
    }
  })
  console.log("created");
}
main()
