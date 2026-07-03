"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitAssessment } from "@/lib/actions";
import { AnswerCounts } from "@/lib/scoring";

type Option = { letter: string; text: string; };
type Question = { id: string | number; text: string; options: Option[] };

export function QuizWizard({ questions }: { questions: Question[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: val }));
    
    // Auto-advance to the next question if it's not the last one
    if (!isLastStep) {
      setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, 350); // 350ms delay for visual feedback before transitioning
    }
  };

  const handleSubmit = async () => {
    if (!answers[question.id]) return;
    
    setIsSubmitting(true);
    const counts: AnswerCounts = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach(letter => {
      counts[letter as keyof AnswerCounts]++;
    });
    
    await submitAssessment(counts);
  };

  return (
    <Card className="shadow-2xl glass-card border-primary/20 overflow-hidden">
      <CardHeader className="px-6 sm:px-10 pt-8 pb-4">
        <CardTitle className="text-xl text-primary font-semibold">Pertanyaan {currentStep + 1} dari {questions.length}</CardTitle>
        <div className="w-full bg-muted/50 h-3 rounded-full mt-4 overflow-hidden border border-white/10 shadow-inner">
          <div 
            className="bg-gradient-to-r from-primary to-purple-500 h-full rounded-full transition-all duration-700 ease-out shadow-sm" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="px-6 sm:px-10 pt-4 pb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{question.text}</h2>
        <RadioGroup 
          value={answers[question.id] || ""} 
          onValueChange={handleSelect}
          className="space-y-4"
        >
          {question.options.map((opt) => (
            <div 
              key={opt.letter} 
              className={`flex items-center space-x-4 p-5 sm:p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer ${answers[question.id] === opt.letter ? "border-primary bg-primary/10 shadow-md scale-[1.01]" : "border-muted/50 hover:border-primary/40 hover:bg-white/50 dark:hover:bg-black/20"}`}
            >
              <RadioGroupItem value={opt.letter} id={`${question.id}-${opt.letter}`} />
              <Label htmlFor={`${question.id}-${opt.letter}`} className="flex-1 cursor-pointer text-lg leading-relaxed font-normal">
                {opt.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between px-6 sm:px-10 py-6 border-t mt-4 bg-muted/10">
        <Button variant="outline" size="lg" onClick={handleBack} disabled={currentStep === 0 || isSubmitting}>
          Kembali
        </Button>
        {isLastStep ? (
          <Button size="lg" onClick={handleSubmit} disabled={!answers[question.id] || isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan & Kirim"}
          </Button>
        ) : (
          <Button size="lg" onClick={handleNext} disabled={!answers[question.id]}>
            Lanjut
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
