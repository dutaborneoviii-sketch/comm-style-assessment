import { Info, Target, MessageSquareQuote, AlertTriangle } from "lucide-react";


export function CombinationGuideCard({ data, colorClass, bgClass, borderClass, lightBgClass, coacheeId, isReadOnly, logs }: any) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className={`p-6 rounded-xl border shadow-sm bg-white/50 dark:bg-black/20 backdrop-blur-sm ${borderClass}`}>
         <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className={`font-bold mb-2 flex items-center gap-2 ${colorClass}`}>
                  Profil Psikologis
                </h4>
                <p className="text-sm text-foreground/80 leading-relaxed">{data.profil}</p>
              </div>
              
              <div className="space-y-1">
                <h5 className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">Apa yang mereka sukai:</h5>
                <p className="text-sm text-foreground/80 leading-relaxed">{data.suka}</p>
              </div>
              
              <div className="space-y-1">
                <h5 className="font-semibold text-sm text-red-600 dark:text-red-400">Apa yang mereka hindari:</h5>
                <p className="text-sm text-foreground/80 leading-relaxed">{data.hindari}</p>
              </div>
            </div>
            
            <div className="flex flex-col justify-center items-start md:items-center p-6 rounded-xl bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/5">
              <h4 className="font-semibold text-muted-foreground uppercase tracking-widest text-xs mb-3 text-center">
                Strategi Coaching Utama
              </h4>
              <div className={`inline-flex px-6 py-3 rounded-xl font-black text-xl text-center shadow-sm ${lightBgClass} ${colorClass}`}>
                &quot;{data.strategi}&quot;
              </div>
            </div>
         </div>
      </div>

      {/* Rows */}
      {data.rows.map((row: any, idx: number) => (
        <div key={idx} className="bg-white/40 dark:bg-black/20 border border-white/20 dark:border-slate-200 rounded-xl p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <h3 className={`text-lg font-bold mb-6 flex items-start sm:items-center gap-3 ${colorClass}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5 sm:mt-0 shadow-sm ${lightBgClass}`}>
              {idx + 1}
            </span>
            <span className="leading-tight">Langkah Coaching</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {row.penjelasan && (
              <div className="space-y-3">
                 <h4 className="font-semibold text-sm text-foreground/80 flex items-center gap-2">
                    <Info className={`w-4 h-4 ${colorClass}`} />
                    Penjelasan
                 </h4>
                 <p className="text-sm leading-relaxed text-muted-foreground">{row.penjelasan}</p>
              </div>
            )}
            <div className={`space-y-3 ${!row.penjelasan ? 'md:col-span-2' : ''}`}>
               <h4 className="font-semibold text-sm text-foreground/80 flex items-center gap-2">
                  <Target className={`w-4 h-4 ${colorClass}`} />
                  Cara Coaching
               </h4>
               <p className="text-sm leading-relaxed text-foreground/90 font-medium">{row.cara}</p>
            </div>
            <div className={`space-y-3 p-4 rounded-xl shadow-sm border ${bgClass} ${borderClass} md:col-span-2`}>
               <h4 className={`font-semibold text-sm flex items-center gap-2 ${colorClass}`}>
                  <MessageSquareQuote className="w-4 h-4" />
                  Contoh Kalimat
               </h4>
               <p className="text-sm leading-relaxed italic text-foreground/90 text-justify">{row.contoh}</p> 
            </div>
            {row.donts && (
              <div className="space-y-3 bg-red-50/50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 md:col-span-2">
                 <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    The Don&apos;ts
                 </h4>
                 <p className="text-sm leading-relaxed text-red-800 dark:text-red-200 text-justify">{row.donts}</p> 
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  )
}
