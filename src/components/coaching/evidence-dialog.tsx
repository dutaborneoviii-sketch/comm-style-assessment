"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2, ExternalLink } from "lucide-react";
import Image from "next/image";

interface EvidenceDialogProps {
  url: string;
  name?: string | null;
}

export function EvidenceDialog({ url, name }: EvidenceDialogProps) {
  const isImage = url.startsWith('data:image/') || url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || (name && name.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i));
  const displayName = name || url;

  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:underline mt-1 text-left w-fit break-all group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md">
        {displayName}
        <Maximize2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[90vw] h-[85vh] p-0 overflow-hidden flex flex-col bg-slate-900 border-none shadow-2xl">
        <DialogHeader className="p-4 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 text-slate-100 flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-slate-100 font-medium truncate pr-4">
              {displayName}
            </DialogTitle>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-slate-800"
              title="Buka di tab baru"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Buka Tab</span>
            </a>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-900/50">
          {isImage ? (
            <img 
              src={url} 
              alt={displayName} 
              className="max-w-full max-h-full object-contain rounded-md shadow-md"
            />
          ) : (
            <iframe 
              src={url} 
              className="w-full h-full rounded-md bg-white"
              title={displayName}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
