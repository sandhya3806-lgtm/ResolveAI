import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { Ticket } from '../../types/support';
import { formatRelativeTime } from '../../utils/format';
import { PriorityIndicator, StatusIndicator } from '../shared/StatusIndicators';

interface EscalatedQueuePageProps {
  tickets: Ticket[];
  onOpenTicket: (ticketId: string) => void;
}

export function EscalatedQueuePage({
  tickets,
  onOpenTicket,
}: EscalatedQueuePageProps) {
  const escalatedQueue = tickets
    .filter(
      (t) =>
        t.status === 'Escalated' ||
        (t.aiAnalysis.requiresEscalation && t.status !== 'Resolved')
    )
    .sort((a, b) => {
      const rank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return rank[a.priority] - rank[b.priority];
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
            Escalated Tickets Queue
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Human-review queue prioritized by urgency for queries requiring
            policy verification or specialist action.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-[#172554]">
          <span className="font-mono tabular-nums font-bold">
            {escalatedQueue.length}
          </span>{' '}
          tickets awaiting specialist resolution
        </div>
      </div>

      {escalatedQueue.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 px-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-[#16A34A]">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="font-display text-base font-semibold text-[#111827]">
            Escalation queue is clear
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            All escalated customer queries have been resolved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {escalatedQueue.map((ticket) => {
            const isCritical = ticket.priority === 'Critical';
            return (
              <div
                key={ticket.id}
                className={`rounded-xl border p-5 sm:p-6 transition-colors ${
                  isCritical
                    ? 'border-red-200 bg-red-50/25 hover:border-red-300'
                    : 'border-slate-200 bg-white hover:border-[#2563EB]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#64748B]">
                      <span className="font-mono font-semibold text-[#172554]">
                        {ticket.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{ticket.customerName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Submitted {formatRelativeTime(ticket.createdAt)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Assigned:{' '}
                        <strong className="font-medium text-[#111827]">
                          {ticket.assignedAgent || 'Unassigned'}
                        </strong>
                      </span>
                    </div>

                    <h2 className="font-display text-base font-bold text-[#111827]">
                      {ticket.subject}
                    </h2>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#64748B]">
                      {ticket.query}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <PriorityIndicator priority={ticket.priority} />
                    <StatusIndicator status={ticket.status} />
                  </div>
                </div>

                {/* Escalation Reason */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/70 pt-4">
                  <div className="flex items-start gap-2 text-xs text-[#111827] max-w-2xl">
                    <ShieldAlert
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isCritical ? 'text-[#DC2626]' : 'text-[#D97706]'
                      }`}
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="font-semibold">
                        Escalation reason:{' '}
                      </strong>
                      {ticket.aiAnalysis.escalationReason ||
                        'Requires human specialist verification.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenTicket(ticket.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#172554] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1e3a8a] whitespace-nowrap shrink-0"
                  >
                    <span>Review</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
