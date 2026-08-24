'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Target, Search, Lightbulb, Handshake, ChevronRight, ChevronLeft, Plus, X, Loader2, Info, Sparkles } from 'lucide-react';

type ActionItem = {
  text: string;
  dueDate: string;
};

type IGrowWizardProps = {
  coacheeStyle: string;
  onCancel: () => void;
  onSubmit: (data: { date: string; title: string; notes: string; nextSessionDate?: string; isDraft?: boolean; actionItems: ActionItem[] }) => void;
  isSubmitting: boolean;
  defaultDate?: string;
  defaultTitle?: string;
  defaultNotes?: string;
  defaultNextSessionDate?: string;
  defaultActionItems?: { id?: string, text: string, dueDate: string }[];
  isContinuedSession?: boolean;
};

const steps = [
  { id: 'goal', title: 'Goal', icon: Target, description: 'Menyepakati Topik dan Hasil' },
  { id: 'reality', title: 'Reality', icon: Search, description: 'Mengeksplorasi Situasi' },
  { id: 'options', title: 'Options', icon: Lightbulb, description: 'Menemukan Pilihan/Solusi' },
  { id: 'will', title: 'Will', icon: Handshake, description: 'Rencana Tindak Lanjut' },
];

export function IGrowSessionWizard({ 
  coacheeStyle, 
  onCancel, 
  onSubmit, 
  isSubmitting,
  defaultDate,
  defaultTitle,
  defaultNotes,
  defaultNextSessionDate,
  defaultActionItems,
  isContinuedSession = false
}: IGrowWizardProps) {
  const [currentStep, setCurrentStep] = useState(isContinuedSession ? 1 : 0);
  const [date, setDate] = useState(() => defaultDate || new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState(defaultTitle || '');
  const [nextSessionDate, setNextSessionDate] = useState(defaultNextSessionDate || '');
  
  // Try to parse existing notes if editing (very basic parsing)
  let initialGoal = '';
  let initialReality = '';
  let initialOptions = '';
  let initialWill = '';
  let initialContinuedTopics: string[] = [];
  
  if (defaultNotes) {
    if (defaultNotes.includes('**Pembahasan 1**')) {
      const parts = defaultNotes.split(/\*\*Pembahasan \d+\*\*\n/).map(p => p.trim()).filter(Boolean);
      initialContinuedTopics = parts.length > 0 ? parts : [''];
      initialReality = parts.join('\n\n'); // Fallback for legacy data
    } else {
      const goalMatch = defaultNotes.match(/\*\*Goal\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
      const realityMatch = defaultNotes.match(/\*\*Reality\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
      const optionsMatch = defaultNotes.match(/\*\*Options\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
      const willMatch = defaultNotes.match(/\*\*Will\*\*\n([\s\S]*?)(?=\n\n\*\*|$)/);
      
      if (goalMatch) initialGoal = goalMatch[1].trim();
      if (realityMatch) initialReality = realityMatch[1].trim();
      if (optionsMatch) initialOptions = optionsMatch[1].trim();
      if (willMatch) initialWill = willMatch[1].trim();
      
      if (!goalMatch && !realityMatch && !optionsMatch && !willMatch) {
         // If no format found, put everything in goal
         initialGoal = defaultNotes;
      }
      
      // If continuing an existing session, we only want to inherit the Goal.
      // Reality, Options, and Will should be fresh for the new session.
      if (isContinuedSession) {
        initialReality = '';
        initialOptions = '';
        initialWill = '';
      }
    }
  }

  // Step Notes
  const [goalNotes, setGoalNotes] = useState(initialGoal);
  const [realityNotes, setRealityNotes] = useState(initialReality);
  const [optionsNotes, setOptionsNotes] = useState(initialOptions);
  
  // Action Items for Will
  const [willNotes, setWillNotes] = useState(initialWill);
  const [actionItems, setActionItems] = useState<ActionItem[]>(defaultActionItems && defaultActionItems.length > 0 ? defaultActionItems : [{ text: '', dueDate: '' }]);

  const [continuedTopics, setContinuedTopics] = useState<string[]>(initialContinuedTopics.length > 0 ? initialContinuedTopics : ['']);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleAddActionItem = () => {
    setActionItems([...actionItems, { text: '', dueDate: '' }]);
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleActionItemChange = (index: number, field: keyof ActionItem, value: string) => {
    const newItems = [...actionItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setActionItems(newItems);
  };

  const handleFinalSubmit = (isDraft: boolean = false) => {
    const validActionItems = actionItems.filter(item => item.text.trim() !== '');
    
    // Combine notes into Markdown
    let combinedNotes = "";
    if (goalNotes) combinedNotes += `**Goal**\n${goalNotes}\n\n`;
    if (realityNotes) combinedNotes += `**Reality**\n${realityNotes}\n\n`;
    if (optionsNotes) combinedNotes += `**Options**\n${optionsNotes}\n\n`;
    if (willNotes) combinedNotes += `**Will**\n${willNotes}`;
    
    combinedNotes = combinedNotes.trim();

    onSubmit({
      date,
      title,
      notes: combinedNotes,
      nextSessionDate,
      isDraft,
      actionItems: validActionItems,
    });
  };

  const renderActionItemsForm = () => (
    <div className="space-y-6">
      {/* Action Items List */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Action Items (Langkah Konkret)</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Rencana tindak lanjut yang terukur dengan batas waktu.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddActionItem} className="h-8 text-xs border-[#57BC90] text-[#57BC90] hover:bg-[#57BC90]/5">
            <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Poin
          </Button>
        </div>
        
        <div className="space-y-3">
          {actionItems.map((item, index) => (
            <div key={index} className="flex gap-3 items-start bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group/item">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs text-slate-500">Tugas / Rencana Aksi</Label>
                  <Input 
                    placeholder="Apa langkah konkret selanjutnya?" 
                    value={item.text}
                    onChange={(e) => handleActionItemChange(index, 'text', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Target Tanggal (Due Date)</Label>
                  <Input 
                    type="date" 
                    value={item.dueDate}
                    onChange={(e) => handleActionItemChange(index, 'dueDate', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-full mt-5 shrink-0" onClick={() => handleRemoveActionItem(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {actionItems.length === 0 && (
            <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-lg">Belum ada action items yang ditambahkan.</p>
          )}
        </div>
      </div>

      {/* Jadwal Sesi Selanjutnya */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Label className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Jadwal Sesi Coaching Selanjutnya (Tanggal Pelaksanaan)</Label>
        <p className="text-xs text-muted-foreground">Tentukan tanggal pelaksanaan untuk sesi coaching berikutnya (opsional).</p>
        <Input 
          type="date" 
          value={nextSessionDate} 
          onChange={e => setNextSessionDate(e.target.value)} 
          className="h-10 text-sm max-w-xs font-medium"
        />
      </div>
    </div>
  );

  return (
    <div className="w-full pr-4 md:pr-6">
      
      {/* Sticky Header Info (Tanggal & Topik Sesi) */}
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 pt-1 pb-3 border-b border-slate-100 dark:border-zinc-800/60 mb-5 flex flex-col md:flex-row gap-4">
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="date" className="text-sm font-extrabold text-slate-600 dark:text-slate-400">Tanggal Sesi</Label>
          <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10 text-base font-medium" />
        </div>
        <div className="space-y-1.5 flex-[2]">
          <Label htmlFor="title" className="text-sm font-extrabold text-slate-600 dark:text-slate-400">Topik / Judul Sesi</Label>
          <Input id="title" placeholder="Cth: Evaluasi Target Q3" value={title} onChange={e => setTitle(e.target.value)} className="h-10 text-base font-medium" />
        </div>
      </div>

      {/* Stepper Header (Compact Chevron Style) */}
          <div className="flex w-full mb-6 h-11 drop-shadow-sm overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const letter = step.title.charAt(0);
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`relative flex-1 flex items-center justify-center gap-2 group transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#3b82f6] text-white z-10 font-bold shadow-sm' 
                      : 'bg-[#fde047] text-slate-800 hover:bg-[#facc15] z-0'
                  }`}
                  style={{
                    clipPath: idx === 0 
                      ? 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)'
                      : idx === steps.length - 1
                      ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8% 50%)'
                      : 'polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%, 8% 50%)',
                    marginLeft: idx === 0 ? '0' : '-2%',
                    paddingLeft: idx === 0 ? '0' : '3%',
                    paddingRight: idx === steps.length - 1 ? '0' : '2%'
                  }}
                >
                  <span className="text-base font-black leading-none">{letter}</span>
                  <span className="text-xs font-black tracking-wide uppercase">{step.title}</span>
                </button>
              )
            })}
          </div>
          
          {/* Step Content & Guidance Layout */}
          <div className="mb-6">
            {/* Step Title Header */}
            <div className="flex items-center gap-2.5 mb-6 border-b pb-3.5">
              {(() => {
                const CurrentIcon = steps[currentStep].icon;
                return <CurrentIcon className="w-6 h-6 text-[#015249] dark:text-blue-400" />
              })()}
              <h3 className="text-xl font-extrabold text-[#015249] dark:text-white">{steps[currentStep].title} - {steps[currentStep].description}</h3>
            </div>

            <div className="space-y-6">
              
              {/* Style & Guidance Box (Inline full width) */}
              {(() => {
                let text = "";
                let qs: string[] = [];
                const style = coacheeStyle || '';
                
                if (currentStep === 0) {
                  text = style.includes('Direktif') ? "Fokus pada metrik keberhasilan yang terukur and efisien." : style.includes('Ekspresif') ? "Ajak mereka memvisualisasikan gambaran besar dari target." : style.includes('Harmonis') ? "Pastikan goal ini membawa dampak positif bagi tim/lingkungan." : style.includes('Analitis') ? "Tetapkan target berdasarkan data historis dan fakta logis." : "Fokus pada penyepakatan topik dan hasil akhir.";
                  qs = ["Dari IDP/Target, apa yang ingin dibahas bersama saya di pertemuan ini?", "Bagaimana perkembangan kamu (dari sesi sebelumnya)?", "Apa yang ingin Anda dapatkan sebagai hasilnya di akhir sesi ini?"];
                } else if (currentStep === 1) {
                  text = style.includes('Direktif') ? "Langsung pada pokok hambatan. Apa yang kurang efisien?" : style.includes('Ekspresif') ? "Beri ruang mereka bercerita situasinya tanpa memotong antusiasme." : style.includes('Harmonis') ? "Tanyakan bagaimana situasi ini mempengaruhi hubungan kerja." : style.includes('Analitis') ? "Gali akar masalah secara sistematis (sebab-akibat)." : "Mengeksplorasi situasi saat ini dan identifikasi gap.";
                  qs = ["Bagaimana situasinya sekarang? Apa yang sudah berhasil?", "Apa tantangannya? Apa yang jadi hambatan?", "Dari skala 1-10, seberapa ideal kondisi sekarang?"];
                } else if (currentStep === 2) {
                  text = style.includes('Direktif') ? "Berikan mereka kebebasan mengambil keputusan dari beberapa alternatif." : style.includes('Ekspresif') ? "Brainstorming ide-ide gila! Jangan batasi kreativitas." : style.includes('Harmonis') ? "Cari solusi yang win-win dan minim konflik." : style.includes('Analitis') ? "Pertimbangkan risiko dan peluang dari setiap alternatif." : "Menemukan pilihan/solusi dari proses berpikir bersama.";
                  qs = ["Apa yang perlu berubah? Apa yang akan kamu lakukan berbeda?", "Opsi/alternatif solusi apa saja yang tersedia?", "Keputusan apa yang perlu kamu buat?"];
                } else {
                  text = style.includes('Direktif') ? "Sepakati deadline yang ketat dan biarkan mereka memimpin eksekusi." : style.includes('Ekspresif') ? "Berikan motivasi dan apresiasi atas ide-ide mereka." : style.includes('Harmonis') ? "Tawarkan dukungan jika mereka membutuhkan bantuan." : style.includes('Analitis') ? "Pastikan timeline logis dan masuk akal." : "Menyepakati rencana tindak lanjut dan akuntabilitas.";
                  qs = ["Apa tindak lanjut dari sesi ini? Apa rencana tindakan kamu?", "Kapan kamu akan memulainya?", "Apa yang perlu diantisipasi, jika ada hal-hal yang berpotensi menghalangi?", "Apa rangkuman kamu atas hasil sesi kita?"];
                }

                return (
                  <div className="space-y-4">
                    {/* Style Tip Alert (Tighter Single Line Box) */}
                    <div className="bg-blue-50/75 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 py-2 px-3.5 rounded-lg flex items-center gap-2.5 text-sm text-blue-900 dark:text-blue-300">
                      <Info className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="flex flex-row items-center gap-1.5 flex-wrap leading-relaxed">
                        <span className="font-extrabold uppercase tracking-wider text-xs text-blue-700 dark:text-blue-400 shrink-0">Tips Gaya ({style || 'Umum'}):</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{text}</span>
                      </div>
                    </div>

                    {/* Trigger Questions Box */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-4.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
                      <p className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-slate-800">
                        <Lightbulb className="w-4 h-4 text-amber-500" /> Panduan Pertanyaan Coach
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300 font-medium">
                        {qs.map((q, idx) => (
                          <li key={idx} className="leading-relaxed">{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              {/* Input Form Card */}
              <div className="space-y-4">
                {currentStep === 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Catatan Goal (Tujuan Sesi)</Label>
                    <p className="text-[13px] text-slate-500 mb-2">Tuliskan tujuan atau target spesifik yang ingin dicapai oleh coachee dari sesi ini...</p>
                    <Textarea 
                      className={`min-h-[160px] resize-y text-base font-medium focus-visible:ring-blue-500 ${isContinuedSession ? 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800' : ''}`}
                      value={goalNotes}
                      readOnly={isContinuedSession}
                      onChange={e => setGoalNotes(e.target.value)}
                    />
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="space-y-2">
                     <Label className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Catatan Reality (Kondisi Lapangan)</Label>
                     <p className="text-[13px] text-slate-500 mb-2">Jelaskan kondisi saat ini, kendala nyata, data lapangan, dan gap yang diidentifikasi...</p>
                     <Textarea 
                       className="min-h-[160px] resize-y text-base font-medium focus-visible:ring-blue-500"
                       value={realityNotes}
                       onChange={e => setRealityNotes(e.target.value)}
                     />
                   </div>
                 )}
                 {currentStep === 2 && (
                   <div className="space-y-2">
                     <Label className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Catatan Options (Brainstorming Solusi)</Label>
                     <p className="text-[13px] text-slate-500 mb-2">Catat alternatif solusi, brainstorming ide baru, atau keputusan taktis yang dihasilkan...</p>
                     <Textarea 
                       className="min-h-[160px] resize-y text-base font-medium focus-visible:ring-blue-500"
                       value={optionsNotes}
                       onChange={e => setOptionsNotes(e.target.value)}
                     />
                   </div>
                 )}
                 {currentStep === 3 && (
                   <div className="space-y-6">
                     <div className="space-y-2">
                       <Label className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Catatan Will (Kesimpulan)</Label>
                       <p className="text-[13px] text-slate-500 mb-2">Catat komitmen, kesimpulan sesi, dan seberapa membantu sesi ini...</p>
                       <Textarea 
                         className="min-h-[120px] resize-y text-base font-medium focus-visible:ring-blue-500"
                         value={willNotes}
                         onChange={e => setWillNotes(e.target.value)}
                       />
                     </div>
                     {renderActionItemsForm()}
                   </div>
                 )}
              </div>

            </div>
          </div>
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="secondary" onClick={() => handleFinalSubmit(true)} disabled={isSubmitting || (!title && !isContinuedSession)}>
            Simpan Draft
          </Button>
        </div>
        <div className="flex gap-2">

              <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0 || isSubmitting}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} className="bg-[#015249] hover:bg-[#013b34] text-white">
                  Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : null}


          {currentStep === steps.length - 1 && (
            <Button onClick={() => handleFinalSubmit(false)} className="bg-[#57BC90] hover:bg-[#57BC90] text-white" disabled={isSubmitting || !title}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Simpan Sesi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

