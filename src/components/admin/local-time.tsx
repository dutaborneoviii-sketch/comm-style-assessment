"use client";

import { useEffect, useState } from "react";

export function LocalTime({ date, format = 'time' }: { date: Date | string, format?: 'date' | 'time' | 'full' }) {
  const [mounted, setMounted] = useState(false);
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    setMounted(true);
    const d = new Date(date);
    
    if (format === 'date') {
      setFormatted(d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }));
    } else if (format === 'time') {
      setFormatted(d.toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit', second:'2-digit' }) + ' ' + getWIBWITAString(d));
    } else {
      setFormatted(d.toLocaleString('id-ID'));
    }
  }, [date, format]);

  // Fallback string for SSR (server rendering) to prevent layout shift, using UTC + 7 as a safe guess for WIB
  const fallbackDate = new Date(date);
  fallbackDate.setHours(fallbackDate.getHours() + 7);
  
  if (!mounted) {
    if (format === 'date') return <span>{fallbackDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>;
    if (format === 'time') return <span>{fallbackDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit', second:'2-digit', timeZone: 'UTC' })} WIB</span>;
    return <span>{fallbackDate.toLocaleString('id-ID', { timeZone: 'UTC' })}</span>;
  }

  return <span>{formatted}</span>;
}

function getWIBWITAString(d: Date) {
  const offset = d.getTimezoneOffset() / -60;
  if (offset === 7) return 'WIB';
  if (offset === 8) return 'WITA';
  if (offset === 9) return 'WIT';
  return '';
}
