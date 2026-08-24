"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, Sector } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon, X, User as UserIcon, Calendar, Bookmark, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ChartData {
  name: string;
  count: number;
  departments?: Record<string, number>;
  users?: string[];
}

interface StyleDistributionChartProps {
  data: ChartData[];
  departmentName: string;
  className?: string;
  variant?: 'bar' | 'pie';
}

const COLORS: Record<string, string> = {
  "Direktif (Directive)": "#ef4444",
  "Direktif": "#ef4444",
  "Ekspresif (Expressive)": "#f59e0b",
  "Ekspresif": "#f59e0b",
  "Harmonis (Harmonious)": "#10b981",
  "Harmonis": "#10b981",
  "Analitis (Analytical)": "#3b82f6",
  "Analitis": "#3b82f6",
  "Direktif + Analitis": "#8b5cf6",
  "Ekspresif + Harmonis": "#14b8a6",
  "Direktif + Ekspresif": "#f97316",
  "Harmonis + Analitis": "#0ea5e9",
  "Direktif + Harmonis": "#eab308",
  "Ekspresif + Analitis": "#d946ef",
};

function getDeptAbbr(dept: string): string {
  if (!dept) return dept;
  const d = dept.toLowerCase();
  if (d.includes("sumber daya") || d.includes("sdmuk")) return "SDMUK";
  if (d.includes("kualitas mutu") || d.includes("mutu layanan") || d.includes("kml")) return "KML";
  if (d.includes("jaminan pelayanan") || d.includes("jpk")) return "JPK";
  if (d.includes("penagihan iuran") || d.includes("perencanaan dan keuangan") || d.includes("pk") || d.includes("pikeu")) return "PK";
  if (d.includes(" ti ") || d.endsWith(" ti") || d.includes("ti wilayah") || d.includes("teknologi informasi")) return "TI";
  return dept;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-50 min-w-[200px]">
        <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 gap-4">
          <p className="font-bold text-slate-800 dark:text-slate-100">{data.name}</p>
          <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-700 dark:text-slate-300">
            Total: {data.count}
          </div>
        </div>
        {data.users && data.users.length > 0 ? (
          <div className="space-y-1 mt-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klik grafik untuk melihat daftar</p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Karyawan: {data.count}</p>
          </div>
        ) : data.departments ? (
          <div className="space-y-1.5 mt-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Distribusi Bidang:</p>
            {Object.entries(data.departments).map(([dept, count]) => {
              const displayName = getDeptAbbr(dept);
              return (
                <div key={dept} className="flex justify-between items-center text-sm gap-4">
                  <span className="text-slate-600 dark:text-slate-400">Bidang {displayName}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{count} Orang</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Jumlah: {data.count} Orang</p>
        )}
      </div>
    );
  }
  return null;
};

export function StyleDistributionChart({ data, departmentName, className, variant = 'bar' }: StyleDistributionChartProps) {
  const [selectedStyleData, setSelectedStyleData] = useState<ChartData | null>(null);

  // Sort data by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  if (sortedData.length === 0) {
    return (
      <Card className={cn("col-span-full border-dashed border-2 shadow-sm bg-slate-50 dark:bg-slate-900/50 min-h-[300px] flex flex-col", className)}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-foreground">
            <PieChartIcon className="text-blue-500 w-5 h-5" />
            Distribusi Gaya Komunikasi - {departmentName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-10">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 opacity-50">
            <PieChartIcon className="text-slate-400 w-8 h-8" />
          </div>
          <p className="text-muted-foreground font-medium">Anggota Belum Melakukan Pengisian Kuisioner Gaya Komunikasi</p>
        </CardContent>
      </Card>
    );
  }

  const handleCellClick = (entry: ChartData) => {
    if (entry.users && entry.users.length > 0) {
      setSelectedStyleData(entry);
    }
  };

  return (
    <>
      <Card className={cn("col-span-full border-blue-500/30 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-zinc-950", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <PieChartIcon className="text-blue-500 w-5 h-5" />
            Distribusi Gaya Komunikasi - {departmentName}
          </CardTitle>
          <CardDescription>
            Rekapitulasi hasil asesmen gaya komunikasi seluruh anggota bidang Anda. Klik grafik untuk info detail anggota.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 w-full pb-6">
          <div className="w-full mt-2" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              {variant === 'bar' ? (
                <BarChart
                  data={sortedData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={190}
                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    content={<CustomTooltip />}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                    {sortedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name] || "#6366f1"}
                        onClick={() => handleCellClick(entry)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                  <Pie
                    data={sortedData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {sortedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name] || "#6366f1"}
                        onClick={() => handleCellClick(entry)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={40} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
                    formatter={(value) => <span className="mr-4 inline-block text-slate-600 dark:text-slate-400">{value}</span>}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedStyleData} onOpenChange={(open) => !open && setSelectedStyleData(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xl">
          <DialogHeader className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-black text-[#015249] dark:text-blue-400 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#57BC90]" />
              Detail Anggota: {selectedStyleData?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-semibold mt-1">
              Daftar anggota bidang Anda yang memiliki gaya komunikasi utama "{selectedStyleData?.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200/60 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">Nama Anggota</th>
                    <th className="p-3.5">NPP</th>
                    <th className="p-3.5">Bidang</th>
                    <th className="p-3.5">Gaya Komunikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {selectedStyleData?.users?.map((userStr, idx) => {
                    const [name, npp, dept, style] = userStr.split('@@@');
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors font-medium text-slate-700 dark:text-slate-300">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-zinc-800 text-[#015249] dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                            {name ? name.charAt(0) : 'U'}
                          </div>
                          {name}
                        </td>
                        <td className="p-3.5 text-slate-500 font-semibold">{npp || '-'}</td>
                        <td className="p-3.5">{dept}</td>
                        <td className="p-3.5">
                          <span className="inline-flex px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-extrabold text-[10px]">
                            {style || selectedStyleData.name}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                onClick={() => setSelectedStyleData(null)} 
                className="bg-[#015249] hover:bg-[#57BC90] text-white font-bold px-6 py-2 rounded-xl text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
