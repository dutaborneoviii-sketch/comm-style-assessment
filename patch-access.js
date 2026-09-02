const fs = require('fs');
let code = fs.readFileSync('src/lib/access.ts', 'utf8');

code = code.replace(
  "['Deputi Direksi Wilayah', 'Asisten Deputi', 'Kepala Kabupaten', 'Kepala Cabang', 'Kepala Kantor Kabupaten', 'Asisten Manager'].includes(user?.positionDetail || '')",
  "['Deputi Direksi Wilayah', 'Asisten Deputi', 'Kepala Kabupaten', 'Kepala Cabang', 'Kepala Kantor Kabupaten', 'Asisten Manager'].some(pos => user?.positionDetail?.startsWith(pos))"
);

fs.writeFileSync('src/lib/access.ts', code);
