import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const QUESTIONS = [
  {
    order: 1,
    text: "Saat memulai proyek baru bersama tim, prioritas pertama Anda adalah:",
    options: [
      { letter: "A", text: "Menyelaraskan tujuan akhir agar tim bisa segera mengambil langkah pertama." },
      { letter: "B", text: "Membangun visi bersama agar seluruh tim memiliki motivasi yang sama." },
      { letter: "C", text: "Memastikan setiap anggota memahami perannya dan merasa didukung secara tim." },
      { letter: "D", text: "Menyusun kerangka kerja awal berdasarkan informasi atau data yang tersedia." },
    ]
  },
  {
    order: 2,
    text: "Ketika Anda menulis email penting kepada rekan kerja, gaya penulisan Anda cenderung:",
    options: [
      { letter: "A", text: "Mengutamakan pesan yang ringkas dan memprioritaskan poin tindakan (action items)." },
      { letter: "B", text: "Menulis dengan gaya bahasa yang mengalir dan menarik agar pesan mudah diterima." },
      { letter: "C", text: "Menyertakan sapaan hangat dan memperhatikan nada bicara agar terasa kolaboratif." },
      { letter: "D", text: "Memastikan struktur tulisan logis dengan informasi pendukung yang komprehensif." },
    ]
  },
  {
    order: 3,
    text: "Dalam sebuah rapat yang pembahasannya mulai melebar dari topik, Anda biasanya:",
    options: [
      { letter: "A", text: "Mengusulkan agar diskusi dikembalikan pada agenda utama yang harus diselesaikan." },
      { letter: "B", text: "Mengajukan sudut pandang baru yang mungkin bisa menjembatani kebuntuan diskusi." },
      { letter: "C", text: "Membantu menyatukan kesamaan pandangan dari pihak-pihak yang berbeda pendapat." },
      { letter: "D", text: "Meminta waktu sejenak untuk meninjau kembali fakta-fakta yang relevan dengan topik." },
    ]
  },
  {
    order: 4,
    text: "Jika terjadi perbedaan pendapat yang tajam dengan rekan kerja, pendekatan Anda adalah:",
    options: [
      { letter: "A", text: "Menginisiasi diskusi agar masalah dapat diurai dan diputuskan secara objektif dan cepat." },
      { letter: "B", text: "Mengajak berdiskusi di suasana yang lebih rileks untuk menemukan titik temu yang inovatif." },
      { letter: "C", text: "Mendengarkan perspektif rekan kerja terlebih dahulu untuk benar-benar memahami posisinya." },
      { letter: "D", text: "Menelusuri kronologi perbedaan secara terstruktur untuk menemukan kejelasan secara faktual." },
    ]
  },
  {
    order: 5,
    text: "Saat harus mempresentasikan sebuah laporan di hadapan manajemen, Anda fokus pada:",
    options: [
      { letter: "A", text: "Pencapaian utama dan rekomendasi tindakan (next steps) yang spesifik." },
      { letter: "B", text: "Narasi atau konteks di balik pencapaian agar presentasi lebih menggugah." },
      { letter: "C", text: "Sesi interaktif untuk mengakomodasi umpan balik dan masukan dari manajemen." },
      { letter: "D", text: "Metodologi dan data kuantitatif yang menguatkan kesimpulan Anda." },
    ]
  },
  {
    order: 6,
    text: "Ketika Anda menerima instruksi pekerjaan yang dirasa kurang spesifik, Anda akan:",
    options: [
      { letter: "A", text: "Mengonfirmasi ekspektasi output akhir dan batas waktu penyelesaiannya." },
      { letter: "B", text: "Berdiskusi sejenak untuk memahami gambaran besar dan tujuan strategis tugas tersebut." },
      { letter: "C", text: "Berkoordinasi dengan rekan lain agar pendekatan yang diambil bisa sejalan." },
      { letter: "D", text: "Mencari preseden, referensi, atau panduan tertulis terkait tugas serupa di masa lalu." },
    ]
  }
];

async function main() {
  console.log('Start seeding...')
  
  // Clear existing questions to avoid duplicates on re-run
  await prisma.question.deleteMany({});
  
  for (const q of QUESTIONS) {
    const question = await prisma.question.create({
      data: {
        order: q.order,
        text: q.text,
        options: {
          create: q.options.map(opt => ({
            letter: opt.letter,
            text: opt.text
          }))
        }
      }
    })
    console.log(`Created question with id: ${question.id}`)
  }
  
  // Set user to ADMIN
  await prisma.user.updateMany({
    where: { email: 'rsud.bpn@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log('Set rsud.bpn@gmail.com as ADMIN');

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
