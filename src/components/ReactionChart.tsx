'use client';

import { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';

interface ReactionChartProps {
  data: number[]; // 每次成绩,按时间顺序
  unit?: string; // y 轴单位(默认 ms)
  caption?: string; // 图下方说明(默认「越低越快」)
}

export default function ReactionChart({ data, unit = 'ms', caption }: ReactionChartProps) {
  const { t } = useI18n();

  const chart = useMemo(() => {
    if (data.length < 2) return null;
    const values = data.slice(-30);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // 好看的整数刻度(100/200/300…)
    const rawStep = (max - min || 1) / 3;
    const mag = 10 ** Math.floor(Math.log10(rawStep));
    const norm = rawStep / mag;
    let step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    // 保证最小整数步长;毫秒级数据自然得到 50/100 等粗刻度,小数值(关卡/得分)保留 1/2/5
    if (step < 1) step = 1;
    let yLo = Math.floor(min / step) * step;
    let yHi = Math.ceil(max / step) * step;
    if (yLo === yHi) {
      yLo -= step;
      yHi += step;
    }

    const W = 720;
    const H = 220;
    const padL = 56;
    const padR = 16;
    const padT = 22;
    const padB = 30;
    const innerH = H - padT - padB;

    const x = (i: number) => padL + (i * (W - padL - padR)) / (values.length - 1);
    const y = (v: number) => padT + ((yHi - v) / (yHi - yLo)) * innerH;

    const points = values.map((v, i) => ({ x: x(i), y: y(v), v }));
    const lineD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const ticks: { y: number; label: number }[] = [];
    for (let v = yLo; v <= yHi + step * 0.5; v += step) {
      ticks.push({ y: y(v), label: Math.round(v) });
    }

    return { points, lineD, ticks, W, H, padL, padR, padT, padB, count: values.length };
  }, [data]);

  if (!chart) return null;

  const { points, lineD, ticks, W, H, padL, padR, padT, padB, count } = chart;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={t.progressChartTitle}
      >
        {/* 网格 + y 轴刻度 */}
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={padL} y1={tk.y} x2={W - padR} y2={tk.y} stroke="rgba(148,163,184,0.14)" strokeWidth="1" />
            <text x={padL - 8} y={tk.y + 4} textAnchor="end" fontSize="11" fill="#64748b" className="tabular-nums">
              {tk.label}
            </text>
          </g>
        ))}

        {/* 坐标轴 */}
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(148,163,184,0.35)" strokeWidth="1" />

        {/* 折线 + 点 */}
        <path d={lineD} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#22d3ee" stroke="#0a0e17" strokeWidth="1.5">
            <title>{`${p.v} ${unit}`}</title>
          </circle>
        ))}

        {/* y 轴单位 */}
        <text x={padL - 8} y={padT - 6} textAnchor="end" fontSize="11" fill="#64748b">
          {unit}
        </text>

        {/* x 轴标签 */}
        <text x={padL} y={H - padB + 18} textAnchor="middle" fontSize="11" fill="#64748b">
          #1
        </text>
        <text x={W - padR} y={H - padB + 18} textAnchor="middle" fontSize="11" fill="#64748b">
          #{count}
        </text>
      </svg>
      <p className="mt-2 text-xs text-text-tertiary">{caption ?? t.chartLowerBetter}</p>
    </div>
  );
}
