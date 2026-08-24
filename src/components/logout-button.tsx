"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 px-5 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-xl transition-colors disabled:opacity-50"
    >
      {pending ? "Memproses..." : "Ya, Keluar"}
    </button>
  );
}

export function LogoutButton({ logoutAction }: { logoutAction: () => Promise<void> | void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-slate-100 border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-all font-semibold px-5 shadow-sm"
      >
        Keluar
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              onClick={() => setIsOpen(false)}
              className="h-10 px-5 text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Batal
            </button>
            <form action={logoutAction} onSubmit={() => setIsOpen(false)}>
              <SubmitButton />
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
