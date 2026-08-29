"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createUser, updateUser } from "@/app/actions/users";
import { Plus, Edit2, KeyRound } from "lucide-react";
import { employeeLocations } from "@/lib/locations";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedWorkUnit, setSelectedWorkUnit] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const result = await createUser(data);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setSelectedWorkUnit("");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-[#57BC90] hover:bg-[#159a73] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Tambah User
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Buat akun baru untuk akses aplikasi. Password default adalah <strong>password123</strong> jika dikosongkan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {error && <div className="text-sm text-red-500 font-medium p-2 bg-red-50 rounded-md">{error}</div>}
            
            <div className="grid gap-2">
              <Label htmlFor="npp">NPP</Label>
              <Input 
                id="npp" 
                name="npp" 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                placeholder="Masukkan NPP" 
                required 
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Nama User</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Opsional)</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workUnit">Satuan Kerja</Label>
              <select 
                id="workUnit" 
                name="workUnit" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                required
                value={selectedWorkUnit}
                onChange={(e) => setSelectedWorkUnit(e.target.value)}
              >
                <option value="" disabled>Pilih Satuan Kerja...</option>
                <option value="Kedeputian Bidang Operasional dan Keamanan Teknologi Informasi">Kedeputian Bidang Operasional dan Keamanan Teknologi Informasi</option>
                <option value="Kedeputian Wilayah VIII">Kedeputian Wilayah VIII</option>
                <option value="Kantor Cabang Balikpapan">Kantor Cabang Balikpapan</option>
                <option value="Kantor Cabang Banjarmasin">Kantor Cabang Banjarmasin</option>
                <option value="Kantor Cabang Barabai">Kantor Cabang Barabai</option>
                <option value="Kantor Cabang Muara Teweh">Kantor Cabang Muara Teweh</option>
                <option value="Kantor Cabang Palangka Raya">Kantor Cabang Palangka Raya</option>
                <option value="Kantor Cabang Samarinda">Kantor Cabang Samarinda</option>
                <option value="Kantor Cabang Sampit">Kantor Cabang Sampit</option>
                <option value="Kantor Cabang Tarakan">Kantor Cabang Tarakan</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employeeLocation">Lokasi Pegawai</Label>
              <select 
                id="employeeLocation" 
                name="employeeLocation" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black disabled:opacity-50"
                required
                defaultValue=""
                disabled={!selectedWorkUnit}
              >
                <option value="" disabled>Pilih Lokasi Pegawai...</option>
                {selectedWorkUnit && employeeLocations[selectedWorkUnit] ? (
                  employeeLocations[selectedWorkUnit].map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))
                ) : (
                  <option value="Kedeputian Wilayah VIII">Kedeputian Wilayah VIII</option>
                )}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Bidang</Label>
              <select 
                id="department" 
                name="department" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                required
                defaultValue=""
              >
                <option value="" disabled>Pilih Bidang...</option>
                <option value="Bagian Mutu Layanan Kepesertaan (KC)">Bagian Mutu Layanan Kepesertaan (KC)</option>
                <option value="Bagian Mutu Layanan Fasilitas Kesehatan (KC)">Bagian Mutu Layanan Fasilitas Kesehatan (KC)</option>
                <option value="Bagian Mutu Layanan Kepesertaan (KC)">Bagian Mutu Layanan Kepesertaan (KC)</option>
                <option value="Bagian Mutu Layanan Fasilitas Kesehatan (KC)">Bagian Mutu Layanan Fasilitas Kesehatan (KC)</option>
                <option value="Bagian SDM, Umum dan Komunikasi (KC)">Bagian SDM, Umum dan Komunikasi (KC)</option>
                <option value="Bagian Penjaminan Manfaat dan Utilisasi (KC)">Bagian Penjaminan Manfaat dan Utilisasi (KC)</option>
                <option value="Bagian Kepesertaan (KC)">Bagian Kepesertaan (KC)</option>
                <option value="Bagian Perencanaan, Keuangan dan Pemeriksaan (KC)">Bagian Perencanaan, Keuangan dan Pemeriksaan (KC)</option>
                <option value="Kedeputian Wilayah VIII">Kedeputian Wilayah VIII</option>
                <option value="Bidang SDM, Umum dan Komunikasi (SDMUK)">Bidang SDM, Umum dan Komunikasi (SDMUK)</option>
                <option value="Bidang Jaminan Pelayanan Kesehatan (JPK)">Bidang Jaminan Pelayanan Kesehatan (JPK)</option>
                <option value="Bidang Kepesertaan dan Mutu Layanan (KML)">Bidang Kepesertaan dan Mutu Layanan (KML)</option>
                <option value="Bidang Perencanaan dan Keuangan (PK)">Bidang Perencanaan dan Keuangan (PK)</option>
                <option value="Kepesertaan dan Penagihan Iuran (Kabupaten)">Kepesertaan dan Penagihan Iuran (Kabupaten)</option>
                <option value="Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan (Kabupaten)">Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan (Kabupaten)</option>
                <option value="Kantor Kabupaten">Kantor Kabupaten</option>
                <option value="TI Wilayah">TI Wilayah</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">Jabatan</Label>
              <select 
                id="position" 
                name="position" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                required
                defaultValue=""
              >
                <option value="" disabled>Pilih Jabatan...</option>
                <option value="Deputi Direksi Wilayah">Deputi Direksi Wilayah</option>
                <option value="Asisten Deputi">Asisten Deputi</option>
                <option value="Kepala Cabang">Kepala Cabang</option>
                <option value="Asisten Manager">Asisten Manager</option>
                <option value="Kepala Kabupaten">Kepala Kabupaten</option>
                <option value="Staf Pelaksana">Staf Pelaksana</option>
                <option value="PTT/PATT">PTT/PATT</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="positionDetail">Detail Jabatan</Label>
              <select 
                id="positionDetail" 
                name="positionDetail" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                defaultValue=""
              >
                <option value="" disabled>Pilih Detail Jabatan...</option>
                <option value="Analis Jaminan Pelayanan Kesehatan Pratama">Analis Jaminan Pelayanan Kesehatan Pratama</option>
                <option value="Analis Komunikasi dan Kesekretariatan Pratama">Analis Komunikasi dan Kesekretariatan Pratama</option>
                <option value="Analis Mutu Layanan Pratama">Analis Mutu Layanan Pratama</option>
                <option value="Analis Perencanaan dan Keuangan">Analis Perencanaan dan Keuangan</option>
                <option value="Analis Perluasan dan Kepatuhan Pendaftaran Peserta Pratama">Analis Perluasan dan Kepatuhan Pendaftaran Peserta Pratama</option>
                <option value="Asisten Deputi Jaminan Pelayanan Kesehatan">Asisten Deputi Jaminan Pelayanan Kesehatan</option>
                <option value="Asisten Deputi Kepesertaan dan Mutu Layanan">Asisten Deputi Kepesertaan dan Mutu Layanan</option>
                <option value="Asisten Deputi Perencanaan dan Keuangan">Asisten Deputi Perencanaan dan Keuangan</option>
                <option value="Asisten Deputi SDM, Umum dan Komunikasi">Asisten Deputi SDM, Umum dan Komunikasi</option>
                <option value="Claim Advisor Pratama">Claim Advisor Pratama</option>
                <option value="Deputi Direksi Wilayah">Deputi Direksi Wilayah</option>
                <option value="Kasir">Kasir</option>
                <option value="Kepala Bagian Kepesertaan">Kepala Bagian Kepesertaan</option>
                <option value="Kepala Bagian Mutu Layanan Fasilitas Kesehatan">Kepala Bagian Mutu Layanan Fasilitas Kesehatan</option>
                <option value="Kepala Bagian Mutu Layanan Kepesertaan">Kepala Bagian Mutu Layanan Kepesertaan</option>
                <option value="Kepala Bagian Penjaminan Manfaat dan Utilisasi">Kepala Bagian Penjaminan Manfaat dan Utilisasi</option>
                <option value="Kepala Bagian Perencanaan, Keuangan dan Pemeriksaan">Kepala Bagian Perencanaan, Keuangan dan Pemeriksaan</option>
                <option value="Kepala Bagian SDM, Umum dan Komunikasi">Kepala Bagian SDM, Umum dan Komunikasi</option>
                <option value="Kepala Bagian Teknologi Informasi Wilayah VIII">Kepala Bagian Teknologi Informasi Wilayah VIII</option>
                <option value="Kepala Cabang">Kepala Cabang</option>
                <option value="Kepala Kantor Kabupaten">Kepala Kantor Kabupaten</option>
                <option value="Koordinator Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit">Koordinator Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit</option>
                <option value="Koordinator Frontliner">Koordinator Frontliner</option>
                <option value="Petugas Pemeriksa">Petugas Pemeriksa</option>
                <option value="Relationship Officer">Relationship Officer</option>
                <option value="PTT Staf Kepesertaan dan Penagihan Iuran Kabupaten">PTT Staf Kepesertaan dan Penagihan Iuran Kabupaten</option>
                <option value="PTT Staf Kepesertaan Kabupaten">PTT Staf Kepesertaan Kabupaten</option>
                <option value="Staf Administrasi Kepesertaan">Staf Administrasi Kepesertaan</option>
                <option value="Staf Edukasi dan Penanganan Pengaduan">Staf Edukasi dan Penanganan Pengaduan</option>
                <option value="Staf Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit">Staf Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit</option>
                <option value="Staf Frontliner">Staf Frontliner</option>
                <option value="Staf Jaminan Pelayanan Kesehatan">Staf Jaminan Pelayanan Kesehatan</option>
                <option value="Staf Kepesertaan dan Mutu Layanan">Staf Kepesertaan dan Mutu Layanan</option>
                <option value="Staf Kepesertaan dan Penagihan Iuran Kabupaten">Staf Kepesertaan dan Penagihan Iuran Kabupaten</option>
                <option value="Staf Kepesertaan Kabupaten">Staf Kepesertaan Kabupaten</option>
                <option value="Staf Kerja Sama Fasilitas Kesehatan">Staf Kerja Sama Fasilitas Kesehatan</option>
                <option value="Staf Komunikasi dan Kesekretariatan">Staf Komunikasi dan Kesekretariatan</option>
                <option value="Staf Mutu Layanan Fasilitas Kesehatan">Staf Mutu Layanan Fasilitas Kesehatan</option>
                <option value="Staf Penagihan">Staf Penagihan</option>
                <option value="Staf Penagihan dan Keuangan Kabupaten">Staf Penagihan dan Keuangan Kabupaten</option>
                <option value="Staf Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan Kabupaten">Staf Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan Kabupaten</option>
                <option value="Staf Perencanaan dan Keuangan">Staf Perencanaan dan Keuangan</option>
                <option value="Staf Perencanaan dan Pembukuan">Staf Perencanaan dan Pembukuan</option>
                <option value="Staf Promotif Preventif">Staf Promotif Preventif</option>
                <option value="Staf SDM dan Umum">Staf SDM dan Umum</option>
                <option value="Staf Teknologi Informasi Wilayah">Staf Teknologi Informasi Wilayah</option>
                <option value="Staf Utilisasi dan Pencegahan Kecurangan">Staf Utilisasi dan Pencegahan Kecurangan</option>
                <option value="Verifikator Klaim">Verifikator Klaim</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Hak Akses (Role)</Label>
              <select 
                id="role" 
                name="role" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="USER">User Biasa</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password (Opsional)</Label>
              <Input id="password" name="password" type="password" placeholder="Kosongkan untuk default password" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading} className="bg-[#015249] hover:bg-[#013b34]">
              {loading ? "Menyimpan..." : "Simpan Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditUserDialog({ user, children }: { user: any, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedWorkUnit, setSelectedWorkUnit] = useState(user.workUnit || "");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const result = await updateUser(user.id, data);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Pengguna</DialogTitle>
          <DialogDescription>
            Ubah informasi profil atau reset password untuk pengguna ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {error && <div className="text-sm text-red-500 font-medium p-2 bg-red-50 rounded-md">{error}</div>}
            
            <div className="grid gap-2">
              <Label htmlFor="edit-npp">NPP</Label>
              <Input 
                id="edit-npp" 
                name="npp" 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                defaultValue={user.npp || ""} 
                required 
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nama User</Label>
              <Input id="edit-name" name="name" defaultValue={user.name || ""} required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email (Opsional)</Label>
              <Input id="edit-email" name="email" type="email" defaultValue={user.email || ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-workUnit">Satuan Kerja</Label>
              <select 
                id="edit-workUnit" 
                name="workUnit" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                required
                value={selectedWorkUnit}
                onChange={(e) => setSelectedWorkUnit(e.target.value)}
              >
                <option value="" disabled>Pilih Satuan Kerja...</option>
                <option value="Kedeputian Bidang Operasional dan Keamanan Teknologi Informasi">Kedeputian Bidang Operasional dan Keamanan Teknologi Informasi</option>
                <option value="Kedeputian Wilayah VIII">Kedeputian Wilayah VIII</option>
                <option value="Kantor Cabang Balikpapan">Kantor Cabang Balikpapan</option>
                <option value="Kantor Cabang Banjarmasin">Kantor Cabang Banjarmasin</option>
                <option value="Kantor Cabang Barabai">Kantor Cabang Barabai</option>
                <option value="Kantor Cabang Muara Teweh">Kantor Cabang Muara Teweh</option>
                <option value="Kantor Cabang Palangka Raya">Kantor Cabang Palangka Raya</option>
                <option value="Kantor Cabang Samarinda">Kantor Cabang Samarinda</option>
                <option value="Kantor Cabang Sampit">Kantor Cabang Sampit</option>
                <option value="Kantor Cabang Tarakan">Kantor Cabang Tarakan</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-employeeLocation">Lokasi Pegawai</Label>
              <select 
                id="edit-employeeLocation" 
                name="employeeLocation" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black disabled:opacity-50"
                required
                defaultValue={user.employeeLocation || ""}
                disabled={!selectedWorkUnit}
              >
                <option value="" disabled>Pilih Lokasi Pegawai...</option>
                {selectedWorkUnit && employeeLocations[selectedWorkUnit] ? (
                  employeeLocations[selectedWorkUnit].map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))
                ) : (
                  <option value="Kedeputian Wilayah VIII">Kedeputian Wilayah VIII</option>
                )}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-department">Bidang</Label>
              <select 
                id="edit-department" 
                name="department" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                defaultValue={user.department || ""}
                required
              >
                <option value="" disabled>Pilih Bidang...</option>
                <option value="Bagian Mutu Layanan Kepesertaan (KC)">Bagian Mutu Layanan Kepesertaan (KC)</option>
                <option value="Bagian Mutu Layanan Fasilitas Kesehatan (KC)">Bagian Mutu Layanan Fasilitas Kesehatan (KC)</option>
                <option value="Bagian Mutu Layanan Kepesertaan (KC)">Bagian Mutu Layanan Kepesertaan (KC)</option>
                <option value="Bagian Mutu Layanan Fasilitas Kesehatan (KC)">Bagian Mutu Layanan Fasilitas Kesehatan (KC)</option>
                <option value="Bagian SDM, Umum dan Komunikasi (KC)">Bagian SDM, Umum dan Komunikasi (KC)</option>
                <option value="Bagian Penjaminan Manfaat dan Utilisasi (KC)">Bagian Penjaminan Manfaat dan Utilisasi (KC)</option>
                <option value="Bagian Kepesertaan (KC)">Bagian Kepesertaan (KC)</option>
                <option value="Bagian Perencanaan, Keuangan dan Pemeriksaan (KC)">Bagian Perencanaan, Keuangan dan Pemeriksaan (KC)</option>
                <option value="Kedeputian Wilayah VIII">Kedeputian Wilayah VIII</option>
                <option value="Bidang SDM, Umum dan Komunikasi (SDMUK)">Bidang SDM, Umum dan Komunikasi (SDMUK)</option>
                <option value="Bidang Jaminan Pelayanan Kesehatan (JPK)">Bidang Jaminan Pelayanan Kesehatan (JPK)</option>
                <option value="Bidang Kepesertaan dan Mutu Layanan (KML)">Bidang Kepesertaan dan Mutu Layanan (KML)</option>
                <option value="Bidang Perencanaan dan Keuangan (PK)">Bidang Perencanaan dan Keuangan (PK)</option>
                <option value="Kepesertaan dan Penagihan Iuran (Kabupaten)">Kepesertaan dan Penagihan Iuran (Kabupaten)</option>
                <option value="Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan (Kabupaten)">Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan (Kabupaten)</option>
                <option value="Kantor Kabupaten">Kantor Kabupaten</option>
                <option value="TI Wilayah">TI Wilayah</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-position">Jabatan</Label>
              <select 
                id="edit-position" 
                name="position" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                defaultValue={user.position || ""}
                required
              >
                <option value="" disabled>Pilih Jabatan...</option>
                <option value="Deputi Direksi Wilayah">Deputi Direksi Wilayah</option>
                <option value="Asisten Deputi">Asisten Deputi</option>
                <option value="Kepala Cabang">Kepala Cabang</option>
                <option value="Asisten Manager">Asisten Manager</option>
                <option value="Kepala Kabupaten">Kepala Kabupaten</option>
                <option value="Staf Pelaksana">Staf Pelaksana</option>
                <option value="PTT/PATT">PTT/PATT</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-positionDetail">Detail Jabatan</Label>
              <select 
                id="edit-positionDetail" 
                name="positionDetail" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                defaultValue={user.positionDetail || ""}
              >
                <option value="" disabled>Pilih Detail Jabatan...</option>
                <option value="Analis Jaminan Pelayanan Kesehatan Pratama">Analis Jaminan Pelayanan Kesehatan Pratama</option>
                <option value="Analis Komunikasi dan Kesekretariatan Pratama">Analis Komunikasi dan Kesekretariatan Pratama</option>
                <option value="Analis Mutu Layanan Pratama">Analis Mutu Layanan Pratama</option>
                <option value="Analis Perencanaan dan Keuangan">Analis Perencanaan dan Keuangan</option>
                <option value="Analis Perluasan dan Kepatuhan Pendaftaran Peserta Pratama">Analis Perluasan dan Kepatuhan Pendaftaran Peserta Pratama</option>
                <option value="Asisten Deputi Jaminan Pelayanan Kesehatan">Asisten Deputi Jaminan Pelayanan Kesehatan</option>
                <option value="Asisten Deputi Kepesertaan dan Mutu Layanan">Asisten Deputi Kepesertaan dan Mutu Layanan</option>
                <option value="Asisten Deputi Perencanaan dan Keuangan">Asisten Deputi Perencanaan dan Keuangan</option>
                <option value="Asisten Deputi SDM, Umum dan Komunikasi">Asisten Deputi SDM, Umum dan Komunikasi</option>
                <option value="Claim Advisor Pratama">Claim Advisor Pratama</option>
                <option value="Deputi Direksi Wilayah">Deputi Direksi Wilayah</option>
                <option value="Kasir">Kasir</option>
                <option value="Kepala Bagian Kepesertaan">Kepala Bagian Kepesertaan</option>
                <option value="Kepala Bagian Mutu Layanan Fasilitas Kesehatan">Kepala Bagian Mutu Layanan Fasilitas Kesehatan</option>
                <option value="Kepala Bagian Mutu Layanan Kepesertaan">Kepala Bagian Mutu Layanan Kepesertaan</option>
                <option value="Kepala Bagian Penjaminan Manfaat dan Utilisasi">Kepala Bagian Penjaminan Manfaat dan Utilisasi</option>
                <option value="Kepala Bagian Perencanaan, Keuangan dan Pemeriksaan">Kepala Bagian Perencanaan, Keuangan dan Pemeriksaan</option>
                <option value="Kepala Bagian SDM, Umum dan Komunikasi">Kepala Bagian SDM, Umum dan Komunikasi</option>
                <option value="Kepala Bagian Teknologi Informasi Wilayah VIII">Kepala Bagian Teknologi Informasi Wilayah VIII</option>
                <option value="Kepala Cabang">Kepala Cabang</option>
                <option value="Kepala Kantor Kabupaten">Kepala Kantor Kabupaten</option>
                <option value="Koordinator Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit">Koordinator Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit</option>
                <option value="Koordinator Frontliner">Koordinator Frontliner</option>
                <option value="Petugas Pemeriksa">Petugas Pemeriksa</option>
                <option value="Relationship Officer">Relationship Officer</option>
                <option value="PTT Staf Kepesertaan dan Penagihan Iuran Kabupaten">PTT Staf Kepesertaan dan Penagihan Iuran Kabupaten</option>
                <option value="PTT Staf Kepesertaan Kabupaten">PTT Staf Kepesertaan Kabupaten</option>
                <option value="Staf Administrasi Kepesertaan">Staf Administrasi Kepesertaan</option>
                <option value="Staf Edukasi dan Penanganan Pengaduan">Staf Edukasi dan Penanganan Pengaduan</option>
                <option value="Staf Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit">Staf Edukasi dan Penanganan Pengaduan Peserta di Rumah Sakit</option>
                <option value="Staf Frontliner">Staf Frontliner</option>
                <option value="Staf Jaminan Pelayanan Kesehatan">Staf Jaminan Pelayanan Kesehatan</option>
                <option value="Staf Kepesertaan dan Mutu Layanan">Staf Kepesertaan dan Mutu Layanan</option>
                <option value="Staf Kepesertaan dan Penagihan Iuran Kabupaten">Staf Kepesertaan dan Penagihan Iuran Kabupaten</option>
                <option value="Staf Kepesertaan Kabupaten">Staf Kepesertaan Kabupaten</option>
                <option value="Staf Kerja Sama Fasilitas Kesehatan">Staf Kerja Sama Fasilitas Kesehatan</option>
                <option value="Staf Komunikasi dan Kesekretariatan">Staf Komunikasi dan Kesekretariatan</option>
                <option value="Staf Mutu Layanan Fasilitas Kesehatan">Staf Mutu Layanan Fasilitas Kesehatan</option>
                <option value="Staf Penagihan">Staf Penagihan</option>
                <option value="Staf Penagihan dan Keuangan Kabupaten">Staf Penagihan dan Keuangan Kabupaten</option>
                <option value="Staf Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan Kabupaten">Staf Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan Kabupaten</option>
                <option value="Staf Perencanaan dan Keuangan">Staf Perencanaan dan Keuangan</option>
                <option value="Staf Perencanaan dan Pembukuan">Staf Perencanaan dan Pembukuan</option>
                <option value="Staf Promotif Preventif">Staf Promotif Preventif</option>
                <option value="Staf SDM dan Umum">Staf SDM dan Umum</option>
                <option value="Staf Teknologi Informasi Wilayah">Staf Teknologi Informasi Wilayah</option>
                <option value="Staf Utilisasi dan Pencegahan Kecurangan">Staf Utilisasi dan Pencegahan Kecurangan</option>
                <option value="Verifikator Klaim">Verifikator Klaim</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-role">Hak Akses (Role)</Label>
              <select 
                id="edit-role" 
                name="role" 
                defaultValue={user.role}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="USER">User Biasa</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-password" className="flex items-center gap-2">
                <KeyRound className="w-3 h-3" /> Password Baru (Opsional)
              </Label>
              <Input id="edit-password" name="password" type="password" placeholder="Isi hanya jika ingin mengubah password" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={loading} className="bg-[#015249] hover:bg-[#013b34]">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
