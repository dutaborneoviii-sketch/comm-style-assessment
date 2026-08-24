"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createUser, updateUser } from "@/app/actions/users";
import { Plus, Edit2, KeyRound } from "lucide-react";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
              <Label htmlFor="department">Bidang</Label>
              <select 
                id="department" 
                name="department" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                required
                defaultValue=""
              >
                <option value="" disabled>Pilih Bidang...</option>
                <option value="Bidang SDM, Umum dan Komunikasi (SDMUK)">Bidang SDM, Umum dan Komunikasi (SDMUK)</option>
                <option value="Bidang Jaminan Pelayanan Kesehatan (JPK)">Bidang Jaminan Pelayanan Kesehatan (JPK)</option>
                <option value="Bidang Kepesertaan dan Mutu Layanan (KML)">Bidang Kepesertaan dan Mutu Layanan (KML)</option>
                <option value="Bidang Perencanaan dan Keuangan (PK)">Bidang Perencanaan dan Keuangan (PK)</option>
                <option value="TI Wilayah">Bidang TI Wilayah</option>
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
                <option value="Asisten Manager">Asisten Manager</option>
                <option value="Staf Pelaksana">Staf Pelaksana</option>
                <option value="PATT/PTT">PATT/PTT</option>
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
              <Label htmlFor="edit-department">Bidang</Label>
              <select 
                id="edit-department" 
                name="department" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-black"
                defaultValue={user.department || ""}
                required
              >
                <option value="" disabled>Pilih Bidang...</option>
                <option value="Bidang SDM, Umum dan Komunikasi (SDMUK)">Bidang SDM, Umum dan Komunikasi (SDMUK)</option>
                <option value="Bidang Jaminan Pelayanan Kesehatan (JPK)">Bidang Jaminan Pelayanan Kesehatan (JPK)</option>
                <option value="Bidang Kepesertaan dan Mutu Layanan (KML)">Bidang Kepesertaan dan Mutu Layanan (KML)</option>
                <option value="Bidang Perencanaan dan Keuangan (PK)">Bidang Perencanaan dan Keuangan (PK)</option>
                <option value="TI Wilayah">Bidang TI Wilayah</option>
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
                <option value="Asisten Manager">Asisten Manager</option>
                <option value="Staf Pelaksana">Staf Pelaksana</option>
                <option value="PATT/PTT">PATT/PTT</option>
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
