"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateQuestion } from "@/lib/actions";
import { Save, CheckCircle2, Loader2, Edit3, X } from "lucide-react";

type OptionData = { id: string; letter: string; text: string; };
type QuestionData = { id: string; order: number; text: string; options: OptionData[] };

export function QuestionEditor({ 
  question, 
  canModify = true 
}: { 
  question: QuestionData; 
  canModify?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(question.text);
  const [options, setOptions] = useState(question.options);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await updateQuestion(question.id, { text, options });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptionChange = (id: string, newText: string) => {
    setOptions(opts => opts.map(o => o.id === id ? { ...o, text: newText } : o));
  };

  const handleCancel = () => {
    setText(question.text);
    setOptions(question.options);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-950 text-slate-800 dark:text-slate-200 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#57BC90]/10 text-[#57BC90] flex items-center justify-center font-bold text-lg shrink-0">
              {question.order}
            </div>
            <h3 className="font-semibold text-lg pt-1">{question.text}</h3>
          </div>
          {canModify && (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="w-4 h-4 text-muted-foreground hover:text-[#57BC90]" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-14">
          {question.options.map(opt => (
            <div key={opt.id} className="text-sm p-3 bg-muted/50 rounded-xl border border-border/50 flex gap-3">
              <span className="font-bold text-[#015249] dark:text-blue-400">{opt.letter}</span>
              <span className="text-muted-foreground">{opt.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-indigo-50/30 dark:bg-indigo-950/20 text-slate-800 dark:text-slate-200 rounded-2xl border-2 border-[#57BC90]/30 shadow-md relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 w-full">
          <div className="w-10 h-10 rounded-full bg-[#57BC90]/20 text-[#57BC90] flex items-center justify-center font-bold text-lg shrink-0">
            {question.order}
          </div>
          <div className="w-full space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Teks Pertanyaan</Label>
            <Textarea 
              value={text} 
              onChange={e => setText(e.target.value)} 
              className="text-base font-semibold resize-none focus-visible:ring-[#57BC90]" 
              rows={2}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4 pl-14 mb-6">
        {options.map(opt => (
          <div key={opt.id} className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex gap-2">
              Pilihan <span className="text-[#015249] dark:text-blue-400">{opt.letter}</span>
            </Label>
            <Input 
              value={opt.text} 
              onChange={e => handleOptionChange(opt.id, e.target.value)}
              className="focus-visible:ring-[#57BC90]"
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end gap-3 pl-14">
        <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>Batal</Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#57BC90] hover:bg-[#57BC90] text-white">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
      
      {saved && (
        <div className="absolute -top-3 right-6 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm border border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Tersimpan
        </div>
      )}
    </div>
  );
}
