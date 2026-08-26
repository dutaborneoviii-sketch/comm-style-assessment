"use client";

import { useState } from "react";
import { User, LogOut, KeyRound, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { changeSelfPassword } from "@/app/actions/users";

function SubmitPasswordButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="h-10 px-5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
    >
      {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
    </button>
  );
}

interface ProfileDropdownProps {
  user: any;
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  
  // Password state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await changeSelfPassword(formData);
    
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setPasswordOpen(false);
        setSuccess(false);
      }, 2000);
    }
  }

  const handlePasswordOpenChange = (open: boolean) => {
    setPasswordOpen(open);
    if (!open) {
      setTimeout(() => {
        setError(null);
        setSuccess(false);
      }, 300);
    }
  };

  const logoutAction = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="group flex items-center gap-2 text-white bg-white/10 hover:bg-white/15 transition-colors px-4 py-2 rounded-full border border-white/20 shadow-sm backdrop-blur-md focus:outline-none data-[popup-open]:bg-white/20">
          <div className="bg-white/20 p-1 rounded-full">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-bold tracking-tight leading-none">
              {user?.name || "Tanpa Nama"}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-white/70 ml-1 transition-transform duration-200 group-data-[popup-open]:-rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px] p-0 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden" align="end" sideOffset={12}>
          <div className="flex items-center gap-4 p-5 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-b border-slate-100 dark:border-zinc-800">
            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-xl shadow-sm">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <p className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name || "Tanpa Nama"} {user?.npp ? `(${user.npp})` : ''}
              </p>
              {(user?.position || user?.department) && (
                <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                  {user?.position && <p className="font-medium text-slate-700 dark:text-slate-300">{user.position}</p>}
                  {user?.department && <p>{user.department}</p>}
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenuGroup className="p-2 space-y-1">
            <DropdownMenuItem
              onClick={() => setPasswordOpen(true)}
              className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800"
            >
              <KeyRound className="w-[18px] h-[18px] text-slate-500 dark:text-slate-400" />
              <span className="text-[14px] font-medium text-slate-700 dark:text-slate-200">Ubah Password</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => setLogoutOpen(true)}
              className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-red-600 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950/30 dark:focus:bg-red-950/30"
            >
              <LogOut className="w-[18px] h-[18px] text-red-500" />
              <span className="text-[14px] font-medium text-red-600 dark:text-red-400">Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
          <div className="p-6 pb-4">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 pr-6">
                Konfirmasi Keluar
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 font-normal">
                Apakah Anda yakin ingin keluar dari aplikasi? Anda harus login kembali untuk masuk.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="bg-slate-50/70 dark:bg-zinc-900/40 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-900">
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              className="h-10 px-5 text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={logoutAction}
              className="h-10 px-5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-xl transition-colors disabled:opacity-50"
            >
              Ya, Keluar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={handlePasswordOpenChange}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
          <div className="p-6 pb-4">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Ubah Password
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400 font-normal">
                Silakan masukkan password lama Anda dan tentukan password baru yang aman.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  Password berhasil diubah.
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="oldPassword">
                  Password Lama
                </label>
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  required
                  className="w-full h-10 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900"
                  placeholder="Masukkan password saat ini"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="newPassword">
                  Password Baru
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  className="w-full h-10 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900"
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
                  Konfirmasi Password Baru
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className="w-full h-10 px-3 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-900"
                  placeholder="Ketik ulang password baru"
                />
              </div>
            </div>

            <div className="bg-slate-50/70 dark:bg-zinc-900/40 px-6 py-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => handlePasswordOpenChange(false)}
                className="h-10 px-5 text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Batal
              </button>
              <SubmitPasswordButton isSubmitting={isSubmitting} />
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
