import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
} from 'lucide-react';
import type {
  SupportCategory,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../../types/support';
import { formatDateTime } from '../../utils/format';
import { PriorityIndicator, StatusIndicator } from '../shared/StatusIndicators';

interface TicketsPageProps {
  tickets: Ticket[];
  mode?: 'all' | 'ai_resolved';
  onOpenTicket: (ticketId: string) => void;
}

const CATEGORIES: Array<SupportCategory | 'All'> = [
  'All',
  'Billing & Payments',
  'Account Access',
  'Technical Issues',
  'Product Questions',
  'Other',
];

const PRIORITIES: Array<TicketPriority | 'All'> = [
  'All',
  'Critical',
  'High',
  'Medium',
  'Low',
];

const STATUSES: Array<TicketStatus | 'All'> = [
  'All',
  'New',
  'AI Answered',
  'Escalated',
  'In Progress',
  'Waiting for Customer',
  'Resolved',
];

export function TicketsPage({
  tickets,
  mode = 'all',
  onOpenTicket,
}: TicketsPageProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SupportCategory | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const baseTickets = useMemo(() => {
    if (mode === 'ai_resolved') {
      return tickets.filter(
        (t) =>
          !t.aiAnalysis.requiresEscalation &&
          (t.status === 'AI Answered' || t.status === 'Resolved')
      );
    }
    return tickets;
  }, [tickets, mode]);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseTickets
      .filter((t) => {
        if (categoryFilter !== 'All' && t.detectedCategory !== categoryFilter) {
          return false;
        }
        if (priorityFilter !== 'All' && t.priority !== priorityFilter) {
          return false;
        }
        if (statusFilter !== 'All' && t.status !== statusFilter) {
          return false;
        }
        if (!q) return true;
        return (
          t.id.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerEmail.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const diff =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sortOrder === 'newest' ? diff : -diff;
      });
  }, [
    baseTickets,
    search,
    categoryFilter,
    priorityFilter,
    statusFilter,
    sortOrder,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredTickets.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
          {mode === 'ai_resolved' ? 'AI Resolved Queries' : 'All Support Tickets'}
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          {mode === 'ai_resolved'
            ? 'Queries resolved autonomously with verified knowledge base citations and reliability checks.'
            : 'Search, filter, prioritize, and inspect every incoming customer ticket.'}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-4">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search ID, customer, or subject..."
              aria-label="Search tickets"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as SupportCategory | 'All');
                setPage(1);
              }}
              aria-label="Filter by category"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563EB] focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value as TicketPriority | 'All');
                setPage(1);
              }}
              aria-label="Filter by urgency"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563EB] focus:outline-none"
            >
              {PRIORITIES.map((pri) => (
                <option key={pri} value={pri}>
                  {pri === 'All' ? 'All Priorities' : pri}
                </option>
              ))}
            </select>
          </div>

          {mode === 'all' && (
            <div className="md:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as TicketStatus | 'All');
                  setPage(1);
                }}
                aria-label="Filter by status"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563EB] focus:outline-none"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={mode === 'all' ? 'md:col-span-2' : 'md:col-span-4 flex justify-end'}>
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))
              }
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-[#F7F9FC] px-3 py-2 text-xs font-semibold text-[#172554] hover:border-[#2563EB]"
            >
              <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table or Empty State */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F9FC] text-[#64748B]">
              <Inbox className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-base font-semibold text-[#111827]">
              No matching tickets found
            </h3>
            <p className="mt-1 text-xs text-[#64748B]">
              Adjust your search terms or clear active filters to view tickets.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#172554] hover:border-[#2563EB]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-[#F7F9FC] text-xs font-semibold text-[#64748B]">
                  <tr>
                    <th className="px-5 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created Date</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => onOpenTicket(ticket.id)}
                      className="cursor-pointer transition-colors hover:bg-[#F7F9FC]"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#172554] whitespace-nowrap">
                        {ticket.id}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-medium text-[#111827]">
                          {ticket.customerName}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {ticket.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-[260px]">
                        <p className="truncate text-xs font-medium text-[#111827]">
                          {ticket.subject}
                        </p>
                        {mode === 'ai_resolved' && (
                          <p className="mt-0.5 font-mono text-[11px] text-[#16A34A]">
                            {ticket.aiAnalysis.reliabilityScore}% reliability ·{' '}
                            {ticket.aiAnalysis.knowledgeSourcesUsed.length} source(s)
                          </p>
                        )}
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
                      <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-[#64748B] whitespace-nowrap">
                        {formatDateTime(ticket.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTicket(ticket.id);
                          }}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[#172554] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-[#F7F9FC] px-5 py-3 text-xs text-[#64748B]">
              <span className="font-mono tabular-nums">
                Showing {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, filteredTickets.length)} of{' '}
                {filteredTickets.length} tickets
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-[#111827] disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Prev</span>
                </button>
                <span className="font-mono tabular-nums px-2 text-[#172554] font-medium">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-[#111827] disabled:opacity-40 hover:bg-slate-50"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
