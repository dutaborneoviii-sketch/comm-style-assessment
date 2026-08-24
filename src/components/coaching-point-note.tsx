'use client';
import { useState } from 'react';
import { addCoachingLog } from '@/app/actions/coaching';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, MessageSquarePlus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function CoachingPointNote({ coacheeId, pointTitle, logs = [], isReadOnly = false }: { coacheeId: string, pointTitle: string, logs?: any[], isReadOnly?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const searchParams = useSearchParams();
  const selectedSessionId = searchParams.get('session');

  const hasOpenSession = logs.some(log => !log.isClosed && !log.title.startsWith('Diskusi: '));

  const expectedTitle = `Diskusi: ${pointTitle.substring(0, 50)}${pointTitle.length > 50 ? '...' : ''}`;
  
  const pointLogs = logs.filter(log => {
    if (log.title !== expectedTitle) return false;
    
    if (selectedSessionId) {
       const selectedSession = logs.find(s => s.id === selectedSessionId);
       if (!selectedSession) return !log.isClosed;
       
       if (selectedSession.isClosed) {
         return log.isClosed && new Date(log.createdAt) >= new Date(selectedSession.createdAt) && new Date(log.createdAt) <= new Date(selectedSession.updatedAt);
       } else {
         return !log.isClosed;
       }
    } else {
       return !log.isClosed;
    }
  });

  const isViewingClosedSession = selectedSessionId ? (logs.find(s => s.id === selectedSessionId)?.isClosed ?? false) : false;

  async function handleSave() {
    if (!notes.trim()) return;
    setIsSubmitting(true);
    const res = await addCoachingLog({
      coacheeId,
      title: expectedTitle,
      date: new Date().toISOString().split('T')[0],
      notes: notes,
    });
    setIsSubmitting(false);
    if (res.success) {
      setNotes('');
      setIsOpen(false);
    } else {
      alert("Gagal menyimpan catatan");
    }
  }

  return (
    <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
      {pointLogs.length > 0 && (hasOpenSession || selectedSessionId) && (
        <div className="space-y-3 mb-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquarePlus className="w-3.5 h-3.5" /> Catatan Diskusi:
          </h4>
          <div className="grid gap-3">
            {pointLogs.map(log => (
              <div key={log.id} className="p-3.5 bg-slate-50/80 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/80 text-sm">
                 <div className="flex justify-between items-center mb-1.5 gap-4">
                   <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs bg-white dark:bg-black px-2 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-800">
                     {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                   </span>
                   <span className="text-xs font-medium text-slate-500 truncate">{log.coach?.name}</span>
                 </div>
                 <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{log.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!isReadOnly && !isViewingClosedSession) && (
        !isOpen ? (
          <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs font-semibold text-slate-500 hover:text-[#57BC90] border-dashed bg-white/50" onClick={() => setIsOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Tambah Catatan Baru
          </Button>
        ) : (
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm relative animate-in fade-in zoom-in-95 duration-200">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-[#57BC90]" />
            Catat Aktivitas Diskusi
          </h4>
          <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder={`Catat hasil diskusi mengenai "${pointTitle}"...`}
            className="min-h-[80px] text-sm resize-y bg-white dark:bg-black/50 focus-visible:ring-[#57BC90]"
          />
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button size="sm" className="h-8 text-xs bg-[#015249] hover:bg-[#57BC90] text-white" onClick={handleSave} disabled={isSubmitting || !notes.trim()}>
              {isSubmitting && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
              Simpan ke Log Coaching
            </Button>
          </div>
        </div>
        )
      )}
    </div>
  )
}
