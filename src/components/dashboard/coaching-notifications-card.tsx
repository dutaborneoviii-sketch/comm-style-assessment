"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Clock, CalendarDays, MessageSquare } from "lucide-react";
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
  response: string | null;
  updatedAt: Date;
  coach: { name: string | null; department: string | null };
  coachee: { name: string | null };
  actionItems: ActionItemType[];
}

export function CoachingNotificationsCard({ logs, className }: { logs: CoachingLogType[]; className?: string }) {
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  if (logs.length === 0) {
    return null;
  }

  // Helper function to parse multiple responses (if any)
  function parseResponses(responseStr: string | null, fallbackDate: Date): { text: string; date: string }[] {
    if (!responseStr) return [];
    const dateStr = new Date(fallbackDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!responseStr.includes('@@@')) {
      return responseStr.split('\n\n').map(p => p.trim()).filter(p => p.length > 0).map(p => ({ text: p, date: dateStr }));
    }
    return responseStr.split('|||').map(part => {
      const [text, timestamp] = part.split('@@@');
      let partDateStr = dateStr;
      if (timestamp) {
        const d = new Date(Number(timestamp));
        if (!isNaN(d.getTime())) {
          partDateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }
      return { text: text || '', date: partDateStr };
    });
  }

  return (
    <Card className={cn("w-full border-blue-500/30 dark:border-blue-500/20 shadow-lg relative overflow-hidden bg-white dark:bg-zinc-950", className)}>
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
      
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/10 text-[#015249] dark:text-blue-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                Evaluasi Deputi Selesai
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{logs.length}</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Sesi coaching berikut telah mendapatkan tanggapan/evaluasi dari Deputi Direksi Wilayah.
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
                }}
              >
                <DialogTrigger 
                  render={
                    <Button variant="outline" className="border-blue-200 hover:bg-blue-50 hover:text-blue-700 text-[#015249] dark:border-blue-900 dark:hover:bg-blue-900/30 whitespace-nowrap" />
                  }
                >
                  Lihat Tanggapan
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] bg-white dark:bg-zinc-950">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2 text-[#015249] dark:text-blue-400">
                      <Bell className="w-5 h-5" />
                      Detail Tanggapan Deputi
                    </DialogTitle>
                    <DialogDescription>
                      Tinjau detail tanggapan yang diberikan oleh Deputi Direksi Wilayah.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sesi Coaching</p>
                        <p className="font-bold text-base text-slate-800 dark:text-slate-200">{log.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asisten Deputi (Coach)</p>
                          <p className="font-medium text-sm">{log.coach.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Coachee</p>
                          <p className="font-medium text-sm">{log.coachee.name}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Catatan Coach</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{log.notes}</p>
                      </div>
                    </div>

                    {/* Deputi responses block */}
                    {log.response && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 relative">
                        <div className="space-y-4 w-full">
                          {parseResponses(log.response, log.updatedAt).map((resp, idx) => (
                            <div key={idx} className="w-full">
                              {idx > 0 && (
                                <div className="border-t border-emerald-200/50 dark:border-emerald-900/40 my-3 w-full" />
                              )}
                              <div className="flex justify-between items-center mb-1 gap-4">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                                    Tanggapan Deputi
                                  </p>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/30">
                                  {resp.date}
                                </span>
                              </div>
                              <p className="whitespace-pre-line text-sm font-semibold text-emerald-900 dark:text-emerald-100 leading-relaxed">
                                {resp.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button className="bg-[#015249] hover:bg-blue-700 text-white" onClick={() => setOpenDialogId(null)}>
                      Tutup
                    </Button>
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
