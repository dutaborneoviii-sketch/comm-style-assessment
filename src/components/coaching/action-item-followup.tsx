'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit2, Paperclip } from 'lucide-react';
import { updateActionItemFollowUp } from '@/app/actions/coaching';
import { EvidenceDialog } from '@/components/coaching/evidence-dialog';

type ActionItemProps = {
  item: {
    id: string;
    text: string;
    dueDate?: Date | string | null;
    followUpNotes?: string | null;
    evidenceUrl?: string | null;
    evidenceName?: string | null;
  };
  coacheeId: string;
  isCoachee: boolean;
  isClosed?: boolean;
};

export function ActionItemFollowUp({ item, coacheeId, isCoachee, isClosed = false }: ActionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const hasFollowedUp = !!(item.followUpNotes || item.evidenceUrl);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('actionItemId', item.id);
    formData.append('coacheeId', coacheeId);

    const res = await updateActionItemFollowUp(formData);

    if (res.success) {
      setIsEditing(false);
      setSelectedFile(null);
    } else {
      alert('Gagal menyimpan tindak lanjut: ' + res.error);
    }

    setIsSubmitting(false);
  }

  return (
    <div className="space-y-3 mt-2">
      {/* If already submitted and not currently editing */}
      {hasFollowedUp && !isEditing && (
        <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl space-y-2.5">
          {item.evidenceUrl && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Bukti dilampirkan:</span>
                <EvidenceDialog url={item.evidenceUrl} name={item.evidenceName || 'Lampiran'} />
              </div>
            </div>
          )}

          {item.followUpNotes && (
            <div className="text-xs text-slate-700 dark:text-slate-300 pl-3 border-l-2 border-emerald-400">
              <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Catatan Coachee:</span>
              <p className="whitespace-pre-wrap leading-relaxed">{item.followUpNotes}</p>
            </div>
          )}

          {/* Edit / Upload Ulang Button for Coachee */}
          {isCoachee && !isClosed && (
            <div className="pt-1 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/50 font-bold gap-1.5"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit / Upload Ulang Eviden
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Button to open form if coachee hasn't filled follow up yet */}
      {isCoachee && !hasFollowedUp && !isEditing && !isClosed && (
        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs border-dashed border-[#57BC90] text-[#015249] hover:bg-[#57BC90]/10 dark:text-[#57BC90] font-bold gap-1.5"
            onClick={() => setIsEditing(true)}
          >
            <Plus className="w-3.5 h-3.5 text-[#57BC90]" />
            Isi Catatan Tindak Lanjut & Eviden
          </Button>
        </div>
      )}

      {/* Inline Form for creating or editing follow-up */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Catatan Tindak Lanjut Coachee <span className="text-red-500">*</span>
            </Label>
            <Textarea
              name="followUpNotes"
              required
              defaultValue={item.followUpNotes || ''}
              placeholder="Jelaskan progres dan hasil pelaksanaan tindak lanjut Anda..."
              className="h-24 resize-none text-xs bg-white dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Lampiran Evidence / Bukti {item.evidenceUrl ? '(Pilih file baru jika ingin mengunggah ulang)' : '(Opsional)'}
            </Label>
            <Input
              type="file"
              name="evidenceFile"
              accept="*/*"
              className="text-xs file:h-full file:bg-slate-100 file:text-slate-700 file:border-0 file:mr-2 file:px-3 file:py-1 hover:file:bg-slate-200 bg-white dark:bg-zinc-950"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {item.evidenceName && !selectedFile && (
              <p className="text-[11px] text-emerald-600 font-medium">File saat ini: {item.evidenceName}</p>
            )}
            <p className="text-[10px] text-muted-foreground">Format: Semua jenis file (PDF, Gambar, Excel, Word, Zip). Maksimal 1MB.</p>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={() => { setIsEditing(false); setSelectedFile(null); }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs font-bold bg-[#015249] hover:bg-[#015249]/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              {hasFollowedUp ? 'Simpan Perubahan' : 'Simpan Tindak Lanjut'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
