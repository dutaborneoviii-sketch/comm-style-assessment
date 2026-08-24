"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitAssessment } from "@/lib/actions";
import { AnswerCounts } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Option = { letter: string; text: string; };
type Question = { id: string | number; text: string; options: Option[] };

const OPTION_COLORS: Record<string, string> = {
  A: "border-red-400 bg-red-50 text-red-700",
  B: "border-amber-400 bg-amber-50 text-amber-700",
  C: "border-emerald-400 bg-emerald-50 text-emerald-700",
  D: "border-blue-400 bg-blue-50 text-blue-700",
};

const OPTION_HOVER: Record<string, string> = {
  A: "hover:border-red-400 hover:bg-red-50",
  B: "hover:border-amber-400 hover:bg-amber-50",
  C: "hover:border-emerald-400 hover:bg-emerald-50",
  D: "hover:border-blue-400 hover:bg-blue-50",
};

export function QuizWizard({ questions, showCancel }: { questions: Question[], showCancel?: boolean }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem('quiz_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.answers && typeof parsed.currentStep === 'number') {
          setAnswers(parsed.answers);
          setCurrentStep(parsed.currentStep);
          setHasStarted(true); // Langsung masuk ke soal jika ada draft
        }
      } catch (e) {
        console.error("Gagal memuat draft:", e);
      }
    }
  }, []);

  const question = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const handleNext = () => {
    if (answers[question.id]) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(s => s - 1);
  };

  const handleSaveDraft = () => {
    localStorage.setItem('quiz_draft', JSON.stringify({ answers, currentStep }));
    setShowDraftDialog(true);
  };

  const handleSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: val }));
    
    // Auto-advance
    if (!isLastStep) {
      setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, 400); 
    }
  };

  const handleSubmit = async () => {
    if (!answers[question.id]) return;
    
    setIsSubmitting(true);
    const counts: AnswerCounts = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach(letter => {
      counts[letter as keyof AnswerCounts]++;
    });
    
    // Hapus draft SEBELUM submit, karena submitAssessment melakukan server-side redirect
    // yang akan menghentikan eksekusi kode di bawahnya.
    localStorage.removeItem('quiz_draft');
    
    try {
      await submitAssessment(counts);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / questions.length) * 100;
  const questionNumber = String(currentStep + 1).padStart(2, '0');

  if (!hasStarted) {
    return (
      <div className="flex flex-col flex-1 min-h-[60vh] w-full items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#015249]/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl text-center p-8 lg:p-12">
          <div className="w-20 h-20 bg-[#57BC90]/20 text-[#015249] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">Pengisian Kuesioner</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-10">
            Anda akan menjawab serangkaian pertanyaan untuk mengidentifikasi gaya komunikasi dan kepemimpinan Anda. 
            Tidak ada jawaban yang benar atau salah, maupun kepribadian tertentu yang dianggap ideal oleh organisasi. 
            Jawablah dengan jujur sesuai dengan apa yang paling menggambarkan diri Anda di lingkungan&nbsp;kerja.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => setHasStarted(true)} 
            className="bg-[#015249] hover:bg-[#01413a] text-white font-bold rounded-xl h-14 px-10 shadow-md hover:shadow-lg transition-all text-lg"
          >
            Mulai Pengisian Kuesioner
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full overflow-hidden rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        {/* Left Panel: Question Context (Navy) */}
        <div className="relative w-full lg:w-[45%] xl:w-2/5 bg-[#015249] text-white flex flex-col justify-center p-8 lg:p-12 overflow-y-auto shrink-0">
          {/* Decorative background number */}
          <div className="absolute top-1/2 left-8 -translate-y-1/2 text-[15rem] lg:text-[20rem] font-black text-white/5 select-none pointer-events-none leading-none">
            {questionNumber}
          </div>
          
          <div className="relative z-10 w-full max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[#57BC90] font-semibold tracking-wider text-sm uppercase">Pertanyaan</span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">{currentStep + 1}</span>
                <span className="text-white/40">/ {questions.length}</span>
                {/* Circular Progress Indicator */}
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#57BC90] transition-all duration-500 ease-out"
                      strokeDasharray={`${progressPercentage}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight drop-shadow-sm mb-6">
              {question.text}
            </h2>
          </div>
        </div>

        {/* Right Panel: Options (White) */}
        <div className="flex-1 bg-white lg:bg-slate-50 flex flex-col p-6 lg:p-8 relative overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto flex flex-col h-full justify-between min-h-[400px]">
            
            <div className="flex-1 flex flex-col justify-center py-4">
              <RadioGroup 
                value={answers[question.id] || ""} 
                onValueChange={handleSelect}
                className="space-y-3"
              >
                {question.options.map((opt) => {
                  const isSelected = answers[question.id] === opt.letter;
                  const activeColor = OPTION_COLORS[opt.letter] || "border-[#57BC90] bg-[#57BC90]/10 text-[#57BC90]";
                  const hoverColor = OPTION_HOVER[opt.letter] || "hover:border-[#57BC90] hover:bg-[#57BC90]/5";
                  
                  return (
                    <div 
                      key={opt.letter} 
                      className={cn(
                        "flex items-center space-x-4 p-4 lg:p-5 border-2 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden group",
                        isSelected 
                          ? activeColor + " scale-[1.01] shadow-md border-l-8" 
                          : "border-slate-200 bg-white border-l-8 border-l-slate-300 hover:border-l-slate-400 " + hoverColor
                      )}
                    >
                      <RadioGroupItem value={opt.letter} id={`${question.id}-${opt.letter}`} className="sr-only" />
                      
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg shrink-0 transition-colors",
                        isSelected 
                          ? "bg-white/80" 
                          : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-800"
                      )}>
                        {opt.letter}
                      </div>

                      <Label htmlFor={`${question.id}-${opt.letter}`} className={cn(
                        "flex-1 cursor-pointer text-base lg:text-lg leading-relaxed font-medium select-none",
                        isSelected ? "text-slate-900 font-bold" : "text-slate-700"
                      )}>
                        {opt.text}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-4 shrink-0">
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleBack} 
                  disabled={currentStep === 0 || isSubmitting}
                  className="text-slate-600 hover:text-slate-900 border-slate-300 rounded-xl h-12 px-4 lg:px-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Kembali</span>
                </Button>

                {Object.keys(answers).length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    onClick={() => setShowRestartDialog(true)} 
                    disabled={isSubmitting} 
                    className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-12 px-4 lg:px-6"
                  >
                    Mulai Ulang
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleSaveDraft} 
                  disabled={isSubmitting} 
                  className="text-amber-600 hover:text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 rounded-xl h-12 px-4 lg:px-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Draft
                </Button>

                {showCancel && (
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    onClick={() => setShowCancelDialog(true)} 
                    disabled={isSubmitting} 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl h-12 px-4 lg:px-6"
                  >
                    Batal
                  </Button>
                )}
              </div>
              {isLastStep ? (
                <Button 
                  size="lg" 
                  onClick={handleSubmit} 
                  disabled={!answers[question.id] || isSubmitting}
                  className="bg-[#57BC90] hover:bg-[#57BC90] text-white font-bold rounded-xl h-12 px-8 shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? "Menyimpan..." : "Selesai"}
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  onClick={handleNext} 
                  disabled={!answers[question.id]}
                  className="bg-[#57BC90] hover:bg-[#57BC90] text-white font-bold rounded-xl h-12 px-8 shadow-md hover:shadow-lg transition-all"
                >
                  Lanjut
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Draft Saved Dialog */}
      <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <DialogContent className="max-w-md bg-white border-0 shadow-2xl p-0 overflow-hidden rounded-2xl">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Draft Tersimpan</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600 text-[15px] leading-relaxed">
                Draft kuesioner berhasil disimpan. Anda dapat melanjutkannya kembali nanti dari titik ini.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                onClick={() => setShowDraftDialog(false)} 
                className="bg-[#57BC90] text-white hover:bg-[#45a47c] font-semibold px-6 rounded-xl"
              >
                OK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md bg-white border-0 shadow-2xl p-0 overflow-hidden rounded-2xl">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Konfirmasi Keluar</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600 text-[15px] leading-relaxed">
                Apakah Anda yakin ingin membatalkan pengisian kuesioner? Progres Anda saat ini akan hilang jika belum disimpan sebagai draft.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline"
                onClick={() => setShowCancelDialog(false)} 
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-6 rounded-xl"
              >
                Batal
              </Button>
              <Button 
                onClick={() => {
                  localStorage.removeItem('quiz_draft');
                  router.push('/profile');
                }} 
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold px-6 rounded-xl"
              >
                Ya, Keluar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Restart Confirmation Dialog */}
      <Dialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <DialogContent className="max-w-md bg-white border-0 shadow-2xl p-0 overflow-hidden rounded-2xl">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Mulai Ulang Kuesioner</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600 text-[15px] leading-relaxed">
                Apakah Anda yakin ingin mengulang pengisian dari awal? Draft yang sudah ada akan dihapus.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline"
                onClick={() => setShowRestartDialog(false)} 
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-6 rounded-xl"
              >
                Batal
              </Button>
              <Button 
                onClick={() => {
                  localStorage.removeItem('quiz_draft');
                  setAnswers({});
                  setCurrentStep(0);
                  setShowRestartDialog(false);
                }} 
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold px-6 rounded-xl"
              >
                Ya, Mulai Ulang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
