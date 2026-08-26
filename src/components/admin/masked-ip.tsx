"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function MaskedIP({ ip }: { ip: string }) {
  const [showFull, setShowFull] = useState(false);
  
  if (!ip || ip === 'Unknown IP') {
    return <span>{ip}</span>;
  }
  
  const maskedIp = ip.replace(/(\d{1,3}\.\d{1,3})\.\d{1,3}\.\d{1,3}/, '$1.***.***');

  return (
    <div className="flex items-center gap-2">
      <span>{showFull ? ip : maskedIp}</span>
      <button 
        onClick={() => setShowFull(!showFull)}
        className="text-slate-400 hover:text-orange-500 transition-colors"
        title={showFull ? "Sembunyikan IP" : "Tampilkan IP Penuh"}
      >
        {showFull ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
