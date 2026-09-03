"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser, approveUser, toggleUserStatus, resetUserPassword, migrateUsers, resetUserAssessment } from "@/app/actions/users";
import { CreateUserDialog, EditUserDialog } from "./user-dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Trash2, Search, Edit, Shield, User as UserIcon, CheckCircle2, XCircle, Power, PowerOff, KeyRound, AlertTriangle, Upload, FileUp, Download, Check, AlertCircle, Copy, RefreshCw, Wrench, ChevronDown, CheckSquare, Square } from "lucide-react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { employeeLocations } from "@/lib/locations";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
}

const defaultConfirm: ConfirmState = {
  open: false,
  title: "",
  message: "",
  confirmLabel: "Ya",
  confirmClass: "bg-red-600 hover:bg-red-700 text-white",
  onConfirm: () => {},
};

export function UserManager({ initialUsers, currentUserId }: { initialUsers: any[], currentUserId: string }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);

  const uniqueLocations = Array.from(new Set(initialUsers.map((u) => u.employeeLocation).filter(Boolean))) as string[];
  uniqueLocations.sort();
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [isResettingAssessment, setIsResettingAssessment] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(defaultConfirm);

  function showConfirm(opts: Omit<ConfirmState, 'open'>) {
    setConfirm({ ...opts, open: true });
  }

  function closeConfirm() {
    setConfirm(defaultConfirm);
  }

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search and Location filter
  const filteredUsers = initialUsers.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) || 
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.department?.toLowerCase().includes(search.toLowerCase()) ||
      user.workUnit?.toLowerCase().includes(search.toLowerCase()) ||
      user.npp?.toLowerCase().includes(search.toLowerCase());
    
    const matchesLocation = locationFilter === "all" || user.employeeLocation === locationFilter;
    
    return matchesSearch && matchesLocation;
  });

  const registeredUsers = filteredUsers.filter(u => u.status === 'APPROVED' || u.status === 'INACTIVE' || u.status === 'ACTIVE');
  const pendingUsers = filteredUsers.filter(u => u.status === 'PENDING');

  const totalPages = Math.max(1, Math.ceil(registeredUsers.length / itemsPerPage));
  const currentUsers = registeredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when searching
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocationFilter(e.target.value);
    setCurrentPage(1);
  };

  async function handleDelete(id: string, name: string) {
    showConfirm({
      title: "Hapus Pengguna",
      message: `Apakah Anda yakin ingin menghapus pengguna "${name || 'ini'}"? Semua data terkait (asesmen, log coaching) juga akan ikut terhapus secara permanen.`,
      confirmLabel: "Ya, Hapus",
      confirmClass: "bg-red-600 hover:bg-red-700 text-white",
      onConfirm: async () => {
        closeConfirm();
        setIsDeleting(id);
        const result = await deleteUser(id);
        if (result.error) {
          showConfirm({
            title: "Gagal Menghapus",
            message: result.error,
            confirmLabel: "Tutup",
            confirmClass: "bg-slate-600 hover:bg-slate-700 text-white",
            onConfirm: closeConfirm,
          });
        } else {
          router.refresh();
        }
        setIsDeleting(null);
      },
    });
  }

  async function handleApprove(id: string, name: string) {
    showConfirm({
      title: "Setujui Pengguna",
      message: `Setujui pengguna "${name || 'ini'}" untuk mendapatkan akses login?`,
      confirmLabel: "Ya, Setujui",
      confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
      onConfirm: async () => {
        closeConfirm();
        setIsApproving(id);
        const result = await approveUser(id);
        if (result.error) {
          showConfirm({
            title: "Gagal Menyetujui",
            message: result.error,
            confirmLabel: "Tutup",
            confirmClass: "bg-slate-600 hover:bg-slate-700 text-white",
            onConfirm: closeConfirm,
          });
        } else {
          router.refresh();
        }
        setIsApproving(null);
      },
    });
  }

  async function handleToggleStatus(id: string, currentStatus: string, name: string) {
    const actionName = currentStatus === 'APPROVED' ? 'menonaktifkan' : 'mengaktifkan kembali';
    const confirmLabel = currentStatus === 'APPROVED' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan';
    const confirmClass = currentStatus === 'APPROVED'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-emerald-600 hover:bg-emerald-700 text-white';

    showConfirm({
      title: currentStatus === 'APPROVED' ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna",
      message: `Apakah Anda yakin ingin ${actionName} pengguna "${name || 'ini'}"?`,
      confirmLabel,
      confirmClass,
      onConfirm: async () => {
        closeConfirm();
        setIsToggling(id);
        const result = await toggleUserStatus(id, currentStatus);
        if (result.error) {
          showConfirm({
            title: "Gagal",
            message: result.error,
            confirmLabel: "Tutup",
            confirmClass: "bg-slate-600 hover:bg-slate-700 text-white",
            onConfirm: closeConfirm,
          });
        } else {
          router.refresh();
        }
        setIsToggling(null);
      },
    });
  }

  async function handleResetPassword(id: string, name: string) {
    showConfirm({
      title: "Reset Password",
      message: `Apakah Anda yakin ingin mereset password untuk pengguna "${name || 'ini'}"? Password baru akan digenerate otomatis dan dikirimkan ke email pengguna.`,
      confirmLabel: "Ya, Reset Password",
      confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
      onConfirm: async () => {
        closeConfirm();
        setIsResetting(id);
        const result = await resetUserPassword(id);
        if (result.error) {
          showConfirm({
            title: "Gagal Reset Password",
            message: result.error,
            confirmLabel: "Tutup",
            confirmClass: "bg-slate-600 hover:bg-slate-700 text-white",
            onConfirm: closeConfirm,
          });
        } else if (result.password) {
          let msg = `Password berhasil direset menjadi: ${result.password}.`;
          if (result.hasEmail && result.emailSent) {
            msg += ` Password baru juga telah berhasil dikirimkan ke email pengguna.`;
          } else if (result.hasEmail && !result.emailSent) {
            msg += ` Namun, sistem gagal mengirimkan password ke email pengguna. Harap beritahu pengguna secara manual.`;
          } else {
            msg += ` Pengguna ini tidak memiliki alamat email yang terdaftar, harap beritahu pengguna secara manual.`;
          }

          showConfirm({
            title: "Password Berhasil Direset",
            message: msg,
            confirmLabel: "Tutup",
            confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
            onConfirm: closeConfirm,
          });
          router.refresh();
        }
        setIsResetting(null);
      },
    });
  }

  async function handleResetAssessment(id: string, name: string) {
    showConfirm({
      title: "Reset Asesmen",
      message: `Apakah Anda yakin ingin menghapus seluruh riwayat asesmen gaya komunikasi untuk pengguna "${name || 'ini'}"? Pengguna akan dapat mengisi ulang kuesioner dari awal.`,
      confirmLabel: "Ya, Reset Asesmen",
      confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
      onConfirm: async () => {
        closeConfirm();
        setIsResettingAssessment(id);
        const result = await resetUserAssessment(id);
        if (result.error) {
          showConfirm({
            title: "Gagal Reset Asesmen",
            message: result.error,
            confirmLabel: "Tutup",
            confirmClass: "bg-slate-600 hover:bg-slate-700 text-white",
            onConfirm: closeConfirm,
          });
        } else {
          showConfirm({
            title: "Asesmen Berhasil Direset",
            message: `Riwayat asesmen untuk pengguna tersebut telah berhasil dihapus.`,
            confirmLabel: "Tutup",
            confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
            onConfirm: closeConfirm,
          });
          router.refresh();
        }
        setIsResettingAssessment(null);
      },
    });
  }

  const downloadAccessLog = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Akses User');

    sheet.columns = [
      { header: 'NPP', key: 'npp', width: 15 },
      { header: 'Nama User', key: 'name', width: 25 },
      { header: 'Satuan Kerja', key: 'workUnit', width: 25 },
      { header: 'Lokasi Pegawai', key: 'employeeLocation', width: 20 },
      { header: 'Bidang', key: 'department', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Waktu Login Terakhir', key: 'lastAccess', width: 25 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2EFDA' }
    };

    initialUsers.forEach((u: any) => {
      let lastAccess = "-";
      if (u.loginLogs && u.loginLogs.length > 0) {
        lastAccess = new Intl.DateTimeFormat('id-ID', { 
          day: 'numeric', month: 'short', year: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
        }).format(new Date(u.loginLogs[0].createdAt));
      }
      sheet.addRow({
        npp: u.npp || "-",
        name: u.name || "-",
        workUnit: u.workUnit || "-",
        employeeLocation: u.employeeLocation || "-",
        department: u.department || "-",
        status: u.status === 'APPROVED' ? 'Aktif' : 'Menunggu',
        lastAccess: lastAccess
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_akses_user_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {userToEdit && <EditUserDialog user={userToEdit} open={true} onOpenChange={(open) => !open && setUserToEdit(null)} />}
      
      {/* Custom Confirm Dialog */}
      <Dialog open={confirm.open} onOpenChange={(open) => { if (!open) closeConfirm(); }}>
        <DialogContent className="sm:max-w-[440px] bg-white dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-white">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {confirm.title}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {confirm.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={closeConfirm}>
              Batal
            </Button>
            <Button className={confirm.confirmClass} onClick={confirm.onConfirm}>
              {confirm.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama, NPP, bidang, atau satuan kerja..." 
              value={search}
              onChange={handleSearchChange}
              className="pl-9 bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800"
            />
          </div>
          <select
            value={locationFilter}
            onChange={handleLocationChange}
            className="flex h-10 w-full sm:w-60 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 text-slate-900 dark:text-slate-100"
          >
            <option value="all">Semua Lokasi Pegawai</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap justify-end">
          <Button onClick={downloadAccessLog} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-900 dark:hover:bg-teal-950/30 gap-2 font-bold text-xs h-9 rounded-xl">
            <Download className="w-4 h-4" />
            Unduh Excel Last Access
          </Button>
          <MigrationDialog />
          <CreateUserDialog />
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full sm:w-[450px] grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-900/50">
          <TabsTrigger value="active" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm">
            Semua User ({registeredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm relative whitespace-nowrap">
            Menunggu Persetujuan 
            {pendingUsers.length > 0 && (
              <span className="ml-1.5 flex-shrink-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-3 font-semibold">NPP</th>
                    <th className="px-3 py-3 font-semibold">Nama User</th>
                    <th className="px-3 py-3 font-semibold">Satuan Kerja</th>
                    <th className="px-3 py-3 font-semibold">Lokasi Pegawai</th>
                    <th className="px-3 py-3 font-semibold">Bidang</th>

                    <th className="px-3 py-3 font-semibold">Peran</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-8 text-center text-muted-foreground">
                        Tidak ada pengguna yang ditemukan di halaman ini.
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr key={user.id} className={`transition-colors ${user.status === 'INACTIVE' ? 'bg-slate-50/50 dark:bg-slate-900/20 opacity-70 grayscale-[30%]' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/20'}`}>
                        <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                          {user.npp || "-"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white">{user.name || "Tanpa Nama"}</span>
                              {user.status === 'INACTIVE' && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                                  NONAKTIF
                                </span>
                              )}
                            </div>
                            {user.email && <span className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{user.email}</span>}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300" title={user.workUnit || ""}>
                          {user.workUnit || "-"}
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300" title={user.employeeLocation || ""}>
                          {user.employeeLocation || "-"}
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300" title={user.department || ""}>
                          {user.department || "-"}
                        </td>

                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.role === "ADMIN" 
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}>
                            {user.role === "ADMIN" ? <Shield className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                            {user.role === "ADMIN" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.status === "INACTIVE" 
                              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" 
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          }`}>
                            {user.status === "INACTIVE" ? "Nonaktif" : "Aktif"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="default" className="h-8 p-0 overflow-hidden bg-[#2ca95a] hover:bg-[#208a46] text-white rounded shadow-sm flex items-center border border-[#208a46]">
                                  <div className="px-2.5 h-full flex items-center bg-[#2ca95a] group-hover:bg-[#208a46]">
                                    <Wrench className="w-4 h-4" />
                                  </div>
                                  <div className="px-1.5 h-full flex items-center border-l border-white/20 bg-[#24954e] hover:bg-[#1a773d] transition-colors">
                                    <ChevronDown className="w-4 h-4" />
                                  </div>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status, user.name)} disabled={currentUserId === user.id}>
                                  {user.status === 'INACTIVE' ? <Square className="w-4 h-4 mr-2" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                                  Status Aktif
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setUserToEdit(user)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Ubah Profil
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(user.id, user.name)} disabled={isResetting === user.id}>
                                  <KeyRound className="w-4 h-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetAssessment(user.id, user.name)} disabled={isResettingAssessment === user.id}>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Reset Asesmen
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(user.id, user.name)} disabled={isDeleting === user.id || currentUserId === user.id} className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950 dark:focus:text-red-400">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus Pengguna
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, registeredUsers.length)} dari {registeredUsers.length} pengguna
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Hal {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-3 font-semibold">NPP</th>
                    <th className="px-3 py-3 font-semibold">Nama User</th>
                    <th className="px-3 py-3 font-semibold">Satuan Kerja</th>
                    <th className="px-3 py-3 font-semibold">Lokasi Pegawai</th>
                    <th className="px-3 py-3 font-semibold">Bidang</th>

                    <th className="px-3 py-3 font-semibold">Tgl Daftar</th>
                    <th className="px-3 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {pendingUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        Tidak ada pengguna yang menunggu persetujuan.
                      </td>
                    </tr>
                  ) : (
                    pendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                          {user.npp || "-"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white">{user.name || "Tanpa Nama"}</span>
                            {user.email && <span className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{user.email}</span>}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300" title={user.workUnit || ""}>
                          {user.workUnit || "-"}
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300" title={user.employeeLocation || ""}>
                          {user.employeeLocation || "-"}
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300" title={user.department || ""}>
                          {user.department || "-"}
                        </td>

                        <td className="px-3 py-3 text-slate-500 dark:text-slate-400 text-xs" suppressHydrationWarning>
                          {user.createdAt ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(user.createdAt)) : "-"}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-900/30"
                              onClick={() => handleApprove(user.id, user.name)}
                              disabled={isApproving === user.id}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Setujui
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/30"
                              onClick={() => handleDelete(user.id, user.name)}
                              disabled={isDeleting === user.id}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Tolak
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MigrationDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Silakan pilih file excel terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event.target?.result) {
          setError("Gagal membaca file.");
          setLoading(false);
          return;
        }

        const base64Data = (event.target.result as string).split(",")[1];
        const res = await migrateUsers(base64Data);

        if (res.error) {
          setError(res.error);
        } else if (res.results) {
          setResults(res.results);
        }
        setLoading(false);
      };

      reader.onerror = () => {
        setError("Error membaca file.");
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError("Terjadi kesalahan sistem: " + err.message);
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    
    // Create hidden options sheet
    const optionsSheet = workbook.addWorksheet('Options', { state: 'hidden' });
    
    const satuanKerjaList = [
      "Kedeputian Bidang Operasional dan Keamanan Teknologi Informasi",
      "Kedeputian Wilayah VIII",
      "Kantor Cabang Balikpapan",
      "Kantor Cabang Banjarmasin",
      "Kantor Cabang Barabai",
      "Kantor Cabang Muara Teweh",
      "Kantor Cabang Palangka Raya",
      "Kantor Cabang Samarinda",
      "Kantor Cabang Sampit",
      "Kantor Cabang Tarakan"
    ];
    
    const lokasiPegawaiList = Array.from(new Set(Object.values(employeeLocations).flat())).sort();
    
    const bidangList = [
      "Bagian Mutu Layanan Kepesertaan (KC)",
      "Bagian Mutu Layanan Fasilitas Kesehatan (KC)",
      "Bagian SDM, Umum dan Komunikasi (KC)",
      "Bagian Penjaminan Manfaat dan Utilisasi (KC)",
      "Bagian Kepesertaan (KC)",
      "Bagian Perencanaan, Keuangan dan Pemeriksaan (KC)",
      "Kedeputian Wilayah VIII",
      "Bidang SDM, Umum dan Komunikasi (SDMUK)",
      "Bidang Jaminan Pelayanan Kesehatan (JPK)",
      "Bidang Kepesertaan dan Mutu Layanan (KML)",
      "Bidang Perencanaan dan Keuangan (PK)",
      "Kepesertaan dan Penagihan Iuran (Kabupaten)",
      "Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan (Kabupaten)",
      "Kantor Kabupaten",
      "Kantor Kota",
      "Kantor Cabang",
      "TI Wilayah"
    ];
    
    const pangkatList = [
      "Senior Manager",
      "Manager",
      "Asisten Manager",
      "Pelaksana",
      "PTT/PATT"
    ];
    
    const detailJabatanList = [
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
    ];
    
    const roleList = ["User Biasa", "Admin"];

    // Fill Options Sheet
    satuanKerjaList.forEach((v, i) => { optionsSheet.getCell(`A${i+1}`).value = v; });
    lokasiPegawaiList.forEach((v, i) => { optionsSheet.getCell(`B${i+1}`).value = v; });
    bidangList.forEach((v, i) => { optionsSheet.getCell(`C${i+1}`).value = v; });
    pangkatList.forEach((v, i) => { optionsSheet.getCell(`D${i+1}`).value = v; });
    detailJabatanList.forEach((v, i) => { optionsSheet.getCell(`E${i+1}`).value = v; });
    roleList.forEach((v, i) => { optionsSheet.getCell(`F${i+1}`).value = v; });

    // Create Main Template Sheet
    const sheet = workbook.addWorksheet("Template");
    const headers = ["NPP", "Nama User", "Email (Opsional)", "Satuan Kerja", "Lokasi Pegawai", "Bidang", "Pangkat", "Detail Jabatan", "Hak Akses (Role)"];
    sheet.addRow(headers);

    // Style Headers
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

    // Column widths
    sheet.columns = [
      { width: 15 }, { width: 25 }, { width: 25 }, 
      { width: 30 }, { width: 30 }, { width: 30 },
      { width: 25 }, { width: 35 }, { width: 20 }
    ];

    // Data validations for rows 2 to 100
    for (let i = 2; i <= 100; i++) {
      sheet.getCell(`D${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`Options!$A$1:$A$${satuanKerjaList.length}`]
      };
      sheet.getCell(`E${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`Options!$B$1:$B$${lokasiPegawaiList.length}`]
      };
      sheet.getCell(`F${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`Options!$C$1:$C$${bidangList.length}`]
      };
      sheet.getCell(`G${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`Options!$D$1:$D$${pangkatList.length}`]
      };
      sheet.getCell(`H${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`Options!$E$1:$E$${detailJabatanList.length}`]
      };
      sheet.getCell(`I${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`Options!$F$1:$F$${roleList.length}`]
      };
    }

    // Sample Data
    sheet.addRow(["10234", "Budi Santoso", "budi@domain.com", "Kantor Cabang Muara Teweh", "Kantor Cabang Muara Teweh", "Bagian SDM, Umum dan Komunikasi (KC)", "Asisten Manager", "Kepala Bagian SDM, Umum dan Komunikasi", "User Biasa"]);
    sheet.addRow(["10235", "Rina Melati", "rina@domain.com", "Kedeputian Wilayah VIII", "Kedeputian Wilayah VIII", "Bidang SDM, Umum dan Komunikasi (SDMUK)", "Asisten Deputi", "Kepala Bagian SDM, Umum dan Komunikasi", "Admin"]);

    // Write buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_migrasi_user.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadResultsReport = async () => {
    if (!results) return;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Laporan Migrasi');

    sheet.columns = [
      { header: 'NPP', key: 'npp', width: 15 },
      { header: 'Nama User', key: 'name', width: 25 },
      { header: 'Satuan Kerja', key: 'workUnit', width: 25 },
      { header: 'Bidang', key: 'department', width: 25 },
      { header: 'Pangkat', key: 'pangkat', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Password Baru', key: 'passwordGenerated', width: 20 },
      { header: 'Keterangan Error', key: 'message', width: 30 },
    ];

    // Style the header row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF015249' } };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    results.forEach(r => {
      const row = sheet.addRow({
        npp: r.npp,
        name: r.name,
        workUnit: r.workUnit,
        department: r.department,
        pangkat: r.pangkat,
        status: r.status === "SUCCESS" ? "Berhasil" : "Gagal",
        passwordGenerated: r.passwordGenerated,
        message: r.message || "-"
      });
      
      // Highlight failed rows
      if (r.status === "FAILED") {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Migrasi_User_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        if (results) router.refresh();
        setFile(null);
        setError("");
        setResults(null);
      }
    }}>
      <DialogTrigger render={
        <Button variant="outline" className="border-blue-200 text-[#015249] hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/30 gap-2 font-bold text-xs h-9 rounded-xl">
          <Upload className="w-4 h-4" />
          Migrasi User Excel
        </Button>
      } />
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b pb-3 border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-lg font-black text-[#015249] dark:text-blue-400 flex items-center gap-2">
            <FileUp className="w-5 h-5 text-[#57BC90]" />
            Migrasi Data User via Excel
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-semibold mt-1">
            Unggah file excel untuk menambahkan pengguna baru secara massal. Sistem akan mengenerate password otomatis sesuai kebijakan keamanan (minimal 8 karakter, kombinasi huruf besar/kecil, angka, dan simbol).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Template Download Alert */}
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">Belum punya template migrasi?</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Unduh format Excel standar di sini untuk mempercepat proses pengisian data.</p>
            </div>
            <Button onClick={downloadTemplate} variant="ghost" className="h-8 font-extrabold text-[11px] text-[#015249] hover:text-[#57BC90] gap-1.5 shrink-0 border border-slate-200 dark:border-slate-700 rounded-lg">
              <Download className="w-3.5 h-3.5" />
              Unduh Format
            </Button>
          </div>

          {/* File Input upload zone */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">Pilih Berkas Excel</label>
            <div className="flex gap-3">
              <Input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange} 
                className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-xs py-2 h-10 rounded-xl flex-1 cursor-pointer"
              />
              <Button 
                onClick={handleUpload} 
                disabled={loading || !file}
                className="bg-[#015249] hover:bg-[#57BC90] text-white font-bold h-10 px-5 rounded-xl text-xs gap-2 shrink-0"
              >
                {loading ? "Memproses..." : "Mulai Migrasi"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Table of Generated Passwords */}
          {results && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Laporan Status Migrasi</h4>
                <Button onClick={downloadResultsReport} variant="outline" className="h-7 text-[10px] font-bold text-[#015249] border-[#015249]/30 hover:bg-[#015249]/5 gap-1 rounded-md px-3">
                  <Download className="w-3 h-3" />
                  Unduh Excel Laporan
                </Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm max-h-[220px]">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200/60 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-2.5">NPP</th>
                      <th className="p-2.5">Nama</th>
                      <th className="p-2.5">Satuan Kerja</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Password Baru</th>
                      <th className="p-2.5 text-center">Salin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {results.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 font-medium text-slate-700 dark:text-slate-300">
                        <td className="p-2.5 font-medium text-slate-900 dark:text-white" title={r.npp}>{r.npp}</td>
                        <td className="p-2.5 truncate max-w-[120px]" title={r.name}>{r.name}</td>
                        <td className="p-2.5 truncate max-w-[120px]" title={r.workUnit}>{r.workUnit}</td>
                        <td className="p-2.5 truncate max-w-[120px]" title={r.employeeLocation}>{r.employeeLocation || "-"}</td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            {r.department}
                          </span>
                        </td>
                        <td className="p-2.5 truncate max-w-[100px]">{r.pangkat}</td>
                        <td className="p-2.5 truncate max-w-[100px]">{r.positionDetail || "-"}</td>
                        <td className="p-2.5">
                          <div className="flex flex-col gap-1">
                            {r.status === "SUCCESS" ? (
                              <span className="inline-flex w-fit px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-md font-bold text-[9px]">Berhasil</span>
                            ) : (
                              <>
                                <span className="inline-flex w-fit px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-md font-bold text-[9px]">Gagal</span>
                                <span className="text-[10px] text-red-500 dark:text-red-400 leading-tight max-w-[120px]">{r.message}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-slate-200/40 dark:border-slate-800/40">
                          {r.status === "SUCCESS" ? r.passwordGenerated : "-"}
                        </td>
                        <td className="p-2.5 text-center">
                          {r.status === "SUCCESS" && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleCopy(r.passwordGenerated, idx)} 
                              className="h-6 w-6 text-slate-400 hover:text-[#57BC90]"
                            >
                              {copiedIndex === idx ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-in" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 border-slate-100 dark:border-slate-800 mt-4 gap-2">
          <Button 
            onClick={() => setOpen(false)} 
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold px-6 py-2 rounded-xl text-xs"
          >
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
