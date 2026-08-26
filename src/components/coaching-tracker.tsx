'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Plus, Trash2, Loader2, StickyNote, Edit2, MessageCircle, Target, MessageSquare, Paperclip, CalendarDays, CheckCircle, X, Info, ChevronDown, ChevronUp, Clock, History, Pencil, Mail, FileCheck } from 'lucide-react';
import { addCoachingLog, deleteCoachingLog, updateCoachingLog, addCoachingResponse, updateActionItemFollowUp, closeCoachingLog, updateNextSessionDate } from '@/app/actions/coaching';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { IGrowSessionWizard } from '@/components/coaching/igrow-wizard';

type ActionItem = {
  id?: string;
  text: string;
  dueDate: Date | string | null;
  followUpNotes?: string | null;
  evidenceUrl?: string | null;
  evidenceName?: string | null;
};

type CoachingLog = {
  id: string;
  date: Date;
  title: string;
  notes: string;
  nextSessionDate?: Date | string | null;
  actionItems: ActionItem[];
  response: string | null;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
  coach?: { 
    name: string | null;
    npp?: string | null;
    position?: string | null;
    department?: string | null;
  } | null;
};

interface ParsedResponse {
  text: string;
  date: string;
}

function parseResponses(responseStr: string | null, fallbackDate: Date): ParsedResponse[] {
  if (!responseStr) return [];
  
  const dateStr = new Date(fallbackDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  if (responseStr.includes('@@@')) {
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
  
  return responseStr
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => ({
      text: p,
      date: dateStr
    }));
}

export default function CoachingTracker({ 
  logs, 
  discussionLogs = [],
  coacheeId,
  coacheeName,
  coacheeStyle = '',
  isReadOnly = false,
  isDeputi = false,
  isCoachee = false,
  hideNewSessionButton = false,
  hasAssessment = true
}: { 
  logs: CoachingLog[]; 
  discussionLogs?: any[];
  coacheeId: string;
  coacheeName?: string | null;
  coacheeStyle?: string;
  isReadOnly?: boolean;
  isDeputi?: boolean;
  isCoachee?: boolean;
  hideNewSessionButton?: boolean;
  hasAssessment?: boolean;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState<string | null>(null);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState<string | null>(null);
  const [closeNextSessionDate, setCloseNextSessionDate] = useState('');
  const [editingNextDate, setEditingNextDate] = useState<Record<string, string>>({});
  const [savingNextDateId, setSavingNextDateId] = useState<string | null>(null);
  const [savedNextDateId, setSavedNextDateId] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<CoachingLog | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  
  // Follow Up state for coachee
  const [followingUpOn, setFollowingUpOn] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewEvidence, setPreviewEvidence] = useState<{url: string, name: string} | null>(null);
  
  const [isCreatingContinued, setIsCreatingContinued] = useState<string | null>(null);

  async function handleSaveNextSessionDate(logId: string, currentLogNextDate?: Date | string | null, targetCoacheeId?: string) {
    const defaultDateStr = currentLogNextDate ? new Date(currentLogNextDate).toISOString().split('T')[0] : '';
    const dateVal = editingNextDate[logId] !== undefined ? editingNextDate[logId] : defaultDateStr;

    setSavingNextDateId(logId);
    const res = await updateNextSessionDate(logId, targetCoacheeId || coacheeId, dateVal || null);
    if (!res.success) {
      alert('Gagal menyimpan jadwal sesi selanjutnya: ' + res.error);
    } else {
      setSavedNextDateId(logId);
      alert('Jadwal sesi coaching selanjutnya berhasil disimpan!');
      setTimeout(() => {
        setSavedNextDateId(null);
      }, 4000);
    }
    setSavingNextDateId(null);
  }
  
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggleExpand(id: string) {
    const isNowExpanded = !expandedLogs[id];
    setExpandedLogs(prev => ({ ...prev, [id]: isNowExpanded }));
    
    // Update URL so the left panel can show the discussion notes for this session
    const params = new URLSearchParams(searchParams.toString());
    if (isNowExpanded) {
      params.set('session', id);
    } else {
      if (params.get('session') === id) {
        params.delete('session');
      }
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Action Items
  const [draftActionItems, setDraftActionItems] = useState<ActionItem[]>([]);

  function startCreating() {
    setIsCreating(true);
    setIsCreatingContinued(null);
    setDraftActionItems([{ text: '', dueDate: '' }]);
  }

  function startCreatingContinued() {
    if (logs.length > 0) {
      setIsCreatingContinued(logs[0].id);
      setIsCreating(true);
      setDraftActionItems([{ text: '', dueDate: '' }]);
    }
  }

  function startEditing(log: CoachingLog) {
    setEditingLog(log);
    setIsCreatingContinued(null);
    setDraftActionItems(
      log.actionItems.length > 0 
        ? log.actionItems.map(item => ({
            id: item.id,
            text: item.text,
            dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ''
          })) 
        : [{ text: '', dueDate: '' }]
    );
  }

  function handleAddActionItem() {
    setDraftActionItems([...draftActionItems, { text: '', dueDate: '' }]);
  }

  function handleRemoveActionItem(index: number) {
    setDraftActionItems(draftActionItems.filter((_, i) => i !== index));
  }

  function handleActionItemChange(index: number, field: keyof ActionItem, value: string) {
    const newItems = [...draftActionItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setDraftActionItems(newItems);
  }

  async function onWizardSubmit(data: { date: string; title: string; notes: string; nextSessionDate?: string; isDraft?: boolean; actionItems: {text: string, dueDate: string}[] }) {
    setIsSubmitting(true);
    
    const formattedData = {
      coacheeId,
      date: data.date,
      title: data.title,
      notes: data.notes,
      isDraft: data.isDraft || false,
      nextSessionDate: data.nextSessionDate || null,
      actionItems: data.actionItems,
    };

    let result;
    if (editingLog) {
      result = await updateCoachingLog(editingLog.id, formattedData);
    } else {
      result = await addCoachingLog(formattedData);
    }
    
    if (result.success) {
      if (data.isDraft) {
        setEditingLog(result.log);
        alert('Draft berhasil disimpan!');
      } else {
        setIsCreating(false);
        setIsCreatingContinued(null);
        setEditingLog(null);
      }
    } else {
      alert('Gagal menyimpan log: ' + result.error);
    }
    
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus log sesi ini?')) return;
    
    setIsDeleting(id);
    const result = await deleteCoachingLog(id, coacheeId);
    
    if (!result.success) {
      alert('Gagal menghapus log: ' + result.error);
    }
    setIsDeleting(null);
  }

  async function confirmCloseSession() {
    if (!showCloseConfirmDialog) return;
    const id = showCloseConfirmDialog;
    setIsClosing(id);
    const targetLog = logs.find(l => l.id === id);
    const targetCoacheeId = (targetLog as any)?.coacheeId || coacheeId;
    setShowCloseConfirmDialog(null);
    const result = await closeCoachingLog(id, targetCoacheeId, closeNextSessionDate || null);
    if (!result.success) {
      alert('Gagal menutup sesi: ' + result.error);
    }
    setCloseNextSessionDate('');
    setIsClosing(null);
  }

  async function handleResponseSubmit(e: React.FormEvent<HTMLFormElement>, logId: string, targetCoacheeId?: string) {
    e.preventDefault();
    setRespondingTo(logId);
    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const responseText = formData.get('response') as string;
    
    if (!responseText.trim()) {
      setIsSubmitting(false);
      setRespondingTo(null);
      return;
    }
    
    const result = await addCoachingResponse(logId, responseText, targetCoacheeId || coacheeId);
    if (result.success) {
      setRespondingTo(null);
      form.reset();
    } else {
      alert('Gagal menyimpan tanggapan: ' + result.error);
    }
    setIsSubmitting(false);
  }

  async function handleFollowUpSubmit(e: React.FormEvent<HTMLFormElement>, actionItemId: string) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append('actionItemId', actionItemId);
    formData.append('coacheeId', coacheeId);
    
    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024) {
        alert('Gagal: Ukuran file melebihi batas 1MB.');
        setIsSubmitting(false);
        return;
      }
      formData.append('evidenceFile', selectedFile);
    }

    const result = await updateActionItemFollowUp(formData);
    if (result.success) {
      setFollowingUpOn(null);
      setSelectedFile(null);
    } else {
      alert('Gagal menyimpan tindak lanjut: ' + result.error);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="w-full h-full">
      <Card className="shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 flex flex-col h-fit max-h-[1000px]">
        {(!isCreating && !editingLog) && (
          <CardHeader className="pb-4 shrink-0">
            <div className="flex items-center justify-end mb-2">
              {(!isCreating && !editingLog && !isReadOnly && !hideNewSessionButton) && (
                logs.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-md px-3 text-xs font-medium bg-[#015249] hover:bg-[#57BC90] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={!hasAssessment || logs.some(log => !log.isClosed)}
                        title={!hasAssessment ? "Anggota belum mengisi asesmen" : logs.some(log => !log.isClosed) ? "Tutup sesi sebelumnya untuk membuat sesi baru" : "Mulai sesi coaching"}
                      >
                        <Plus className="w-4 h-4" />
                        Sesi Baru
                        <ChevronDown className="w-4 h-4 opacity-70" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 p-2">
                      <DropdownMenuItem onClick={startCreating} className="flex flex-col items-start gap-1 p-3 cursor-pointer group">
                        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#015249] dark:group-hover:text-[#57BC90]">
                          <Plus className="w-4 h-4" /> Mulai Sesi Baru
                        </div>
                        <span className="text-xs text-slate-500 pl-6">Buat sesi coaching baru dari awal (kosong).</span>
                      </DropdownMenuItem>
                      {logs.length > 0 && logs[0].nextSessionDate && (
                        <DropdownMenuItem onClick={startCreatingContinued} className="flex flex-col items-start gap-1 p-3 cursor-pointer group">
                          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#015249] dark:group-hover:text-[#57BC90]">
                            <History className="w-4 h-4" /> Sesi Lanjutan
                          </div>
                          <span className="text-xs text-slate-500 pl-6">Lanjutkan topik/pembahasan dari sesi coaching sebelumnya.</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    size="sm" 
                    className="bg-[#015249] hover:bg-[#57BC90] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={startCreating}
                    disabled={!hasAssessment || logs.some(log => !log.isClosed)}
                    title={!hasAssessment ? "Anggota belum mengisi asesmen" : logs.some(log => !log.isClosed) ? "Tutup sesi sebelumnya untuk membuat sesi baru" : "Buat sesi baru"}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Sesi Baru
                  </Button>
                )
              )}
            </div>
          </CardHeader>
        )}

        <CardContent className={`flex-1 overflow-y-auto overflow-x-hidden space-y-4 pb-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 ${
          (isCreating || editingLog) ? 'pt-4' : ''
        }`}>
          {(isCreating || editingLog) ? (
            <div className="flex flex-col gap-6">
              {isCreatingContinued && (
                <div className="border border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl shadow-sm relative mb-4">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-xl flex items-center gap-1.5 shadow-sm">
                    <History className="w-3.5 h-3.5" /> Referensi Sesi Sebelumnya
                  </div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-4 text-lg pr-48">Topik: {logs.find(l => l.id === isCreatingContinued)?.title}</h4>
                  
                  {(() => {
                    const prevLog = logs.find(l => l.id === isCreatingContinued);
                    if (!prevLog) return null;
                    const notesStr = prevLog.notes || '';
                    const hasIGrowFormat = ['**Goal**', '**Reality**', '**Options**', '**Will**'].some(k => notesStr.includes(k));
                    const hasPembahasanFormat = notesStr.includes('**Pembahasan 1**');
                    
                    const renderNotes = () => {
                      if (hasPembahasanFormat) {
                        const parts = notesStr.split(/(?=\*\*Pembahasan \d+\*\*)/).filter(Boolean);
                        return (
                          <div className="flex flex-col gap-4 w-full bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                            {parts.map((part, idx) => {
                              const match = part.match(/\*\*(Pembahasan \d+)\*\*\n([\s\S]*)/);
                              if (match) {
                                return (
                                  <div key={idx} className="p-4 rounded-r-xl border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-400 bg-blue-50/50 dark:bg-blue-900/10">
                                    <h6 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">{match[1]}</h6>
                                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{match[2].trim()}</p>
                                  </div>
                                );
                              }
                              return <p key={idx} className="text-sm text-slate-600 whitespace-pre-wrap">{part}</p>;
                            })}
                          </div>
                        );
                      }

                      if (!hasIGrowFormat) {
                        return <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">{notesStr}</p>;
                      }

                      const sections = [
                        { key: 'Goal', title: 'G - GOAL', style: 'border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-900/10' },
                        { key: 'Reality', title: 'R - REALITY', style: 'border-l-4 border-l-blue-400 bg-blue-50/50 dark:bg-blue-900/10' },
                        { key: 'Options', title: 'O - OPTIONS', style: 'border-l-4 border-l-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' },
                        { key: 'Will', title: 'W - WILL', style: 'border-l-4 border-l-purple-400 bg-purple-50/50 dark:bg-purple-900/10' },
                      ];

                      const parsedSections: Record<string, string> = {};
                      sections.forEach(section => {
                        const regex = new RegExp(`\\*\\*${section.key}\\*\\*\\s*([\\s\\S]*?)(?=(?:\\*\\*Goal\\*\\*|\\*\\*Reality\\*\\*|\\*\\*Options\\*\\*|\\*\\*Will\\*\\*|$))`, 'i');
                        const match = notesStr.match(regex);
                        parsedSections[section.key] = match ? match[1].trim() : '';
                      });

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                          <div className="flex flex-col gap-4">
                            {sections.slice(0,2).map(section => parsedSections[section.key] ? (
                              <div key={section.key} className={`p-4 rounded-r-xl border border-slate-100 dark:border-slate-800 shadow-sm ${section.style}`}>
                                <h6 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">{section.title}</h6>
                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{parsedSections[section.key]}</p>
                              </div>
                            ) : null)}
                          </div>
                          <div className="flex flex-col gap-4">
                            {sections.slice(2,4).map(section => parsedSections[section.key] ? (
                              <div key={section.key} className={`p-4 rounded-r-xl border border-slate-100 dark:border-slate-800 shadow-sm ${section.style}`}>
                                <h6 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">{section.title}</h6>
                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{parsedSections[section.key]}</p>
                              </div>
                            ) : null)}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div className="flex flex-col gap-4">
                        {renderNotes()}

                        {/* Coachee Actions */}
                        {isCoachee && !log.isClosed && !log.isDraft && log.actionItems.length > 0 && (
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEvidenUploadFor(log.id)}
                            className="text-xs justify-start border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-zinc-900 h-8 text-[#015249] dark:text-[#57BC90]"
                          >
                            <FileCheck className="w-3.5 h-3.5 mr-2" />
                            Update Eviden/Tindak Lanjut
                          </Button>
                        )}

                        {/* Action Items from Prev Log */}
                        {prevLog.actionItems && prevLog.actionItems.length > 0 && (
                          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/30 relative">
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                              <Target className="w-4 h-4 text-[#015249] dark:text-blue-400" />
                              <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Action Items Plan</p>
                            </div>
                            
                            <div className="flex flex-col gap-3 relative z-10">
                              {prevLog.actionItems.map((item, index) => (
                                <div key={item.id || index} className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-blue-100 dark:border-blue-900/50 shadow-sm flex flex-col gap-2">
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-snug">{item.text}</span>
                                    </div>
                                    {item.dueDate && (
                                      <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#015249] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/50">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        <span className="opacity-75 font-semibold">Due Date:</span>
                                        {new Date(item.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </div>
                                    )}
                                  </div>

                                  {item.followUpNotes && (
                                    <div className="mt-1 ml-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                                      <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                          <Edit2 className="w-3.5 h-3.5 text-[#57BC90]" /> Catatan Tindak Lanjut{coacheeName ? ` (${coacheeName})` : ''}:
                                        </p>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-2">{item.followUpNotes}</p>
                                      
                                      {item.evidenceUrl && (
                                        <button 
                                          onClick={(e) => { e.preventDefault(); setPreviewEvidence({ url: item.evidenceUrl!, name: item.evidenceName || 'Lampiran' }); }}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold rounded-md border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                        >
                                          <Paperclip className="w-3.5 h-3.5" /> 
                                          <span className="truncate max-w-[200px]">{item.evidenceName}</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Responses from Prev Log */}
                        {prevLog.response && (
                          <div className="px-2 space-y-3 mt-4">
                            <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-500" /> Tanggapan Coach
                            </h5>
                            <div className="flex flex-col gap-3">
                              {prevLog.response.split('|||').map((respString, idx) => {
                                const [text, timestamp] = respString.split('@@@');
                                return (
                                  <div key={idx} className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 relative">
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
                                    {timestamp && (
                                      <p className="text-[10px] text-slate-400 mt-2 text-right">
                                        {new Date(parseInt(timestamp)).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })()}
                </div>
              )}
              
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 pb-2 px-1">
                <h4 className="text-lg font-black text-[#015249] dark:text-[#57BC90] mb-2">{isCreatingContinued ? 'Isian Topik Pengembangan / Pembahasan Lanjutan' : (editingLog ? 'Edit Sesi Coaching' : 'Buat Sesi Coaching Baru')}</h4>
              </div>

              <IGrowSessionWizard 
                coacheeStyle={coacheeStyle || ''}
                onCancel={() => { setIsCreating(false); setIsCreatingContinued(null); setEditingLog(null); }}
                onSubmit={onWizardSubmit}
                isSubmitting={isSubmitting}
                defaultDate={editingLog ? new Date(editingLog.date).toISOString().split('T')[0] : undefined}
                defaultTitle={isCreatingContinued ? `Lanjutan: ${logs.find(l => l.id === isCreatingContinued)?.title || ''}` : (editingLog?.title || '')}
                defaultNotes={isCreatingContinued ? (logs.find(l => l.id === isCreatingContinued)?.notes || '') : (editingLog?.notes || '')}
                defaultNextSessionDate={editingLog?.nextSessionDate ? new Date(editingLog.nextSessionDate).toISOString().split('T')[0] : undefined}
                defaultActionItems={editingLog?.actionItems.map(item => ({
                  id: item.id,
                  text: item.text,
                  dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ''
                }))}
                isContinuedSession={!!isCreatingContinued || (editingLog?.notes || '').includes('**Pembahasan 1**')}
              />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3 text-slate-400">
                <StickyNote className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {(!isReadOnly && !isCoachee) ? "Tidak ada sesi coaching yang masih terbuka" : "Belum ada riwayat sesi"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {(!isReadOnly && !isCoachee) ? "Semua sesi telah ditutup atau belum ada sesi baru yang dibuat." : "Sesi coaching yang dicatat akan muncul di sini."}
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogs[log.id] ?? false;
              const hasCoacheeSubmittedActionItems = log.actionItems.length > 0 && log.actionItems.some(
                item => (item.followUpNotes && item.followUpNotes.trim().length > 0) || !!item.evidenceUrl
              );

              return (
              <div key={log.id} className={`group p-5 md:p-6 rounded-2xl border bg-white dark:bg-zinc-950/80 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col gap-4 ${log.isClosed ? 'border-green-500/50 hover:shadow-green-500/10' : 'border-[#015249]/30 hover:shadow-teal-500/10'}`}>
                
                {/* Decorative side accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 opacity-70 group-hover:opacity-100 transition-opacity ${log.isClosed ? 'bg-green-500' : 'bg-[#015249]'}`}></div>
                
                {/* Header: Coachee Name, Session Title, Status Badges, Date */}
                <div className="flex items-start gap-3.5 relative z-0 w-full">
                  {/* Icon */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-[#015249] dark:text-blue-400 shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm group-hover:bg-[#57BC90]/10 group-hover:text-[#57BC90] group-hover:border-[#57BC90]/20 transition-colors mt-0.5">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  
                  {/* Content Container (Title + Badges) */}
                  <div className="flex flex-col gap-2.5 min-w-0 w-full">
                    <div className="space-y-1 w-full">
                      {/* Nama Anggota / Coachee */}
                      {(log as any).coachee?.name && (
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-xs font-black uppercase tracking-wider text-[#015249] dark:text-[#57BC90] bg-[#57BC90]/10 px-2.5 py-0.5 rounded-md border border-[#57BC90]/20">
                            👤 Coachee: {(log as any).coachee.name}
                          </span>
                          {((log as any).coachee.position || (log as any).coachee.department) && (
                            <span className="text-xs text-muted-foreground italic truncate">
                              ({[(log as any).coachee.position, (log as any).coachee.department].filter(Boolean).join(" - ")})
                            </span>
                          )}
                        </div>
                      )}
                      
                      <h4 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white leading-snug tracking-tight truncate flex items-center gap-2">
                        {log.title}
                        {log.isDraft && <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-amber-200 dark:border-amber-800 self-center">DRAFT</span>}
                      </h4>

                      {isExpanded && log.coach?.name && (
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 flex-wrap mt-1 truncate">
                          <span>Coach: <span className="text-foreground font-semibold">{log.coach.name}</span></span>
                        </p>
                      )}
                    </div>

                    {/* Badges: Status Isian Eviden Coachee + Sesi Selanjutnya + Tanggal Pelaksanaan */}
                    <div className="flex flex-wrap items-center gap-2 w-full">
                      {/* Tanggal Sesi Ini */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-[#57BC90]" />
                        <span>{new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>

                      {/* Status Isian Tindak Lanjut / Eviden Coachee */}
                      {!log.isDraft && (
                        hasCoacheeSubmittedActionItems ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 rounded-full border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 whitespace-nowrap shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Sudah Mengisi Eviden</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 rounded-full border border-amber-200 dark:border-amber-800 text-xs font-extrabold text-amber-700 dark:text-amber-400 whitespace-nowrap shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Belum Mengisi Eviden</span>
                          </div>
                        )
                      )}

                      {/* Tanggal Sesi Coaching Selanjutnya */}
                      {!log.isDraft && log.nextSessionDate && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 rounded-full border border-blue-200 dark:border-blue-800 text-xs font-extrabold text-blue-700 dark:text-blue-400 whitespace-nowrap shadow-sm">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                          <span>Sesi Selanjutnya: {new Date(log.nextSessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Edit/Delete Actions */}
                  {!isReadOnly && !log.isClosed && (
                    <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0 ml-auto opacity-50 hover:opacity-100 transition-opacity">
                      <Button 
                        variant={log.isDraft ? "default" : "ghost"}
                        size="sm"
                        className={log.isDraft 
                          ? "h-8 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-full px-3 shadow-sm" 
                          : "h-8 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-full px-3"
                        }
                        onClick={() => startEditing(log)}
                        disabled={isDeleting === log.id}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                        {log.isDraft ? "Lanjutkan Edit" : "Edit"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full px-3"
                        onClick={() => handleDelete(log.id)}
                        disabled={isDeleting === log.id}
                      >
                        {isDeleting === log.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                        Hapus
                      </Button>
                    </div>
                  )}
                </div>

                {/* Footer Bar: Session Status & Toggle Detail Button */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/50 relative z-10 mt-2">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      {log.isClosed ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-4 h-4" /> Sesi Selesai / Ditutup
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Clock className="w-4 h-4" /> Sesi Coaching Berjalan
                        </span>
                      )}
                    </span>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toggleExpand(log.id)} 
                    className="text-xs font-extrabold text-[#015249] hover:bg-[#015249]/10 border-[#015249]/30 h-8 px-3 rounded-lg flex items-center gap-1.5 shrink-0"
                  >
                    <span>{isExpanded ? 'Sembunyikan Detail' : 'Lihat Detail & Review'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
                
                {isExpanded && (
                  <>
                    <div className="pl-3 mt-3 w-full">
                      {(() => {
                        const notesStr = log.notes || '';
                        const hasIGrowFormat = ['**Goal**', '**Reality**', '**Options**', '**Will**'].some(k => notesStr.includes(k));
                        const hasPembahasanFormat = notesStr.includes('**Pembahasan 1**');
                        
                        if (hasPembahasanFormat) {
                          const parts = notesStr.split(/(?=\*\*Pembahasan \d+\*\*)/).filter(Boolean);
                          return (
                            <div className="flex flex-col gap-4 w-full">
                              {parts.map((part, idx) => {
                                const match = part.match(/\*\*(Pembahasan \d+)\*\*\n([\s\S]*)/);
                                if (match) {
                                  return (
                                    <div key={idx} className="p-4 rounded-r-xl border border-slate-100 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-400 bg-blue-50/50 dark:bg-blue-900/10">
                                      <h6 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">{match[1]}</h6>
                                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{match[2].trim()}</p>
                                    </div>
                                  );
                                }
                                return <p key={idx} className="text-sm text-slate-600 whitespace-pre-wrap">{part}</p>;
                              })}
                            </div>
                          );
                        }

                        if (!hasIGrowFormat) {
                          return <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{notesStr}</p>;
                        }

                        const sections = [
                          { key: 'Goal', title: 'G - GOAL', style: 'border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-900/10' },
                          { key: 'Reality', title: 'R - REALITY', style: 'border-l-4 border-l-blue-400 bg-blue-50/50 dark:bg-blue-900/10' },
                          { key: 'Options', title: 'O - OPTIONS', style: 'border-l-4 border-l-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' },
                          { key: 'Will', title: 'W - WILL', style: 'border-l-4 border-l-purple-400 bg-purple-50/50 dark:bg-purple-900/10' },
                        ];

                        const parsedSections: Record<string, string> = {};
                        sections.forEach(section => {
                          const regex = new RegExp(`\\*\\*${section.key}\\*\\*\\s*([\\s\\S]*?)(?=(?:\\*\\*Goal\\*\\*|\\*\\*Reality\\*\\*|\\*\\*Options\\*\\*|\\*\\*Will\\*\\*|$))`, 'i');
                          const match = notesStr.match(regex);
                          parsedSections[section.key] = match ? match[1].trim() : '';
                        });

                        const renderSectionCard = (key: string) => {
                          const section = sections.find(s => s.key === key)!;
                          const content = parsedSections[key];
                          if (!content) return null;
                          return (
                            <div key={section.key} className={`p-4 rounded-r-xl border border-slate-100 dark:border-slate-800 shadow-sm ${section.style}`}>
                              <h6 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-2">{section.title}</h6>
                              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{content}</p>
                            </div>
                          );
                        };

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col gap-4">
                              {renderSectionCard('Goal')}
                              {renderSectionCard('Reality')}
                            </div>
                            <div className="flex flex-col gap-4">
                              {renderSectionCard('Options')}
                              {renderSectionCard('Will')}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                
                {log.actionItems && log.actionItems.length > 0 && (
                  <div className="mt-2 ml-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/30 relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl -translate-y-12 translate-x-12 pointer-events-none"></div>
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                      <Target className="w-4 h-4 text-[#015249] dark:text-blue-400" />
                      <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Action Items Plan</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 relative z-10">
                      {log.actionItems.map((item, index) => (
                        <div key={item.id || index} className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-blue-100 dark:border-blue-900/50 shadow-sm flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-snug">{item.text}</span>
                            </div>
                            {item.dueDate && (
                              <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#015249] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/50">
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span className="opacity-75 font-semibold">Due Date:</span>
                                {new Date(item.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            )}
                          </div>

                          {/* Completed Follow up */}
                          {item.followUpNotes && followingUpOn !== item.id && (
                            <div className="mt-1 ml-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                  <Edit2 className="w-3.5 h-3.5 text-[#57BC90]" /> Catatan Tindak Lanjut{coacheeName ? ` (${coacheeName})` : ''}:
                                </p>
                                {isCoachee && !log.isClosed && (
                                  <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50" onClick={() => setFollowingUpOn(item.id!)}>
                                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                                  </Button>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-2">{item.followUpNotes}</p>
                              
                              {item.evidenceUrl && (
                                <button 
                                  onClick={(e) => { e.preventDefault(); setPreviewEvidence({ url: item.evidenceUrl!, name: item.evidenceName || 'Lampiran' }); }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold rounded-md border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                  <Paperclip className="w-3.5 h-3.5" /> 
                                  <span className="truncate max-w-[200px]">{item.evidenceName}</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Action button for coachee */}
                          {isCoachee && !item.followUpNotes && followingUpOn !== item.id && item.id && !log.isClosed && (
                            <div className="ml-6 mt-1">
                              <Button variant="outline" size="sm" className="h-7 text-xs border-dashed text-slate-500 hover:text-[#57BC90] hover:border-[#57BC90] hover:bg-[#57BC90]/5" onClick={() => setFollowingUpOn(item.id!)}>
                                <Plus className="w-3 h-3 mr-1" /> Tindak Lanjut
                              </Button>
                            </div>
                          )}

                          {/* Follow up form */}
                          {followingUpOn === item.id && item.id && (
                            <form onSubmit={(e) => handleFollowUpSubmit(e, item.id!)} className="mt-2 ml-6 p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Catatan Tindak Lanjut</Label>
                                <Textarea 
                                  name="followUpNotes" 
                                  required 
                                  defaultValue={item.followUpNotes || ''}
                                  placeholder="Apa hasil tindak lanjut Anda?"
                                  className="h-20 resize-none text-xs"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  Lampiran Evidence (Opsional) {item.evidenceName && <span className="text-blue-500 ml-2 italic">Telah diupload: {item.evidenceName}</span>}
                                </Label>
                                <Input 
                                  type="file" 
                                  name="evidenceFile" 
                                  accept="*/*"
                                  className="text-xs file:h-full file:bg-slate-100 file:text-slate-700 file:border-0 file:mr-2 file:px-3 file:py-1 hover:file:bg-slate-200"
                                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                />
                                <p className="text-[10px] text-muted-foreground">Maks. 1MB. Format: All file. {item.evidenceUrl && 'Upload file baru untuk menggantikan file lama.'}</p>
                              </div>
                              <div className="flex gap-2 justify-end pt-2">
                                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setFollowingUpOn(null); setSelectedFile(null); }} disabled={isSubmitting}>Batal</Button>
                                <Button type="submit" size="sm" className="h-7 text-xs bg-[#57BC90] hover:bg-[#57BC90] text-white" disabled={isSubmitting}>
                                  {isSubmitting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />} Simpan
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {log.response && (
                  <div className="mt-4 px-5 space-y-3">
                    <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" /> Tanggapan Coach
                    </h5>
                    <div className="flex flex-col gap-3">
                      {log.response.split('|||').map((respString, idx) => {
                        const [text, timestamp] = respString.split('@@@');
                        return (
                          <div key={idx} className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 relative">
                            <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
                            {timestamp && (
                              <p className="text-[10px] text-slate-400 mt-2 text-right">
                                {new Date(parseInt(timestamp)).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Section: Next Session, Feedback, Close Session */}
                {!isReadOnly && !isCoachee && !log.isClosed && !log.isDraft && (() => {
                  const hasCoacheeFollowedUp = log.actionItems.length === 0 || log.actionItems.some(
                    item => (item.followUpNotes && item.followUpNotes.trim().length > 0) || !!item.evidenceUrl
                  );
                  return (
                    <div className="px-5 pb-5 pt-4 flex flex-col gap-4 relative z-10 border-t border-slate-100 dark:border-slate-800/50 mt-2">
                      {/* Schedule Next Session Date Input & Button */}
                      <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex-1 space-y-1.5">
                          <Label htmlFor={`next-date-${log.id}`} className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4 text-[#015249] dark:text-[#57BC90]" />
                            Jadwal Sesi Coaching Selanjutnya (Tanggal Pelaksanaan)
                          </Label>
                          <Input 
                            id={`next-date-${log.id}`}
                            type="date"
                            value={editingNextDate[log.id] ?? (log.nextSessionDate ? new Date(log.nextSessionDate).toISOString().split('T')[0] : '')}
                            onChange={(e) => setEditingNextDate(prev => ({ ...prev, [log.id]: e.target.value }))}
                            className="h-9 text-xs font-medium bg-white dark:bg-zinc-950"
                          />
                        </div>
                        <div className="flex flex-col gap-2 relative z-20">
                          {!isReadOnly && !isCoachee && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setEditingLog(log)}
                              className="text-xs justify-start border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-zinc-900 h-8"
                            >
                              <Pencil className="w-3.5 h-3.5 mr-2 text-amber-500" /> 
                              {log.isDraft ? 'Lanjutkan Edit' : 'Edit Topik'}
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 border-[#015249] text-[#015249] hover:bg-[#015249]/10 dark:border-[#57BC90] dark:text-[#57BC90] font-bold text-xs shrink-0"
                            onClick={() => handleSaveNextSessionDate(log.id, log.nextSessionDate, (log as any).coacheeId)}
                            disabled={savingNextDateId === log.id}
                          >
                            {savingNextDateId === log.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5 mr-1.5" />}
                            Simpan Jadwal
                          </Button>
                          {savedNextDateId === log.id && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0 animate-in fade-in">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              Berhasil disimpan!
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Form Tanggapan Dihapus Sesuai Permintaan */}
                      
                      <div className="flex flex-col items-end gap-2 border-t border-slate-100 dark:border-slate-800/50 pt-3">
                        <div className="flex items-center gap-2">
                          {!isReadOnly && !isCoachee && (
                            <Button
                              variant="outline"
                              className="bg-white border-blue-600 text-blue-600 hover:bg-blue-50 dark:bg-zinc-950 dark:hover:bg-blue-900/20"
                              onClick={() => {
                                setIsCreatingContinued(log.id);
                                setIsCreating(true);
                                setDraftActionItems([{ text: '', dueDate: '' }]);
                              }}
                            >
                              Melanjutkan Coaching Saat ini
                            </Button>
                          )}
                          <Button 
                            variant="default" 
                            className={
                              (!hasCoacheeFollowedUp || isClosing === log.id)
                              ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed border-none shadow-none" 
                              : "bg-red-600 hover:bg-red-700 text-white"
                            }
                            onClick={() => {
                              if (!hasCoacheeFollowedUp) return;
                              setShowCloseConfirmDialog(log.id);
                              const selectedDate = editingNextDate[log.id] ?? (log.nextSessionDate ? new Date(log.nextSessionDate).toISOString().split('T')[0] : '');
                              setCloseNextSessionDate(selectedDate);
                            }}
                            disabled={!hasCoacheeFollowedUp || isClosing === log.id}
                            title={!hasCoacheeFollowedUp ? "Tutup sesi aktif setelah coachee melengkapi isian renaksi/eviden" : "Tutup sesi ini"}
                          >
                            {isClosing === log.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tutup Sesi Coaching
                          </Button>
                        </div>
                        {!hasCoacheeFollowedUp && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                            * Tombol Tutup Sesi Coaching akan aktif setelah coachee melengkapi isian renaksi / melampirkan eviden.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
                </>
                )}
              </div>
            )})
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewEvidence} onOpenChange={(open) => !open && setPreviewEvidence(null)}>
        <DialogContent className="sm:max-w-[700px] bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden">
          <DialogHeader className="p-4 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 z-10">
            <DialogTitle className="flex items-center gap-2 text-[#015249] dark:text-blue-400">
              <Paperclip className="w-4 h-4 text-[#57BC90]" />
              <span className="truncate">{previewEvidence?.name}</span>
            </DialogTitle>
            <DialogDescription className="sr-only">Pratinjau Dokumen Lampiran</DialogDescription>
          </DialogHeader>
          <div className="w-full flex justify-center items-center overflow-auto bg-slate-100/50 dark:bg-black/20 min-h-[300px] max-h-[75vh] p-4">
            {(previewEvidence?.url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)(\?.*)?$/i) || previewEvidence?.url.startsWith('data:image/')) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={previewEvidence.url} 
                alt={previewEvidence.name} 
                className="max-w-full h-auto object-contain rounded-md shadow-sm border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="flex flex-col items-center text-center p-8">
                <Paperclip className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-4">
                  Pratinjau tidak tersedia untuk format file ini.
                </p>
                <a 
                  href={previewEvidence?.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-[#015249] hover:bg-[#57BC90] text-white font-bold rounded-lg transition-colors"
                >
                  Buka di Tab Baru / Unduh
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showCloseConfirmDialog} onOpenChange={(open) => !open && setShowCloseConfirmDialog(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Tutup Sesi</DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin menutup sesi ini? Sesi yang telah ditutup tidak dapat diubah kembali.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowCloseConfirmDialog(null)} disabled={!!isClosing}>
              Batal
            </Button>
            <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmCloseSession} disabled={!!isClosing}>
              {isClosing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ya, Tutup Sesi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
