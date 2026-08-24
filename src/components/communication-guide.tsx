import { BookOpen, Target, Sparkles, HeartHandshake, BarChart2, Info, MessageSquareQuote, Layers, Users, Rocket, Shield, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription as DialogDesc, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { directiveGuide, expressiveGuide, harmoniousGuide, analyticalGuide, dirAnaGuide, eksHarGuide, dirEksGuide, harAnaGuide, dirHarGuide } from "@/app/(dashboard)/guide/data";

export const communicationStyles = [
  {
    id: "directive",
    name: "Direktif (Directive)",
    icon: Target,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-900",
    description: "Fokus utama mereka adalah efisiensi, aksi, dan pencapaian target (hasil akhir).",
    traits: ["Lugas", "Berorientasi pada penyelesaian masalah", "Tidak menyukai birokrasi yang panjang"],
    tips: [
      "Sampaikan poin utama di awal (konsep bottom-line first).",
      "Berikan opsi penyelesaian yang konkret alih-alih mengeluhkan masalah.",
      "Hindari rapat tanpa agenda yang jelas atau mempresentasikan detail teknis yang tidak mereka minta."
    ],
    fullGuide: directiveGuide as any
  },
  {
    id: "expressive",
    name: "Ekspresif (Expressive)",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-900",
    description: "Fokus utama mereka adalah visi, inovasi, kolaborasi aktif, dan gambaran besar (big picture).",
    traits: ["Komunikator yang antusias", "Persuasif", "Memiliki energi yang tinggi", "Fleksibel"],
    tips: [
      "Tunjukkan antusiasme Anda terhadap ide mereka.",
      "Diskusikan \"mengapa\" (why) sebelum \"bagaimana\" (how).",
      "Beri mereka ruang untuk bercerita, dan bantu rangkum percakapan di akhir agar poin tindakan (action items) tidak terlewatkan oleh ide-ide besar."
    ],
    fullGuide: expressiveGuide as any
  },
  {
    id: "harmonious",
    name: "Harmonis (Harmonious)",
    icon: HeartHandshake,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-900",
    description: "Fokus utama mereka adalah keselarasan tim, empati, keandalan, dan lingkungan kerja yang suportif.",
    traits: ["Pendengar aktif yang luar biasa", "Diplomatis", "Mengutamakan konsensus", "Stabil"],
    tips: [
      "Bangun kepercayaan (trust) dan koneksi profesional secara personal.",
      "Jangan memaksa mereka membuat keputusan di tempat (berikan waktu untuk menimbang efeknya bagi orang lain).",
      "Gunakan bahasa yang suportif dan konfirmasikan kesepakatan secara kolaboratif."
    ],
    fullGuide: harmoniousGuide as any
  },
  {
    id: "analytical",
    name: "Analitis (Analytical)",
    icon: BarChart2,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-900",
    description: "Fokus utama mereka adalah akurasi, struktur, logika berlandaskan data, dan proses yang benar.",
    traits: ["Terorganisir", "Presisi", "Berhati-hati dalam berargumen", "Sistematis"],
    tips: [
      "Siapkan data, dokumen, atau fakta kuantitatif sebelum berdiskusi.",
      "Berikan penjelasan yang terstruktur secara kronologis.",
      "Hindari bahasa yang terlalu emosional atau menekan mereka untuk menyetujui sesuatu yang belum terbukti secara metodologi."
    ],
    fullGuide: analyticalGuide as any
  },
  {
    id: "dirAna",
    name: "Direktif + Analitis",
    icon: Layers,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-900",
    description: "Eksekutor Presisi",
    traits: ["Struktur Jelas", "Efisiensi Tinggi", "Objektif", "Tantangan Intelektual"],
    tips: [
      "Buka sesi dengan agenda yang jelas.",
      "Gunakan pertanyaan yang menuntut logika.",
      "Fokus pada manajemen risiko dan metrik kinerja."
    ],
    fullGuide: dirAnaGuide as any
  },
  {
    id: "eksHar",
    name: "Ekspresif + Harmonis",
    icon: Users,
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-900",
    description: "Jantung Tim",
    traits: ["Kolaboratif", "Antusias", "Suportif", "Membangun Hubungan"],
    tips: [
      "Awali sesi dengan menanyakan kabar.",
      "Fokus pada dampak tugas bagi orang lain.",
      "Gunakan metode koreksi yang positif (Sandwich)."
    ],
    fullGuide: eksHarGuide as any
  },
  {
    id: "dirEks",
    name: "Direktif + Ekspresif",
    icon: Rocket,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-900",
    description: "Pemimpin Visioner",
    traits: ["Ambisius", "Dominan", "Persuasif", "Pengambil Inisiatif"],
    tips: [
      "Tantang ego dan ambisi mereka.",
      "Bantu menyusun prioritas strategis.",
      "Tawarkan pengakuan publik atas pencapaian."
    ],
    fullGuide: dirEksGuide as any
  },
  {
    id: "harAna",
    name: "Harmonis + Analitis",
    icon: Shield,
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-900",
    description: "Penjaga Presisi",
    traits: ["Sangat Teliti", "Berhati-hati", "Terstruktur", "Dapat Diandalkan"],
    tips: [
      "Berikan rasa aman sebelum mulai sesi.",
      "Beri parameter keberhasilan yang sangat jelas.",
      "Jangan gunakan tekanan waktu yang ekstrem."
    ],
    fullGuide: harAnaGuide as any
  },
  {
    id: "dirHar",
    name: "Direktif + Harmonis",
    icon: Crown,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-900",
    description: "Penggerak yang Mengayomi",
    traits: ["Fokus pada Hasil", "Peduli Tim", "Adil", "Membangun Loyalitas"],
    tips: [
      "Hubungkan ketegasan dengan kebaikan tim.",
      "Bantu mengatasi rasa bersalah saat menindak.",
      "Fokus pada objektivitas untuk keadilan."
    ],
    fullGuide: dirHarGuide as any
  }
];

import { prisma } from "@/lib/prisma";

export async function CommunicationGuide() {
  const dictEntries = await prisma.communicationDictionary.findMany();
  const dictMap = new Map(dictEntries.map(e => [e.id, JSON.parse(e.content)]));

  const stylesWithData = communicationStyles.map(style => ({
    ...style,
    fullGuide: dictMap.get(style.id) || style.fullGuide
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Panduan Gaya Komunikasi</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">Pelajari berbagai gaya komunikasi untuk meningkatkan kolaborasi tim Anda.</p>
          </div>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none relative z-10">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base text-justify">
            Setiap individu memiliki preferensi gaya komunikasi yang unik dalam berinteraksi dan memproses informasi di lingkungan kerja. Dengan mengenali dan memahami gaya komunikasi rekan kerja Anda, Anda dapat mengadaptasi cara komunikasi Anda untuk membangun hubungan yang lebih kuat, menghindari miskomunikasi, dan meningkatkan produktivitas bersama.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stylesWithData.map((style) => (
          <Dialog key={style.id}>
            <DialogTrigger render={
              <Card className={`group h-full flex flex-col overflow-hidden border transition-all hover:shadow-lg cursor-pointer hover:scale-[1.02] text-left relative ${style.borderColor} ${style.bgColor}`}>
                
                {/* Decorative background icon */}
                <div className={`absolute -bottom-8 -right-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:opacity-[0.06] dark:group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 ${style.color}`}>
                  <style.icon className="w-48 h-48 md:w-56 md:h-56" />
                </div>

                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start gap-4 mb-2">
                    <div className={`p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-sm shrink-0 ${style.color}`}>
                      <style.icon className="w-7 h-7" />
                    </div>
                    <div className="pt-1">
                      <CardTitle className="text-xl font-bold leading-none mb-2">{style.name}</CardTitle>
                      <CardDescription className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                        {style.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col relative z-10">
                  <div className="space-y-6 flex-1">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Karakteristik Utama</h4>
                      <div className="flex flex-wrap gap-2">
                        {style.traits.map((trait, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white/60 dark:bg-black/20 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Tips Berkomunikasi</h4>
                      <ul className="space-y-2">
                        {style.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-current ${style.color}`} />
                            <span className="leading-snug">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            } />
            <DialogContent className="sm:max-w-5xl max-w-[95vw] max-h-[85vh] overflow-y-auto p-0 border-0 bg-transparent shadow-2xl [&>button]:right-4 [&>button]:top-4 [&>button]:text-white">
              <div className={`p-6 sm:p-10 rounded-t-xl sm:rounded-t-2xl relative overflow-hidden ${style.bgColor}`}>
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 -z-10 ${style.bgColor.replace('bg-', 'bg-').split(' ')[0]}`} />
                <DialogHeader className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-white/50 dark:bg-black/20 shadow-sm ${style.color}`}>
                      <style.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <DialogTitle className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${style.color}`}>
                        {style.fullGuide.title}
                      </DialogTitle>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                    {style.fullGuide.subtitle}
                  </p>
                  
                  {style.fullGuide.profil && (
                    <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                      <h3 className={`text-lg font-bold mb-4 ${style.color}`}>Profil Psikologis</h3>
                      
                      {typeof style.fullGuide.profil === 'string' && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-5 leading-relaxed text-justify">
                          {style.fullGuide.profil}
                        </p>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 mb-2">Suka / Termotivasi Oleh:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            {Array.isArray(style.fullGuide.suka) 
                              ? style.fullGuide.suka.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))
                              : <li>{style.fullGuide.suka}</li>
                            }
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-2">Menghindari / Demotivasi Oleh:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            {Array.isArray(style.fullGuide.hindari) 
                              ? style.fullGuide.hindari.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))
                              : <li>{style.fullGuide.hindari}</li>
                            }
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">Strategi Utama Pendekatan:</h4>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                          {style.fullGuide.strategi}
                        </p>
                      </div>
                    </div>
                  )}
                </DialogHeader>
              </div>
              
              <div className="bg-white dark:bg-zinc-950 p-6 sm:p-10 rounded-b-xl sm:rounded-b-2xl border border-t-0 border-slate-200 dark:border-slate-800">
                <div className="space-y-6">
                  {style.fullGuide.rows.map((row: any, idx: number) => (
                    <div key={idx} className={`border rounded-xl p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${style.borderColor} bg-slate-50/50 dark:bg-slate-900/50`}>
                      <div className="mb-5 flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-1 shadow-sm bg-white dark:bg-black/40 ${style.color}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-80 ${style.color}`}>
                            {row.panduan ? 'Panduan' : 'Cara Coaching'}
                          </div>
                          <h3 className={`text-lg font-bold leading-tight ${style.color}`}>
                            {row.panduan || row.cara}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mt-4">
                        <div className="space-y-3">
                           <h4 className={`font-semibold text-sm flex items-center gap-2 ${style.color}`}>
                              <Info className="w-4 h-4" />
                              Penjelasan
                           </h4>
                           <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{row.penjelasan}</p>
                        </div>
                        <div className="space-y-3">
                           <h4 className={`font-semibold text-sm flex items-center gap-2 ${style.color}`}>
                              <Target className="w-4 h-4" />
                              {row.caraCoaching ? 'Cara Coaching' : 'Hal yang Dihindari'}
                           </h4>
                           <p className="text-sm leading-relaxed font-medium text-slate-800 dark:text-slate-200">{row.caraCoaching || row.donts}</p>
                        </div>
                        <div className={`space-y-3 p-4 rounded-xl shadow-sm border bg-white dark:bg-black/20 ${style.borderColor}`}>
                           <h4 className={`font-semibold text-sm flex items-center gap-2 ${style.color}`}>
                              <MessageSquareQuote className="w-4 h-4" />
                              Contoh Kalimat
                           </h4>
                           <p className="text-sm leading-relaxed italic text-slate-700 dark:text-slate-300 whitespace-pre-line">
                             {row.contohKalimat || row.contoh}
                           </p> 
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
