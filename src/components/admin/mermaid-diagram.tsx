"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Loader2 } from "lucide-react";

interface MermaidProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState<boolean>(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        primaryColor: '#ffffff',
        primaryTextColor: '#000000',
        primaryBorderColor: '#000000',
        lineColor: '#000000',
        secondaryColor: '#ffffff',
        tertiaryColor: '#ffffff',
        fontFamily: 'Times New Roman, serif',
      },
      securityLevel: "loose",
    });

    const renderChart = async () => {
      if (ref.current) {
        try {
          const { svg } = await mermaid.render(`mermaid-svg-${Date.now()}`, chart);
          ref.current.innerHTML = svg;
          setRendered(true);
        } catch (error) {
          console.error("Mermaid parsing error", error);
        }
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="w-full h-full flex items-center justify-center min-h-[500px] overflow-auto relative rounded-xl bg-slate-50 dark:bg-zinc-900/50 p-8 border border-slate-100 dark:border-slate-800">
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      <div ref={ref} className="mermaid-diagram w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto" />
    </div>
  );
}
