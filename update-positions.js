const fs = require('fs');

const newList = `
      "Analis Jaminan Pelayanan Kesehatan Pratama",
      "Analis Komunikasi dan Kesekretariatan Pratama",
      "Analis Mutu Layanan Pratama",
      "Analis Perencanaan dan Keuangan",
      "Analis Perluasan dan Kepatuhan Pendaftaran Peserta Pratama",
      "Asisten Deputi Jaminan Pelayanan Kesehatan",
      "Asisten Deputi Kepesertaan dan Mutu Layanan",
      "Asisten Deputi Perencanaan dan Keuangan",
      "Asisten Deputi SDM, Umum dan Komunikasi",
      "Claim Advisor Pratama",
      "Deputi Direksi Wilayah",
      "Kasir",
      "Kepala Bagian Kepesertaan",
      "Kepala Bagian Mutu Layanan Fasilitas Kesehatan",
      "Kepala Bagian Mutu Layanan Kepesertaan",
      "Kepala Bagian Penjaminan Manfaat dan Utilisasi",
      "Kepala Bagian Perencanaan, Keuangan dan Pemeriksaan",
      "Kepala Bagian SDM, Umum dan Komunikasi",
      "Kepala Bagian Teknologi Informasi Wilayah",
      "Kepala Cabang",
      "Kepala Kantor Kabupaten",
      "Kepala Kantor Kota",
      "Koordinator Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit",
      "Koordinator Frontliner",
      "Petugas Pemeriksa",
      "Relationship Officer",
      "Staf Administrasi Kepesertaan",
      "Staf Edukasi dan Penanganan Pengaduan",
      "Staf Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit",
      "Staf Frontliner",
      "Staf Jaminan Pelayanan Kesehatan",
      "Staf Kepesertaan dan Mutu Layanan",
      "Staf Kepesertaan dan Penagihan Iuran Kabupaten",
      "Staf Kepesertaan Kabupaten",
      "Staf Kepesertaan Kota",
      "Staf Kerja Sama Fasilitas Kesehatan",
      "Staf Komunikasi dan Kesekretariatan",
      "Staf Mutu Layanan Fasilitas Kesehatan",
      "Staf Mutu Layanan Kabupaten",
      "Staf Penagihan",
      "Staf Penagihan dan Keuangan",
      "Staf Penjaminan Manfaat dan Fasilitas Kesehatan Kabupaten",
      "Staf Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan Kabupaten",
      "Staf Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan Kota",
      "Staf Perencanaan dan Keuangan",
      "Staf Perencanaan dan Pembukuan",
      "Staf Promotif dan Preventif",
      "Staf Promotif Preventif",
      "Staf SDM dan Umum",
      "Staf Teknologi Informasi Wilayah",
      "Staf Utilisasi dan Pencegahan Kecurangan",
      "Verifikator Klaim"
`.trim().split('\n').map(s => s.trim().replace(/,$/, ''));

// 1. Update user-manager.tsx
let content1 = fs.readFileSync('src/components/admin/user-manager.tsx', 'utf8');
const regex1 = /const detailJabatanList = \[\s*[\s\S]*?\];/;
content1 = content1.replace(regex1, `const detailJabatanList = [\n    ${newList.join(',\n    ')}\n    ];`);
fs.writeFileSync('src/components/admin/user-manager.tsx', content1);

// 2. Update user-dialogs.tsx
let content2 = fs.readFileSync('src/components/admin/user-dialogs.tsx', 'utf8');
const optionsString = newList.map(s => {
  const v = s.replace(/"/g, '');
  return `<option value="${v}">${v}</option>`;
}).join('\n                ');

// Replace everything between <option value="">Pilih Detail Jabatan</option> and </select> inside the positionDetail field
// There are multiple instances (Add User and Edit User dialogs)
const blockRegex = /(<select[^>]*name="positionDetail"[^>]*>[\s\S]*?<option value="">Pilih Detail Jabatan<\/option>)([\s\S]*?)(<\/select>)/g;
content2 = content2.replace(blockRegex, `$1\n                ${optionsString}\n              $3`);
fs.writeFileSync('src/components/admin/user-dialogs.tsx', content2);
