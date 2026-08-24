"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Inbox, Clock, CalendarDays, Paperclip } from "lucide-react";
import { submitCoachingResponse } from "@/app/(dashboard)/profile/actions";
import { cn } from "@/lib/utils";

interface ActionItemType {
  id: string;
  text: string;
  dueDate: Date | null;
  followUpNotes: string | null;
  evidenceUrl: string | null;
  evidenceName: string | null;
}

interface CoachingLogType {
  id: string;
  date: Date;
  title: string;
  notes: string;
  actionItems: ActionItemType[];
  coach: { name: string | null; department: string | null };
  coachee: { name: string | null };
}

interface CoachingInboxCardProps {
  logs: CoachingLogType[];
  isAsistenDeputi?: boolean;
  className?: string;
}

export function CoachingInboxCard({ logs, isAsistenDeputi = false, className }: CoachingInboxCardProps) {
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (logId: string) => {
    if (!responseText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await submitCoachingResponse(logId, responseText);
      setOpenDialogId(null);
      setResponseText("");
    } catch (error) {
      console.error("Failed to submit response", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (logs.length === 0) {
    return null; // Don't render anything if there are no logs to review
  }

  return (
    <Card className={cn("border-red-500/30 dark:border-red-500/20 shadow-sm relative overflow-hidden bg-white/50 dark:bg-zinc-950/50", className)}>
      <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                {isAsistenDeputi ? "Menunggu Tanggapan Deputi" : "Menunggu Evaluasi Anda"}
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{logs.length}</span>
              </CardTitle>
              <CardDescription className="mt-1">
                {isAsistenDeputi 
                  ? "Sesi coaching berikut sedang menunggu tanggapan/evaluasi dari Deputi Direksi Wilayah."
                  : "Sesi coaching berikut telah selesai dilaksanakan dan menunggu tanggapan/evaluasi dari Anda."}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {logs.map((log) => (
            <div key={log.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{log.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">{log.coach.name}</span> (Coach) &rarr; <span className="font-semibold">{log.coachee.name}</span> (Coachee)
                </p>
              </div>
              
              <Dialog 
                open={openDialogId === log.id} 
                onOpenChange={(isOpen) => {
                  setOpenDialogId(isOpen ? log.id : null);
                  if (!isOpen) setResponseText("");
                }}
              >
                <DialogTrigger 
                  render={
                    <Button variant={isAsistenDeputi ? "outline" : "default"} className={isAsistenDeputi ? "" : "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 whitespace-nowrap"} />
                  }
                >
                  {isAsistenDeputi ? "Lihat Detail" : "Beri Tanggapan"}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] bg-white dark:bg-zinc-950">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Detail Sesi Coaching</DialogTitle>
                    <DialogDescription>
                      {isAsistenDeputi ? "Tinjau detail sesi coaching dan tindak lanjut dari coachee." : "Tinjau catatan coaching berikut dan berikan tanggapan atau evaluasi Anda."}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asisten Deputi (Coach)</p>
                          <p className="font-medium text-sm">{log.coach.name} <span className="text-slate-400 font-normal">({log.coach.department})</span></p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Coachee</p>
                          <p className="font-medium text-sm">{log.coachee.name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Topik / Judul</p>
                        <p className="font-medium text-sm">{log.title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Catatan Coach</p>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{log.notes}</p>
                      </div>
                      
                      {log.actionItems && log.actionItems.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Action Items (Tindak Lanjut)</p>
                          <div className="space-y-3">
                            {log.actionItems.map((item, idx) => (
                              <div key={item.id} className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-sm">
                                <div className="flex gap-2 mb-2">
                                  <span className="font-bold text-slate-400">{idx + 1}.</span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.text}</span>
                                </div>
                                {item.dueDate && (
                                  <div className="ml-5 flex items-center gap-1.5 text-xs font-medium text-[#015249] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded w-fit mb-3">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    Tenggat: {new Date(item.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </div>
                                )}
                                
                                {item.followUpNotes && (
                                  <div className="ml-5 mt-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs font-bold text-slate-500 mb-1">Catatan Coachee:</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{item.followUpNotes}</p>
                                    {item.evidenceUrl && (
                                      <div className="mt-3">
                                        <a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-[#015249] hover:text-blue-700 hover:underline bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1.5 rounded-md border border-blue-100 dark:border-blue-800 transition-colors">
                                          <Paperclip className="w-3.5 h-3.5" />
                                          {item.evidenceName || "Lihat Lampiran"}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!isAsistenDeputi && (
                      <div className="space-y-2 pt-2">
                        <label htmlFor="response" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Tanggapan / Evaluasi Anda
                        </label>
                        <Textarea 
                          id="response"
                          placeholder="Ketik tanggapan Anda di sini..." 
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="min-h-[120px] resize-none focus-visible:ring-rose-500"
                        />
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    {isAsistenDeputi ? (
                      <Button variant="outline" onClick={() => setOpenDialogId(null)}>
                        Tutup
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => setOpenDialogId(null)} disabled={isSubmitting}>
                          Batal
                        </Button>
                        <Button 
                          onClick={() => handleSubmit(log.id)} 
                          disabled={isSubmitting || !responseText.trim()}
                          className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                          {isSubmitting ? "Menyimpan..." : "Simpan Tanggapan"}
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
