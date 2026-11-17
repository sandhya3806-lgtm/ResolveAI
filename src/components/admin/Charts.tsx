import { useState } from 'react';
import type { Ticket, TicketPriority, TicketStatus } from '../../types/support';

export interface VolumeDayPoint {
  label: string;
  total: number;
  aiResolved: number;
  escalated: number;
}

export function QueryVolumeChart({ data }: { data: VolumeDayPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.total), 10);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5 text-xs text-[#64748B]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#172554]" />
            Total Queries
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#2563EB]" />
            AI Resolved
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#F59E0B]" />
            Escalated
          </span>
        </div>

        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="text-xs font-medium text-[#111827] font-mono tabular-nums">
            {data[hoveredIdx].label}: {data[hoveredIdx].total} total ·{' '}
            {data[hoveredIdx].aiResolved} AI · {data[hoveredIdx].escalated} esc
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pt-4">
        {data.map((point, idx) => {
          const totalH = Math.max(8, Math.round((point.total / maxVal) * 100));
          const aiH = Math.max(4, Math.round((point.aiResolved / maxVal) * 100));
          const escH = Math.max(2, Math.round((point.escalated / maxVal) * 100));
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={point.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex h-full flex-col items-center justify-end rounded-lg px-1 py-1 transition-colors ${
                isHovered ? 'bg-[#F7F9FC]' : ''
              }`}
            >
              <div className="flex w-full max-w-[44px] flex-1 items-end justify-center gap-1">
                <div
                  className="w-2.5 sm:w-3 rounded-t bg-[#172554] transition-all duration-200"
                  style={{ height: `${totalH}%` }}
                  title={`Total: ${point.total}`}
                />
                <div
                  className="w-2.5 sm:w-3 rounded-t bg-[#2563EB] transition-all duration-200"
                  style={{ height: `${aiH}%` }}
                  title={`AI Resolved: ${point.aiResolved}`}
                />
                <div
                  className="w-2 sm:w-2.5 rounded-t bg-[#F59E0B] transition-all duration-200"
                  style={{ height: `${escH}%` }}
                  title={`Escalated: ${point.escalated}`}
                />
              </div>
              <span className="mt-2 font-mono text-[11px] tabular-nums text-[#64748B]">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CategoryBreakdownChart({ tickets }: { tickets: Ticket[] }) {
  const categories = [
    'Billing & Payments',
    'Account Access',
    'Technical Issues',
    'Product Questions',
    'Other',
  ] as const;

  const counts = categories.map((cat) => ({
    name: cat,
    count: tickets.filter((t) => t.detectedCategory === cat).length,
  }));

  const maxCount = Math.max(...counts.map((c) => c.count), 1);
  const total = Math.max(tickets.length, 1);

  return (
    <div className="space-y-3.5">
      {counts.map((item) => {
        const pct = Math.round((item.count / total) * 100);
        const widthPct = Math.round((item.count / maxCount) * 100);
        return (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#111827]">{item.name}</span>
              <span className="font-mono tabular-nums text-[#64748B]">
                {item.count} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                style={{ width: `${Math.max(item.count > 0 ? 6 : 0, widthPct)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function UrgencyDistributionChart({ tickets }: { tickets: Ticket[] }) {
  const priorities: Array<{
    label: TicketPriority;
    color: string;
    barClass: string;
  }> = [
    { label: 'Critical', color: 'text-[#DC2626]', barClass: 'bg-[#DC2626]' },
    { label: 'High', color: 'text-[#D97706]', barClass: 'bg-[#F59E0B]' },
    { label: 'Medium', color: 'text-[#2563EB]', barClass: 'bg-[#2563EB]' },
    { label: 'Low', color: 'text-[#64748B]', barClass: 'bg-slate-400' },
  ];

  const total = Math.max(tickets.length, 1);

  return (
    <div className="space-y-4">
      {/* Stacked proportional bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {priorities.map((p) => {
          const count = tickets.filter((t) => t.priority === p.label).length;
          const pct = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={p.label}
              className={`${p.barClass} transition-all duration-300`}
              style={{ width: `${pct}%` }}
              title={`${p.label}: ${count}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {priorities.map((p) => {
          const count = tickets.filter((t) => t.priority === p.label).length;
          const pct = Math.round((count / total) * 100);
          return (
            <div
              key={p.label}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-[#F7F9FC] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${p.barClass}`} />
                <span className={`text-xs font-medium ${p.color}`}>
                  {p.label}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold tabular-nums text-[#111827]">
                {count} <span className="font-normal text-[#64748B]">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StatusDistributionChart({ tickets }: { tickets: Ticket[] }) {
  const statuses: Array<{ status: TicketStatus; color: string }> = [
    { status: 'AI Answered', color: '#16A34A' },
    { status: 'Resolved', color: '#172554' },
    { status: 'Escalated', color: '#DC2626' },
    { status: 'In Progress', color: '#2563EB' },
    { status: 'Waiting for Customer', color: '#F59E0B' },
    { status: 'New', color: '#64748B' },
  ];

  const total = Math.max(tickets.length, 1);

  return (
    <div className="space-y-3">
      {statuses.map((item) => {
        const count = tickets.filter((t) => t.status === item.status).length;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={item.status} className="flex items-center gap-3 text-xs">
            <span className="w-36 shrink-0 font-medium text-[#111827] truncate">
              {item.status}
            </span>
            <div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(count > 0 ? 5 : 0, pct)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
            <span className="w-16 text-right font-mono tabular-nums text-[#64748B]">
              {count} · {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
