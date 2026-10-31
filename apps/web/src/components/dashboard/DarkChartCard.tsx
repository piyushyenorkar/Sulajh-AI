import React, { useState, useId } from 'react';
import { ChartPoint, CHART_DATA_BY_TIMEFRAME } from '../../data/merchantDashboardData';

interface DarkChartCardProps {
  onTimeframeChange?: (tf: string) => void;
}

export const DarkChartCard: React.FC<DarkChartCardProps> = () => {
  const [timeframe, setTimeframe] = useState<string>('1M');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradientId = useId();

  const data: ChartPoint[] = CHART_DATA_BY_TIMEFRAME[timeframe] || CHART_DATA_BY_TIMEFRAME['1M'];

  // SVG coordinates calculation
  const width = 600;
  const height = 180;
  const paddingX = 20;
  const paddingY = 30;

  const amounts = data.map((d) => d.amount);
  const minVal = Math.min(...amounts) * 0.85;
  const maxVal = Math.max(...amounts) * 1.1;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.amount - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // Generate smooth SVG path
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 2] || points[0];

  return (
    <div className="bg-[#111217] border border-white/5 rounded-[24px] p-6 text-white flex flex-col justify-between relative overflow-hidden group shadow-lg">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header: Title on Left, Timeframe Pills on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Settlement performance
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Daily payout clearing volume & bank delivery timeline
          </p>
        </div>

        {/* Segmented Time Control Pills */}
        <div className="inline-flex items-center p-1 rounded-full bg-white/10 backdrop-blur-md self-start sm:self-auto">
          {['1D', '1W', '1M', '3M', 'All'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                setTimeframe(tf);
                setHoverIndex(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative w-full h-48 sm:h-52 z-10 flex flex-col justify-end">
        
        {/* Floating Tooltip matching Reference Screenshot */}
        {activePoint && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
            style={{ left: `${(activePoint.x / width) * 100}%`, top: `${activePoint.y - 12}px` }}
          >
            <div className="bg-white text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold shadow-xl whitespace-nowrap flex items-center gap-1.5">
              <span>₹{activePoint.amount.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 font-medium font-mono">({activePoint.label})</span>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#1E3A8A" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#111217" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Main Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#93C5FD"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Hover Guide Line */}
          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                y1={activePoint.y}
                x2={activePoint.x}
                y2={height - 20}
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill="#3B82F6"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                className="animate-pulse"
              />
            </>
          )}

          {/* Invisible Hover Rectangles across segments */}
          {points.map((pt, i) => {
            const segWidth = width / points.length;
            return (
              <rect
                key={i}
                x={pt.x - segWidth / 2}
                y={0}
                width={segWidth}
                height={height}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}
        </svg>

        {/* X-Axis Labels at Bottom */}
        <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-medium text-slate-400 mt-2 px-2 select-none">
          {points.map((p, i) => (
            <span
              key={p.label}
              className={`${i % 2 === 1 && points.length > 7 ? 'hidden sm:inline' : 'inline'}`}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

