import { getUserAccess } from './src/lib/access';

const user = {
  workUnit: 'Kantor Cabang Muara Teweh',
  pangkat: 'Manager',
  positionDetail: 'Kepala Cabang',
  role: 'USER'
};

console.log(getUserAccess(user));
