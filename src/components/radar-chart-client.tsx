"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}

export function RadarChartClient({ data }: { data: RadarData[] }) {
  // Custom label to format text styles (make it bold, distinct color, etc.)
  const renderCustomAxisTick = ({ x, y, payload }: any) => {
    return (
      <text x={x} y={y + 4} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={600}>
        {payload.value}
        <tspan x={x} y={y + 18} fill="#334155">{data.find(d => d.subject === payload.value)?.A}%</tspan>
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
        <defs>
          <linearGradient id="colorRadar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
          </linearGradient>
          <linearGradient id="strokeRadar" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity={1}/>
            <stop offset="50%" stopColor="#2563eb" stopOpacity={1}/>
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={1}/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2" />
          </filter>
        </defs>
        <PolarGrid gridType="polygon" stroke="#cbd5e1" strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="subject" tick={renderCustomAxisTick} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip 
          cursor={{fill: 'transparent'}} 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
        />
        <Radar 
          name="Skor" 
          dataKey="A" 
          stroke="url(#strokeRadar)" 
          strokeWidth={3} 
          fill="url(#colorRadar)" 
          fillOpacity={0.7} 
          filter="url(#shadow)"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
