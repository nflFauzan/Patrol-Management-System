'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Activity } from 'lucide-react';
import { SurfaceCard } from '../ui/SurfaceCard';
import type { PatrolHourlyActivity } from '@patrol/types';

interface DataPoint {
  time: string;
  hour: string;
  value: number;
  location: string;
}

export interface DashboardActivityChartProps {
  data?: PatrolHourlyActivity[];
}

export const DashboardActivityChart: React.FC<DashboardActivityChartProps> = ({ data }) => {
  const chartData = useMemo<DataPoint[]>(() => {
    const liveData = (data ?? []).filter((d) => d.scanCount > 0);
    if (liveData.length === 0) return [];
    return liveData.map((d) => ({
      time: `${String(d.hour).padStart(2, '0')}:00`,
      hour: `${String(d.hour).padStart(2, '0')}.00`,
      value: d.scanCount,
      location: d.checkpointName ?? 'Checkpoint',
    }));
  }, [data]);

  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);

  useEffect(() => {
    if (chartData.length > 0) {
      setActivePoint(chartData[chartData.length - 1]);
    } else {
      setActivePoint(null);
    }
  }, [chartData]);

  const maxY = useMemo(() => {
    if (chartData.length === 0) return 10;
    const maxVal = Math.max(...chartData.map((d) => d.value));
    return Math.max(10, Math.ceil(maxVal / 5) * 5);
  }, [chartData]);

  const getY = (value: number) => 150 - (value / maxY) * 120;
  const getX = (index: number) => {
    if (chartData.length <= 1) return 250;
    return 40 + index * (430 / (chartData.length - 1));
  };

  const points = chartData.map((d, i) => ({ x: getX(i), y: getY(d.value) }));

  let pathD = '';
  let fillD = '';

  if (points.length === 1) {
    pathD = `M 40 ${points[0].y} L 470 ${points[0].y}`;
    fillD = `M 40 ${points[0].y} L 470 ${points[0].y} L 470 150 L 40 150 Z`;
  } else if (points.length > 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    fillD = `${pathD} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;
  }

  return (
    <SurfaceCard variant="elevated" padding="md" className="flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Aktivitas Patroli
          </h2>
          <p className="text-[11px] text-slate-500">
            Intensitas pemindaian pos berkala hari ini
          </p>
        </div>
        <Link
          href="/validasi-patroli"
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center space-x-1 group transition"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {/* Chart Canvas or Empty State */}
      {chartData.length === 0 ? (
        <div className="relative mt-4 w-full h-[210px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
          <Activity className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
          <p className="text-xs font-semibold text-slate-600">Belum ada aktivitas patroli hari ini</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Pemindaian QR code pos checkpoint akan muncul di grafik ini</p>
        </div>
      ) : (
        <div className="relative mt-4 w-full h-[210px] select-none">
          <svg
            viewBox="0 0 500 180"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.02" />
              </linearGradient>
              <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0284C7" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Grid lines and Y axis values */}
            {[maxY, Math.round(maxY / 2), 0].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1="30"
                    y1={y}
                    x2="480"
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray={val === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x="20"
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={fillD} fill="url(#chartGradient)" />

            {/* Smooth Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#0284C7"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Interactive Nodes */}
            {chartData.map((d, i) => {
              const pt = points[i];
              const isSelected = activePoint?.time === d.time;
              return (
                <g
                  key={d.time}
                  className="cursor-pointer transition-transform"
                  onClick={() => setActivePoint(d)}
                  onMouseEnter={() => setActivePoint(d)}
                >
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="8"
                      fill="#38BDF8"
                      fillOpacity="0.35"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 5.5 : 4}
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth={isSelected ? 3 : 2}
                    filter={isSelected ? 'url(#nodeGlow)' : undefined}
                  />
                </g>
              );
            })}

            {/* X axis labels */}
            {chartData.map((d, i) => {
              const pt = points[i];
              return (
                <text
                  key={d.hour}
                  x={pt.x}
                  y="172"
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {d.hour}
                </text>
              );
            })}
          </svg>

          {/* Dynamic Tooltip Popover */}
          {activePoint && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-sky-200 shadow-skeuo-card pointer-events-none transition-all duration-200">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-800">
                <Clock className="w-3 h-3 text-sky-500" />
                <span>{activePoint.time}</span>
                <span className="text-slate-300">|</span>
                <span className="text-sky-700">{activePoint.location}</span>
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                <span>{activePoint.value} Checkpoint terscan</span>
                <span className="text-emerald-600 font-semibold ml-2">Tercatat</span>
              </div>
            </div>
          )}
        </div>
      )}
    </SurfaceCard>
  );
};
