const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ where: { name: { contains: 'Agung' } } });
  console.log("Users:", users.map(u => u.department));
  const features = await prisma.featureFlag.findMany({ where: { roleGroup: 'Asisten Deputi' } });
  console.log("Features:", features.map(f => ({ key: f.featureKey, dept: f.department, enabled: f.enabled })));
}
run();
