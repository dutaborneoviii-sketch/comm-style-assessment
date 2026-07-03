import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Target, MessageSquareQuote } from "lucide-react";
import { 
  directiveGuide, expressiveGuide, harmoniousGuide, analyticalGuide,
  dirAnaGuide, eksHarGuide, dirEksGuide, harAnaGuide, dirHarGuide 
} from "./data";
import { CombinationGuideCard } from "./CombinationCard";

// Reusable component for Primary Styles
function GuideRowCards({ rows, colorClass, bgClass, borderClass, lightBgClass }: any) {
  return (
    <div className="space-y-6">
      {rows.map((row: any, idx: number) => (
        <div key={idx} className="bg-white/40 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          {/* Index Circle & Title */}
          <h3 className={`text-lg font-bold mb-6 flex items-start sm:items-center gap-3 ${colorClass}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5 sm:mt-0 shadow-sm ${lightBgClass}`}>
              {idx + 1}
            </span>
            <span className="leading-tight">{row.panduan}</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-3">
               <h4 className="font-semibold text-sm text-foreground/80 flex items-center gap-2">
                  <Info className={`w-4 h-4 ${colorClass}`} />
                  Penjelasan
               </h4>
               <p className="text-sm leading-relaxed text-muted-foreground">{row.penjelasan}</p>
            </div>
            <div className="space-y-3">
               <h4 className="font-semibold text-sm text-foreground/80 flex items-center gap-2">
                  <Target className={`w-4 h-4 ${colorClass}`} />
                  Cara Coaching
               </h4>
               <p className="text-sm leading-relaxed text-foreground/90 font-medium">{row.caraCoaching}</p>
            </div>
            <div className={`space-y-3 p-4 rounded-xl shadow-sm border ${bgClass} ${borderClass}`}>
               <h4 className={`font-semibold text-sm flex items-center gap-2 ${colorClass}`}>
                  <MessageSquareQuote className="w-4 h-4" />
                  Contoh Kalimat
               </h4>
               <p className="text-sm leading-relaxed italic text-foreground/90">{row.contohKalimat}</p> 
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function GuidePage() {
  return (
    <div className="container mx-auto py-6 md:py-10 px-4 md:px-6 max-w-6xl relative">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      
      <Tabs defaultValue="direktif" className="w-full">
        {/* Sticky Header */}
        <div className="sticky top-16 z-40 pt-4 pb-6 bg-gradient-to-r from-indigo-100/95 via-purple-100/95 to-blue-100/95 dark:from-indigo-900/95 dark:via-purple-900/95 dark:to-blue-900/95 backdrop-blur-xl -mx-4 px-4 md:-mx-6 md:px-6 border-b border-indigo-200 dark:border-indigo-800 mb-8 rounded-b-3xl shadow-md">
          <div className="space-y-3 mb-6 text-center flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 drop-shadow-sm">
              Panduan Coaching
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Panduan praktis untuk menangani dan melakukan coaching pada masing-masing gaya komunikasi.
            </p>
          </div>

          <TabsList className="flex flex-col w-full h-auto p-0 bg-transparent gap-6 items-center mt-8">
            {/* Chips Group 1: Gaya Utama */}
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center gap-4 mb-4 w-full max-w-2xl">
                <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-900/50"></div>
                <span className="text-xs font-black text-indigo-700/60 dark:text-indigo-300/60 uppercase tracking-[0.2em]">Gaya Utama</span>
                <div className="h-px flex-1 bg-indigo-200 dark:bg-indigo-900/50"></div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
                <TabsTrigger value="direktif" className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-800 shadow-sm hover:shadow-md hover:border-indigo-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500 data-[state=active]:border-indigo-600 data-[state=active]:shadow-lg transition-all font-semibold text-sm">Direktif (A)</TabsTrigger>
                <TabsTrigger value="ekspresif" className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-800 shadow-sm hover:shadow-md hover:border-indigo-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500 data-[state=active]:border-indigo-600 data-[state=active]:shadow-lg transition-all font-semibold text-sm">Ekspresif (B)</TabsTrigger>
                <TabsTrigger value="harmonis" className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-800 shadow-sm hover:shadow-md hover:border-indigo-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500 data-[state=active]:border-indigo-600 data-[state=active]:shadow-lg transition-all font-semibold text-sm">Harmonis (C)</TabsTrigger>
                <TabsTrigger value="analitis" className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-800 shadow-sm hover:shadow-md hover:border-indigo-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500 data-[state=active]:border-indigo-600 data-[state=active]:shadow-lg transition-all font-semibold text-sm">Analitis (D)</TabsTrigger>
              </div>
            </div>

            {/* Chips Group 2: Kombinasi Gaya */}
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center gap-4 mb-4 w-full max-w-3xl">
                <div className="h-px flex-1 bg-purple-200 dark:bg-purple-900/50"></div>
                <span className="text-xs font-black text-purple-700/60 dark:text-purple-300/60 uppercase tracking-[0.2em]">Kombinasi Gaya</span>
                <div className="h-px flex-1 bg-purple-200 dark:bg-purple-900/50"></div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
                <TabsTrigger value="dir-ana" className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-purple-100 dark:border-purple-800 shadow-sm hover:shadow-md hover:border-purple-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=active]:bg-purple-500 data-[state=active]:border-purple-600 data-[state=active]:shadow-lg transition-all font-semibold text-sm">Direktif + Analitis</TabsTrigger>
                <TabsTrigger value="eks-har" className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-purple-100 dark:border-purple-800 shadow-sm hover:shadow-md hover:border-purple-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=active]:bg-purple-500 data-[state=active]:border-purple-600 data-[state=active]:shadow-lg transition-all font-semibold text-sm">Ekspresif + Harmonis</TabsTrigger>
                <TabsTrigger value="dir-eks" className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-purple-100 dark:border-purple-800 shadow-sm hover:shadow-md hover:border-purple-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=active]:bg-purple-500 data-[state=active]:border-purple-600 data-[state=active]:shadow-lg transition-all font-semibold text-sm">Direktif + Ekspresif</TabsTrigger>
                <TabsTrigger value="har-ana" className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-purple-100 dark:border-purple-800 shadow-sm hover:shadow-md hover:border-purple-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=active]:bg-purple-500 data-[state=active]:border-purple-600 data-[state=active]:shadow-lg transition-all font-semibold text-sm">Harmonis + Analitis</TabsTrigger>
                <TabsTrigger value="dir-har" className="rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-purple-100 dark:border-purple-800 shadow-sm hover:shadow-md hover:border-purple-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white dark:data-[state=active]:bg-purple-500 data-[state=active]:border-purple-600 data-[state=active]:shadow-lg transition-all font-semibold text-sm">Direktif + Harmonis</TabsTrigger>
              </div>
            </div>
          </TabsList>
        </div>

        {/* PRIMARY STYLES */}
        <TabsContent value="direktif" className="space-y-6">
          <Card className="glass-card border-red-500/20 shadow-xl overflow-hidden bg-white/60 dark:bg-zinc-950/60">
            <CardHeader className="px-6 sm:px-10 pt-8 pb-6 bg-red-500/5 border-b border-red-500/10">
              <CardTitle className="text-2xl text-red-600 dark:text-red-500 font-black tracking-wide">{directiveGuide.title}</CardTitle>
              <CardDescription className="text-base mt-3 leading-relaxed text-muted-foreground max-w-4xl">
                {directiveGuide.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 bg-gradient-to-b from-transparent to-red-50/30 dark:to-red-950/10">
              <GuideRowCards 
                rows={directiveGuide.rows} 
                colorClass="text-red-600 dark:text-red-400" 
                bgClass="bg-red-50 dark:bg-red-950/30"
                borderClass="border-red-100 dark:border-red-900/50"
                lightBgClass="bg-red-100 dark:bg-red-900/50"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ekspresif" className="space-y-6">
          <Card className="glass-card border-amber-500/20 shadow-xl overflow-hidden bg-white/60 dark:bg-zinc-950/60">
            <CardHeader className="px-6 sm:px-10 pt-8 pb-6 bg-amber-500/5 border-b border-amber-500/10">
              <CardTitle className="text-2xl text-amber-600 dark:text-amber-500 font-black tracking-wide">{expressiveGuide.title}</CardTitle>
              <CardDescription className="text-base mt-3 leading-relaxed text-muted-foreground max-w-4xl">
                {expressiveGuide.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 bg-gradient-to-b from-transparent to-amber-50/30 dark:to-amber-950/10">
              <GuideRowCards 
                rows={expressiveGuide.rows} 
                colorClass="text-amber-600 dark:text-amber-400" 
                bgClass="bg-amber-50 dark:bg-amber-950/30"
                borderClass="border-amber-100 dark:border-amber-900/50"
                lightBgClass="bg-amber-100 dark:bg-amber-900/50"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="harmonis" className="space-y-6">
          <Card className="glass-card border-emerald-500/20 shadow-xl overflow-hidden bg-white/60 dark:bg-zinc-950/60">
            <CardHeader className="px-6 sm:px-10 pt-8 pb-6 bg-emerald-500/5 border-b border-emerald-500/10">
              <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-500 font-black tracking-wide">{harmoniousGuide.title}</CardTitle>
              <CardDescription className="text-base mt-3 leading-relaxed text-muted-foreground max-w-4xl">
                {harmoniousGuide.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 bg-gradient-to-b from-transparent to-emerald-50/30 dark:to-emerald-950/10">
              <GuideRowCards 
                rows={harmoniousGuide.rows} 
                colorClass="text-emerald-600 dark:text-emerald-400" 
                bgClass="bg-emerald-50 dark:bg-emerald-950/30"
                borderClass="border-emerald-100 dark:border-emerald-900/50"
                lightBgClass="bg-emerald-100 dark:bg-emerald-900/50"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analitis" className="space-y-6">
          <Card className="glass-card border-blue-500/20 shadow-xl overflow-hidden bg-white/60 dark:bg-zinc-950/60">
            <CardHeader className="px-6 sm:px-10 pt-8 pb-6 bg-blue-500/5 border-b border-blue-500/10">
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-500 font-black tracking-wide">{analyticalGuide.title}</CardTitle>
              <CardDescription className="text-base mt-3 leading-relaxed text-muted-foreground max-w-4xl">
                {analyticalGuide.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 bg-gradient-to-b from-transparent to-blue-50/30 dark:to-blue-950/10">
              <GuideRowCards 
                rows={analyticalGuide.rows} 
                colorClass="text-blue-600 dark:text-blue-400" 
                bgClass="bg-blue-50 dark:bg-blue-950/30"
                borderClass="border-blue-100 dark:border-blue-900/50"
                lightBgClass="bg-blue-100 dark:bg-blue-900/50"
              />
            </CardContent>
          </Card>
        </TabsContent>


        {/* COMBINATION STYLES */}
        <TabsContent value="dir-ana" className="space-y-6">
          <Card className="glass-card border-indigo-500/30 shadow-xl overflow-hidden bg-white/60 dark:bg-zinc-950/60">
            <CardHeader className="px-6 sm:px-10 pt-8 pb-6 bg-indigo-500/5 border-b border-indigo-500/10">
              <CardTitle className="text-2xl text-indigo-700 dark:text-indigo-400 font-black tracking-wide">{dirAnaGuide.title}</CardTitle>
              <CardDescription className="text-base mt-3 leading-relaxed text-muted-foreground max-w-4xl">
                {dirAnaGuide.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 bg-gradient-to-b from-transparent to-indigo-50/30 dark:to-indigo-950/10">
              <CombinationGuideCard 
                data={dirAnaGuide}
                colorClass="text-indigo-700 dark:text-indigo-400" 
                bgClass="bg-indigo-50 dark:bg-indigo-950/30"
                borderClass="border-indigo-100 dark:border-indigo-900/50"
                lightBgClass="bg-indigo-100 dark:bg-indigo-900/50"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eks-har" className="space-y-6">
          <Card className="glass-card border-orange-500/30 shadow-xl overflow-hidden bg-white/60 dark:bg-zinc-950/60">
            <CardHeader className="px-6 sm:px-10 pt-8 pb-6 bg-orange-500/5 border-b border-orange-500/10">
              <CardTitle className="text-2xl text-orange-600 dark:text-orange-500 font-black tracking-wide">{eksHarGuide.title}</CardTitle>
              <CardDescription className="text-base mt-3 leading-relaxed text-muted-foreground max-w-4xl">
                {eksHarGuide.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 bg-gradient-to-b from-transparent to-orange-50/30 dark:to-orange-950/10">
              <CombinationGuideCard 
                data={eksHarGuide}
                colorClass="text-orange-600 dark:text-orange-500" 
                bgClass="bg-orange-50 dark:bg-orange-950/30"
                borderClass="border-orange-100 dark:border-orange-900/50"
                lightBgClass="bg-orange-100 dark:bg-orange-900/50"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dir-eks" className="space-y-6">
          <Card className="glass-card border-rose-500/30 shadow-xl overflow-hidden bg-white/60 dark:bg-zinc-950/60">
            <CardHeader className="px-6 sm:px-10 pt-8 pb-6 bg-rose-500/5 border-b border-rose-500/10">
              <CardTitle className="text-2xl text-rose-600 dark:text-rose-500 font-black tracking-wide">{dirEksGuide.title}</CardTitle>
              <CardDescription className="text-base mt-3 leading-relaxed text-muted-foreground max-w-4xl">
                {dirEksGuide.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 bg-gradient-to-b from-transparent to-rose-50/30 dark:to-rose-950/10">
              <CombinationGuideCard 
                data={dirEksGuide}
                colorClass="text-rose-600 dark:text-rose-500" 
                bgClass="bg-rose-50 dark:bg-rose-950/30"
                borderClass="border-rose-100 dark:border-rose-900/50"
                lightBgClass="bg-rose-100 dark:bg-rose-900/50"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="har-ana" className="space-y-6">
          <Card className="glass-card border-teal-500/30 shadow-xl overflow-hidden bg-white/60 dark:bg-zinc-950/60">
            <CardHeader className="px-6 sm:px-10 pt-8 pb-6 bg-teal-500/5 border-b border-teal-500/10">
              <CardTitle className="text-2xl text-teal-600 dark:text-teal-500 font-black tracking-wide">{harAnaGuide.title}</CardTitle>
              <CardDescription className="text-base mt-3 leading-relaxed text-muted-foreground max-w-4xl">
                {harAnaGuide.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 bg-gradient-to-b from-transparent to-teal-50/30 dark:to-teal-950/10">
              <CombinationGuideCard 
                data={harAnaGuide}
                colorClass="text-teal-600 dark:text-teal-500" 
                bgClass="bg-teal-50 dark:bg-teal-950/30"
                borderClass="border-teal-100 dark:border-teal-900/50"
                lightBgClass="bg-teal-100 dark:bg-teal-900/50"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dir-har" className="space-y-6">
          <Card className="glass-card border-violet-500/30 shadow-xl overflow-hidden bg-white/60 dark:bg-zinc-950/60">
            <CardHeader className="px-6 sm:px-10 pt-8 pb-6 bg-violet-500/5 border-b border-violet-500/10">
              <CardTitle className="text-2xl text-violet-600 dark:text-violet-500 font-black tracking-wide">{dirHarGuide.title}</CardTitle>
              <CardDescription className="text-base mt-3 leading-relaxed text-muted-foreground max-w-4xl">
                {dirHarGuide.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 bg-gradient-to-b from-transparent to-violet-50/30 dark:to-violet-950/10">
              <CombinationGuideCard 
                data={dirHarGuide}
                colorClass="text-violet-600 dark:text-violet-500" 
                bgClass="bg-violet-50 dark:bg-violet-950/30"
                borderClass="border-violet-100 dark:border-violet-900/50"
                lightBgClass="bg-violet-100 dark:bg-violet-900/50"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
