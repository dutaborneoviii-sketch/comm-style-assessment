"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { addCoachingResponse } from "@/app/actions/coaching";
import { MessageSquarePlus, Edit3, Loader2 } from "lucide-react";

interface EditResponseDialogProps {
  logId: string;
  initialResponse: string | null;
  isDeputi: boolean;
  coacheeName?: string | null;
  topic?: string | null;
  notes?: string | null;
  actionItems?: string | null;
}

export function EditResponseDialog({ logId, initialResponse, isDeputi, coacheeName, topic, notes, actionItems }: EditResponseDialogProps) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState(initialResponse || "");
  const [isLoading, setIsLoading] = useState(false);

  if (!isDeputi) return null;

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await addCoachingResponse(logId, response, "");
      setOpen(false);
    } catch (error) {
      console.error("Failed to save response:", error);
      alert("Gagal menyimpan tanggapan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={<Button variant="outline" size="sm" className="mt-3 w-full bg-white dark:bg-zinc-900 border-blue-200 dark:border-blue-800 text-[#015249] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs shadow-sm font-semibold group/edit transition-all" />}
      >
          {initialResponse ? (
            <>
              <Edit3 className="w-3.5 h-3.5 mr-1.5 group-hover/edit:scale-110 transition-transform" />
              Edit Arahan/Tanggapan
            </>
          ) : (
            <>
              Beri Tanggapan
            </>
          )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[#015249] dark:text-blue-400">
            {initialResponse ? "Edit Tanggapan Deputi" : "Beri Tanggapan Deputi"}
          </DialogTitle>
          <DialogDescription>
            Berikan masukan, arahan, atau komentar atas sesi coaching ini.
          </DialogDescription>
        </DialogHeader>

        {(coacheeName || topic || notes) && (
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 mt-2 mb-2">
            {coacheeName && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Anggota Tim (Coachee)</p>
                <p className="font-medium text-sm">{coacheeName}</p>
              </div>
            )}
            {topic && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Topik / Judul</p>
                <p className="font-medium text-sm">{topic}</p>
              </div>
            )}
            {notes && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Catatan Coach</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{notes}</p>
              </div>
            )}
            {actionItems && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Action Items (Tindak Lanjut)</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{actionItems}</p>
              </div>
            )}
          </div>
        )}
        <div className="py-4">
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Ketik tanggapan Anda di sini..."
            className="min-h-[150px] resize-none focus-visible:ring-[#57BC90]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !response.trim()}
            className="bg-gradient-to-r from-[#015249] to-[#015249]/90 hover:from-[#015249] hover:to-[#57BC90] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Tanggapan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
