'use client';

import { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  color: string;
  unit: string;
  title: string;
}

export default function ProgressChart({ data, color, unit, title }: ProgressChartProps) {
  const { t } = useI18n();
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    // Take last 30 data points
    const recentData = data.slice(-30);

    const values = recentData.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Chart dimensions
    const width = 700;
    const height = 200;
    const padding = 20;

    // Generate points for the line
    const points = recentData.map((point, index) => {
      const x = padding + (index / (recentData.length - 1 || 1)) * (width - 2 * padding);
      const normalizedValue = (point.value - minValue) / range;
      const y = height - padding - normalizedValue * (height - 2 * padding);
      return { x, y, value: point.value, date: point.date };
    });

    // Generate SVG path
    const pathD = points
      .map((point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        return `L ${point.x} ${point.y}`;
      })
      .join(' ');

    // Generate area path (for gradient fill)
    const areaPath = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return {
      points,
      pathD,
      areaPath,
      width,
      height,
      minValue,
      maxValue,
      recentData,
    };
  }, [data]);

  if (!chartData || chartData.recentData.length < 2) {
    return (
      <div className="rounded-3xl border-2 border-white/40 bg-white/70 backdrop-blur-md p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-black">{title}</h3>
        <div className="flex h-48 items-center justify-center text-black">
          {data.length < 2 ? t.statsNeedMoreData : t.noData}
        </div>
      </div>
    );
  }

  const { points, pathD, areaPath, width, height, minValue, maxValue, recentData } = chartData;

  return (
    <div className="rounded-3xl border-2 border-white/40 bg-white/70 backdrop-blur-md p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <div className="flex gap-4 text-sm text-black">
          <span>
            {t.progressChartLowest}: <strong className="text-black">{minValue.toFixed(1)}</strong>
            {unit}
          </span>
          <span>
            {t.progressChartHighest}: <strong className="text-black">{maxValue.toFixed(1)}</strong>
            {unit}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ maxHeight: '200px' }}
        >
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="20"
            y1={height - 20}
            x2={width - 20}
            y2={height - 20}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <line x1="20" y1="20" x2="20" y2={height - 20} stroke="#e5e7eb" strokeWidth="1" />

          {/* Area fill */}
          <path d={areaPath} fill={`url(#gradient-${color})`} />

          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={color}
                className="cursor-pointer hover:r-6 transition-all"
              />
              {/* Tooltip on hover */}
              <title>
                {new Date(point.date).toLocaleDateString()}: {point.value.toFixed(1)}
                {unit}
              </title>
            </g>
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex justify-between text-xs text-black">
        <span>{new Date(recentData[0].date).toLocaleDateString()}</span>
        <span>{new Date(recentData[recentData.length - 1].date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
