import {
  ArrowUpRight,
  Bot,
  Clock,
  Inbox,
  ShieldAlert,
} from 'lucide-react';
import type { Ticket } from '../../types/support';
import { formatDateTime } from '../../utils/format';
import { PriorityIndicator, StatusIndicator } from '../shared/StatusIndicators';
import {
  CategoryBreakdownChart,
  QueryVolumeChart,
  UrgencyDistributionChart,
  type VolumeDayPoint,
} from './Charts';

interface OverviewPageProps {
  tickets: Ticket[];
  onOpenTicket: (ticketId: string) => void;
  onNavigateTab: (
    tab: 'tickets' | 'ai_resolved' | 'escalated' | 'analytics'
  ) => void;
}

export function OverviewPage({
  tickets,
  onOpenTicket,
  onNavigateTab,
}: OverviewPageProps) {
  const totalQueries = tickets.length;
  const aiResolvedCount = tickets.filter(
    (t) =>
      !t.aiAnalysis.requiresEscalation &&
      (t.status === 'AI Answered' || t.status === 'Resolved')
  ).length;
  const pendingCount = tickets.filter(
    (t) =>
      t.status === 'New' ||
      t.status === 'In Progress' ||
      t.status === 'Waiting for Customer'
  ).length;
  const escalatedCount = tickets.filter(
    (t) => t.status === 'Escalated' || t.aiAnalysis.requiresEscalation
  ).length;

  const aiResolutionRate =
    totalQueries > 0 ? Math.round((aiResolvedCount / totalQueries) * 100) : 0;

  const sampleVolumeData: VolumeDayPoint[] = [
    { label: 'Nov 11', total: 24, aiResolved: 17, escalated: 4 },
    { label: 'Nov 12', total: 31, aiResolved: 22, escalated: 5 },
    { label: 'Nov 13', total: 28, aiResolved: 19, escalated: 6 },
    { label: 'Nov 14', total: 35, aiResolved: 26, escalated: 5 },
    { label: 'Nov 15', total: 29, aiResolved: 21, escalated: 4 },
    { label: 'Nov 16', total: 38, aiResolved: 27, escalated: 7 },
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

  const kpis = [
    {
      label: 'Total Queries',
      value: totalQueries,
      note: 'Sample baseline + live submissions',
      icon: Inbox,
      accent: 'text-[#172554]',
      onClick: () => onNavigateTab('tickets'),
    },
    {
      label: 'AI Resolved',
      value: aiResolvedCount,
      note: `${aiResolutionRate}% verified KB resolution`,
      icon: Bot,
      accent: 'text-[#16A34A]',
      onClick: () => onNavigateTab('ai_resolved'),
    },
    {
      label: 'Pending Tickets',
      value: pendingCount,
      note: 'New, In Progress & Waiting',
      icon: Clock,
      accent: 'text-[#2563EB]',
      onClick: () => onNavigateTab('tickets'),
    },
    {
      label: 'Escalated Tickets',
      value: escalatedCount,
      note: 'Routed for human review',
      icon: ShieldAlert,
      accent: 'text-[#DC2626]',
      onClick: () => onNavigateTab('escalated'),
    },
  ];

  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
            Good morning, Admin
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Monitor customer queries and AI support performance.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-[#64748B]">
          Includes sample demo records · Live portal submissions appear here
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={kpi.onClick}
              className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#2563EB]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B]">
                  {kpi.label}
                </span>
                <Icon className={`h-4 w-4 ${kpi.accent}`} aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold tabular-nums text-[#111827]">
                  {kpi.value}
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-slate-300 transition-colors group-hover:text-[#2563EB]"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1.5 text-xs text-[#64748B]">{kpi.note}</p>
            </button>
          );
        })}
      </div>

      {/* Charts Row 1: Query Volume + AI Resolution Rate */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-semibold text-[#111827]">
                Query Volume Trend (Sample Weekly Activity)
              </h2>
              <p className="text-xs text-[#64748B]">
                Daily total queries vs. AI resolved and escalated requests
              </p>
            </div>
          </div>
          <QueryVolumeChart data={sampleVolumeData} />
        </div>

        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#111827]">
              AI Resolution Rate
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Share of queries answered with verified KB grounding
            </p>
          </div>

          <div className="my-6 flex items-center gap-6">
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 40 * (1 - aiResolutionRate / 100)
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-xl font-bold tabular-nums text-[#111827]">
                  {aiResolutionRate}%
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <p className="text-[#64748B]">AI Answered</p>
                <p className="font-mono font-semibold tabular-nums text-[#111827]">
                  {aiResolvedCount} tickets
                </p>
              </div>
              <div>
                <p className="text-[#64748B]">Human Escalated</p>
                <p className="font-mono font-semibold tabular-nums text-[#111827]">
                  {escalatedCount} tickets
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('analytics')}
            className="w-full rounded-lg border border-slate-200 bg-[#F7F9FC] px-3 py-2 text-xs font-semibold text-[#172554] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            View Detailed Analytics
          </button>
        </div>
      </div>

      {/* Charts Row 2: Category & Urgency */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-base font-semibold text-[#111827] mb-1">
            Tickets by Category
          </h2>
          <p className="text-xs text-[#64748B] mb-5">
            Distribution across detected support domains
          </p>
          <CategoryBreakdownChart tickets={tickets} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-base font-semibold text-[#111827] mb-1">
            Urgency Distribution
          </h2>
          <p className="text-xs text-[#64748B] mb-5">
            Active ticket priority breakdown across queue
          </p>
          <UrgencyDistributionChart tickets={tickets} />
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#111827]">
              Recent Customer Tickets
            </h2>
            <p className="text-xs text-[#64748B]">
              Click any ticket row to inspect AI analysis and reply
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('tickets')}
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            View all tickets
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-[#64748B]">
              <tr>
                <th className="px-6 py-3">Ticket ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-6 py-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onOpenTicket(ticket.id)}
                  className="cursor-pointer transition-colors hover:bg-[#F7F9FC]"
                >
                  <td className="px-6 py-3.5 font-mono text-xs font-semibold text-[#172554] whitespace-nowrap">
                    {ticket.id}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-[#111827] text-xs">
                      {ticket.customerName}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {ticket.customerTier}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs truncate text-xs font-medium text-[#111827]">
                    {ticket.subject}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#64748B] whitespace-nowrap">
                    {ticket.detectedCategory}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <PriorityIndicator priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusIndicator status={ticket.status} />
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-xs tabular-nums text-[#64748B] whitespace-nowrap">
                    {formatDateTime(ticket.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
