"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubordinateNode {
  id: string;
  name: string;
  position: string | null;
  department: string | null;
  primaryStyle: string | null;
  secondaryStyle: string | null;
  isCombination: boolean;
}

interface StyleQuadrantMapProps {
  members: SubordinateNode[];
  className?: string;
}

// Pseudo-random number generator to prevent hydration mismatch while scattering overlapping dots
function seededRandom(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  // Return value between -1 and 1
  return ((h % 100) / 50) - 1;
}

const STYLE_COORDINATES: Record<string, { x: number, y: number }> = {
  "Direktif": { x: 25, y: 25 },
  "Ekspresif": { x: 75, y: 25 },
  "Harmonis": { x: 75, y: 75 },
  "Analitis": { x: 25, y: 75 },
  
  // Combinations
  "Direktif + Ekspresif": { x: 50, y: 25 },
  "Ekspresif + Direktif": { x: 50, y: 25 },
  
  "Harmonis + Analitis": { x: 50, y: 75 },
  "Analitis + Harmonis": { x: 50, y: 75 },
  
  "Direktif + Analitis": { x: 25, y: 50 },
  "Analitis + Direktif": { x: 25, y: 50 },
  
  "Ekspresif + Harmonis": { x: 75, y: 50 },
  "Harmonis + Ekspresif": { x: 75, y: 50 },
  
  // Diagonal combinations (rare)
  "Direktif + Harmonis": { x: 50, y: 50 },
  "Harmonis + Direktif": { x: 50, y: 50 },
  "Ekspresif + Analitis": { x: 50, y: 50 },
  "Analitis + Ekspresif": { x: 50, y: 50 },
};

const STYLE_COLORS: Record<string, string> = {
  "Direktif": "#ef4444",
  "Ekspresif": "#f59e0b",
  "Harmonis": "#10b981",
  "Analitis": "#3b82f6",
  "Direktif + Ekspresif": "#f97316",
  "Direktif + Analitis": "#8b5cf6",
  "Harmonis + Analitis": "#0ea5e9",
  "Ekspresif + Harmonis": "#14b8a6",
  "Direktif + Harmonis": "#eab308",
  "Ekspresif + Analitis": "#d946ef",
};

export function StyleQuadrantMap({ members, className }: StyleQuadrantMapProps) {
  const [hoveredMember, setHoveredMember] = useState<SubordinateNode | null>(null);

  const mappedMembers = useMemo(() => {
    return members
      .filter(m => m.primaryStyle) // Only map members who have taken the assessment
      .map(member => {
        let x = 50;
        let y = 50;
        let color = "#94a3b8"; // default slate

        if (member.isCombination && member.secondaryStyle) {
          const comboKey1 = `${member.primaryStyle} + ${member.secondaryStyle}`;
          const comboKey2 = `${member.secondaryStyle} + ${member.primaryStyle}`;
          
          const coords = STYLE_COORDINATES[comboKey1] || STYLE_COORDINATES[comboKey2];
          if (coords) {
            x = coords.x;
            y = coords.y;
          }
          // Blend colors or just use primary for border
          color = STYLE_COLORS[member.primaryStyle as string] || color;
        } else if (member.primaryStyle) {
          const coords = STYLE_COORDINATES[member.primaryStyle];
          if (coords) {
            x = coords.x;
            y = coords.y;
          }
          color = STYLE_COLORS[member.primaryStyle] || color;
        }

        // Add jitter so dots don't perfectly overlap
        // Jitter up to ±6%
        const jitterX = seededRandom(member.id + "x") * 6;
        const jitterY = seededRandom(member.id + "y") * 6;

        // Keep within bounds
        const finalX = Math.max(5, Math.min(95, x + jitterX));
        const finalY = Math.max(5, Math.min(95, y + jitterY));

        return {
          ...member,
          x: finalX,
          y: finalY,
          color,
          displayStyle: member.isCombination ? `${member.primaryStyle} + ${member.secondaryStyle}` : member.primaryStyle
        };
      });
  }, [members]);

  return (
    <Card className={cn("w-full border-[#57BC90]/30 dark:border-[#57BC90]/20 shadow-lg relative overflow-hidden bg-white dark:bg-zinc-950 flex flex-col", className)}>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#57BC90]/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
      
      <CardHeader className="pb-3 z-10 relative">
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
          <Map className="text-[#57BC90] w-5 h-5" />
          Peta Posisi Gaya Komunikasi
        </CardTitle>
        <CardDescription>
          Visualisasi kuadran memetakan anggota tim Anda berdasarkan gaya komunikasi dominan mereka.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 w-full pb-6 z-10 relative flex flex-col items-center">
        {/* Venn Diagram Map Container */}
        <div className="relative w-full max-w-[500px] aspect-square rounded-2xl bg-white dark:bg-zinc-950 mt-2 border border-slate-100 dark:border-slate-800">
          
          {/* Decorative Background for map if needed, but remove overflow-hidden to allow tooltips to escape */}
          {/* Direktif (Top-Left) */}
          <div className="absolute top-[5%] left-[5%] w-[60%] h-[60%] rounded-full bg-red-500/10 dark:bg-red-500/20 border-2 border-red-500/30 dark:border-red-500/40 mix-blend-multiply dark:mix-blend-screen transition-all hover:bg-red-500/20"></div>
          {/* Ekspresif (Top-Right) */}
          <div className="absolute top-[5%] right-[5%] w-[60%] h-[60%] rounded-full bg-amber-500/10 dark:bg-amber-500/20 border-2 border-amber-500/30 dark:border-amber-500/40 mix-blend-multiply dark:mix-blend-screen transition-all hover:bg-amber-500/20"></div>
          {/* Harmonis (Bottom-Right) */}
          <div className="absolute bottom-[5%] right-[5%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-emerald-500/30 dark:border-emerald-500/40 mix-blend-multiply dark:mix-blend-screen transition-all hover:bg-emerald-500/20"></div>
          {/* Analitis (Bottom-Left) */}
          <div className="absolute bottom-[5%] left-[5%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-500/20 border-2 border-blue-500/30 dark:border-blue-500/40 mix-blend-multiply dark:mix-blend-screen transition-all hover:bg-blue-500/20"></div>

          {/* Style Labels */}
          <div className="absolute top-[18%] left-[18%] text-sm sm:text-base font-black text-red-600 dark:text-red-400 transform -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
            Direktif
          </div>
          <div className="absolute top-[18%] right-[18%] text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 transform translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
            Ekspresif
          </div>
          <div className="absolute bottom-[18%] right-[18%] text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 transform translate-x-1/2 translate-y-1/2 opacity-70 pointer-events-none">
            Harmonis
          </div>
          <div className="absolute bottom-[18%] left-[18%] text-sm sm:text-base font-black text-[#015249] dark:text-blue-400 transform -translate-x-1/2 translate-y-1/2 opacity-70 pointer-events-none">
            Analitis
          </div>

          {/* Data Points */}
          {mappedMembers.map((member) => (
            <div
              key={member.id}
              className="absolute group"
              style={{
                left: `${member.x}%`,
                top: `${member.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: hoveredMember?.id === member.id ? 50 : 10
              }}
              onMouseEnter={() => setHoveredMember(member)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              {/* Member Dot */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer transition-transform hover:scale-125 hover:shadow-xl border-2 border-white dark:border-zinc-800"
                style={{ backgroundColor: member.color }}
              >
                {member.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>

              {/* Tooltip */}
              {hoveredMember?.id === member.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl min-w-[200px] z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 mb-1 border-b border-slate-700 dark:border-slate-300 pb-2">
                    <User className="w-4 h-4 opacity-70" />
                    <span className="font-bold truncate">{member.name}</span>
                  </div>
                  <div className="space-y-1 mt-2">
                    <p className="text-xs opacity-90 truncate">{member.position}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }}></div>
                      <p className="text-[11px] font-bold uppercase tracking-wider">{member.displayStyle}</p>
                    </div>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-slate-800 dark:border-t-slate-100"></div>
                </div>
              )}
            </div>
          ))}
          
          {mappedMembers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <Map className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Belum ada data gaya komunikasi</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
