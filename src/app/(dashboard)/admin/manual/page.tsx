import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LogIn, Users, Shield, FileText, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "User Manual - COGNIT",
};

export default function UserManualPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-zinc-950 min-h-screen">
      <div className="print:hidden mb-8 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Format PDF Tersedia</h2>
          <p className="text-sm">Anda dapat menekan tombol <strong>Ctrl + P</strong> (atau Cmd + P di Mac) pada keyboard Anda untuk mencetak halaman ini dan menyimpannya sebagai file PDF.</p>
        </div>
        <button onClick={() => typeof window !== 'undefined' && window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm">
          Simpan ke PDF
        </button>
      </div>

      <div className="space-y-12" id="printable-manual">
        {/* Header Section */}
        <div className="text-center space-y-4 pb-8 border-b-4 border-orange-500">
          <div className="mx-auto w-20 h-20 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            BUKU PANDUAN PENGGUNA (USER MANUAL)
          </h1>
          <h2 className="text-xl text-slate-600 dark:text-slate-400 font-medium">
            Sistem Aplikasi COGNIT (Communication Style Assessment & Coaching)
          </h2>
        </div>

        {/* 1. Pendahuluan */}
        <section className="space-y-4 break-inside-avoid">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm">1</div>
            PENDAHULUAN
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
            Aplikasi COGNIT adalah platform komprehensif yang dirancang untuk melakukan asesmen gaya komunikasi karyawan, memfasilitasi sesi <i>coaching</i> (pembinaan) berbasis hasil asesmen, dan menyediakan dasbor rekapitulasi untuk pimpinan. Aplikasi ini mendukung beberapa peran (Roles) dengan hak akses yang disesuaikan secara otomatis.
          </p>
        </section>

        {/* 2. Login */}
        <section className="space-y-4 break-inside-avoid pt-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm">2</div>
            CARA LOGIN KE DALAM SISTEM
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 text-slate-600 dark:text-slate-400">
              <p>Semua pengguna wajib masuk (login) menggunakan kredensial yang valid:</p>
              <ul className="list-decimal pl-5 space-y-2">
                <li>Buka tautan website aplikasi COGNIT di browser Anda.</li>
                <li>Pada halaman Login, masukkan <strong>NPP</strong> (Nomor Pokok Pegawai) Anda.</li>
                <li>Masukkan <strong>Password</strong> Anda pada kolom kedua.</li>
                <li>Klik tombol <strong>Masuk</strong>.</li>
              </ul>
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Peringatan Keamanan:</strong> Jika sistem mendeteksi Anda membiarkan layar terbuka tanpa aktivitas (tidak ada pergerakan mouse) selama 1 jam, sistem akan otomatis me-logout akun Anda.
                </p>
              </div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900 rounded-xl aspect-video border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
              <span className="text-slate-400">[Gambar Tampilan Login]</span>
            </div>
          </div>
        </section>

        {/* 3. Staf */}
        <section className="space-y-4 break-inside-avoid pt-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm">3</div>
            PANDUAN UNTUK ROLE: STAF / KARYAWAN
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Staf adalah pengguna akhir yang menjadi target dari asesmen komunikasi.
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            <Card className="shadow-none border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" /> 
                  3.1 Mengisi Kuisioner Asesmen
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col md:flex-row gap-6">
                <ol className="list-decimal pl-5 space-y-2 text-slate-600 flex-1">
                  <li>Klik menu <strong>ASESMEN & LAPORAN -{'>'} Pengisian Kuisioner</strong>.</li>
                  <li>Jawab seluruh pertanyaan yang disajikan dengan sejujur-jujurnya sesuai dengan kondisi Anda.</li>
                  <li>Setelah selesai, klik tombol <strong>Simpan</strong> di bagian bawah halaman.</li>
                  <li>Hasil dominasi gaya komunikasi Anda (Amiable, Driver, Expressive, Analytical) akan otomatis terhitung.</li>
                </ol>
                <div className="w-full md:w-1/3 bg-slate-100 rounded-lg flex items-center justify-center min-h-[150px] border border-slate-200">
                  <span className="text-slate-400 text-sm text-center px-4">[Gambar Pengisian Kuisioner]</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> 
                  3.2 Melihat Riwayat Asesmen
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-slate-600 mb-4">
                  Klik menu <strong>Riwayat Asesmen</strong> untuk melihat grafik Spider-Web dari hasil Anda sebelumnya. Di halaman ini, Anda juga bisa menanggapi Action Plan (Rencana Aksi) yang telah didiskusikan bersama atasan.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. Asisten Deputi */}
        <section className="space-y-4 break-inside-avoid pt-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm">4</div>
            PANDUAN UNTUK ROLE: ASISTEN DEPUTI (COACH)
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Asisten Deputi memiliki fungsi ganda: sebagai peserta (Coachee) untuk atasannya, dan sebagai pembina (Coach) untuk bawahannya.
          </p>

          <div className="space-y-6 mt-4">
            <div>
              <h4 className="font-bold text-lg mb-2">4.1 Mode Coach vs Mode Coachee</h4>
              <p className="text-slate-600">Gunakan tombol sakelar (toggle) di pojok kanan atas layar untuk beralih mode. Mode Coach digunakan untuk menilai bawahan, sedangkan Mode Coachee digunakan untuk melihat rapor Anda sendiri.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-2">4.2 Melakukan Coaching & Action Item</h4>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Buka menu <strong>Anggota Bidang</strong>, lalu pilih salah satu staf.</li>
                <li>Klik tombol <strong>Rekapitulasi Coaching</strong> pada profil staf tersebut.</li>
                <li>Gunakan form yang tersedia untuk menambahkan <strong>Action Item (R-O-W)</strong> baru.</li>
                <li>Staf dapat mengunggah Eviden (Bukti) penyelesaian dalam bentuk file/gambar, dan Anda dapat memverifikasinya dari halaman ini.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Admin */}
        <section className="space-y-4 break-inside-avoid pt-6 pb-12">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm">5</div>
            PANDUAN UNTUK ROLE: ADMIN UTAMA (SDMUK)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-white border border-slate-200 p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-indigo-600" />
                <h4 className="font-bold text-lg">Keamanan & Sistem</h4>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Akses User:</strong> Tambah/edit/reset password pengguna.</li>
                <li><strong>Menu Aplikasi:</strong> Mengaktifkan/mematikan fitur tertentu.</li>
                <li><strong>Log Aktivitas User:</strong> Memantau riwayat login, lengkap dengan Alamat IP dan perangkat yang digunakan. IP disensor demi privasi, klik ikon mata untuk melihat IP penuh.</li>
              </ul>
            </div>
            
            <div className="bg-white border border-slate-200 p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-lg">Manajemen Master Data</h4>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Kamus Panduan:</strong> Mengubah narasi panduan komunikasi.</li>
                <li><strong>Bank Soal:</strong> Mengedit dan menambah butir pertanyaan asesmen.</li>
                <li><strong>Jangka Asesmen:</strong> Mengatur siklus waktu pengisian ulang kuisioner bagi seluruh staf.</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// Needed to silence lucide missing icon error due to arbitrary import for Database
import { Database } from "lucide-react";
