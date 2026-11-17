import { useState } from 'react';
import type { Ticket } from '../../types/support';
import {
  CategoryBreakdownChart,
  QueryVolumeChart,
  StatusDistributionChart,
  UrgencyDistributionChart,
  type VolumeDayPoint,
} from './Charts';

interface AnalyticsPageProps {
  tickets: Ticket[];
}

export function AnalyticsPage({ tickets }: AnalyticsPageProps) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');

  const total = tickets.length;
  const aiResolved = tickets.filter(
    (t) =>
      !t.aiAnalysis.requiresEscalation &&
      (t.status === 'AI Answered' || t.status === 'Resolved')
  ).length;
  const escalated = tickets.filter(
    (t) => t.status === 'Escalated' || t.aiAnalysis.requiresEscalation
  ).length;

  const aiPct = total > 0 ? Math.round((aiResolved / total) * 100) : 0;
  const escPct = total > 0 ? Math.round((escalated / total) * 100) : 0;
  const avgReliability =
    total > 0
      ? Math.round(
          tickets.reduce((acc, t) => acc + t.aiAnalysis.reliabilityScore, 0) /
            total
        )
      : 0;

  const dailyTrends: VolumeDayPoint[] = [
    { label: 'Mon', total: 26, aiResolved: 19, escalated: 5 },
    { label: 'Tue', total: 33, aiResolved: 24, escalated: 6 },
    { label: 'Wed', total: 29, aiResolved: 21, escalated: 4 },
    { label: 'Thu', total: 41, aiResolved: 30, escalated: 7 },
    { label: 'Fri', total: 36, aiResolved: 26, escalated: 6 },
    { label: 'Sat', total: 19, aiResolved: 15, escalated: 3 },
    {
      label: 'Today',
      total: 18 + tickets.filter((t) => !t.isSampleData).length,
      aiResolved:
        12 +
        tickets.filter(
          (t) => !t.isSampleData && !t.aiAnalysis.requiresEscalation
        ).length,
      escalated:
        4 +
        tickets.filter(
          (t) => !t.isSampleData && t.aiAnalysis.requiresEscalation
        ).length,
    },
  ];

  const weeklyTrends: VolumeDayPoint[] = [
    { label: 'W40', total: 142, aiResolved: 98, escalated: 28 },
    { label: 'W41', total: 158, aiResolved: 112, escalated: 30 },
    { label: 'W42', total: 164, aiResolved: 119, escalated: 27 },
    { label: 'W43', total: 179, aiResolved: 131, escalated: 29 },
    { label: 'W44', total: 192, aiResolved: 144, escalated: 26 },
    { label: 'W45', total: 204, aiResolved: 153, escalated: 31 },
    { label: 'W46', total: 202 + total, aiResolved: 152 + aiResolved, escalated: 29 + escalated },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
            Support & AI Performance Analytics
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Track query deflection, escalation behavior, category distribution,
            and reliability metrics.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setTimeframe('daily')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              timeframe === 'daily'
                ? 'bg-[#172554] text-white'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            Daily Trends
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('weekly')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              timeframe === 'weekly'
                ? 'bg-[#172554] text-white'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            Weekly Trends
          </button>
        </div>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-[#64748B]">Total Queries</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-[#111827]">
            {total}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">Active workspace records</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-[#64748B]">
            AI Resolution Percentage
          </p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-[#16A34A]">
            {aiPct}%
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {aiResolved} of {total} queries grounded
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-[#64748B]">
            Escalation Percentage
          </p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-[#DC2626]">
            {escPct}%
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {escalated} routed to human specialists
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-[#64748B]">
            Mean Reliability Score
          </p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-[#2563EB]">
            {avgReliability}%
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            Across verified KB evaluations
          </p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-[#111827]">
          {timeframe === 'daily'
            ? 'Daily Ticket Volume Trends (Sample Baseline + Today)'
            : 'Weekly Ticket Volume Trends (Sample Baseline)'}
        </h2>
        <p className="mt-0.5 mb-4 text-xs text-[#64748B]">
          Comparison of incoming volume against autonomous AI resolution and
          human escalation
        </p>
        <QueryVolumeChart
          data={timeframe === 'daily' ? dailyTrends : weeklyTrends}
        />
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-base font-semibold text-[#111827] mb-1">
            Queries by Category
          </h2>
          <p className="text-xs text-[#64748B] mb-4">
            Volume across primary support topics
          </p>
          <CategoryBreakdownChart tickets={tickets} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-base font-semibold text-[#111827] mb-1">
            Queries by Urgency
          </h2>
          <p className="text-xs text-[#64748B] mb-4">
            Severity distribution across active tickets
          </p>
          <UrgencyDistributionChart tickets={tickets} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-base font-semibold text-[#111827] mb-1">
            Resolution Status Distribution
          </h2>
          <p className="text-xs text-[#64748B] mb-4">
            Current lifecycle stage of all tickets
          </p>
          <StatusDistributionChart tickets={tickets} />
        </div>
      </div>
    </div>
  );
}
