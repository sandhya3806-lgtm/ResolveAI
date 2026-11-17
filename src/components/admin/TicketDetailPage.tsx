import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Send,
  ShieldAlert,
  User,
} from 'lucide-react';
import type {
  KnowledgeArticle,
  Ticket,
  TicketStatus,
} from '../../types/support';
import { formatDateTime } from '../../utils/format';
import { AiVsHumanMessage } from '../ai/AiVsHumanMessage';
import { KnowledgeSourceCard } from '../ai/KnowledgeSourceCard';
import { ReliabilityIndicator } from '../ai/ReliabilityIndicator';
import { PriorityIndicator, StatusIndicator } from '../shared/StatusIndicators';

interface TicketDetailPageProps {
  ticket: Ticket;
  agents: string[];
  knowledgeBase: KnowledgeArticle[];
  reliabilityThreshold: number;
  onBack: () => void;
  onUpdateTicket: (
    ticketId: string,
    patch: { status?: TicketStatus; assignedAgent?: string | null }
  ) => Promise<void>;
  onAddMessage: (
    ticketId: string,
    payload: {
      authorType: 'agent' | 'internal_note';
      content: string;
      nextStatus?: TicketStatus;
    }
  ) => Promise<void>;
  onInspectKbArticle: (articleId: string) => void;
}

const ALL_STATUSES: TicketStatus[] = [
  'New',
  'AI Answered',
  'Escalated',
  'In Progress',
  'Waiting for Customer',
  'Resolved',
];

export function TicketDetailPage({
  ticket,
  agents,
  reliabilityThreshold,
  onBack,
  onUpdateTicket,
  onAddMessage,
  onInspectKbArticle,
}: TicketDetailPageProps) {
  const [composerMode, setComposerMode] = useState<'agent' | 'internal_note'>(
    'agent'
  );
  const [replyText, setReplyText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onAddMessage(ticket.id, {
        authorType: composerMode,
        content: replyText.trim(),
      });
      setReplyText('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolve = async () => {
    setIsSaving(true);
    try {
      await onUpdateTicket(ticket.id, { status: 'Resolved' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Agent Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172554] hover:border-[#2563EB]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="font-mono font-semibold text-[#172554] text-sm">
              {ticket.id}
            </span>
            <span aria-hidden="true">·</span>
            <span>{ticket.detectedCategory}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={ticket.status}
            disabled={isSaving}
            onChange={(e) =>
              onUpdateTicket(ticket.id, {
                status: e.target.value as TicketStatus,
              })
            }
            aria-label="Change ticket status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#111827] focus:border-[#2563EB] focus:outline-none"
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          {ticket.status !== 'Resolved' && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleResolve}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mark as Resolved</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT SECTION: Customer Details, Query, Conversation, Agent Actions, Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Ticket Overview */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h1 className="font-display text-xl font-bold text-[#111827]">
                  {ticket.subject}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span className="inline-flex items-center gap-1 font-medium text-[#111827]">
                    <User className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
                    {ticket.customerName}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{ticket.customerEmail}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ticket.customerTier} Plan</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PriorityIndicator priority={ticket.priority} />
                <StatusIndicator status={ticket.status} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-[#64748B] mb-1.5">
                Original Customer Query
              </p>
              <p className="text-sm leading-relaxed text-[#111827]">
                {ticket.query}
              </p>
            </div>
          </div>

          {/* Conversation Thread (AI vs Human clearly distinguished) */}
          <div className="space-y-4">
            <h2 className="font-display text-sm font-semibold text-[#111827]">
              Conversation & Activity Thread ({ticket.messages.length})
            </h2>
            {ticket.messages.map((msg) => (
              <AiVsHumanMessage
                key={msg.id}
                message={msg}
                onInspectSource={onInspectKbArticle}
              />
            ))}
          </div>

          {/* Reply / Internal Note Composer */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setComposerMode('agent')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  composerMode === 'agent'
                    ? 'bg-[#172554] text-white'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reply to Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setComposerMode('internal_note')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  composerMode === 'internal_note'
                    ? 'bg-amber-600 text-white'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Internal Note</span>
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  composerMode === 'agent'
                    ? 'Write a verified human response to the customer...'
                    : 'Add a private internal note for support teammates...'
                }
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#64748B]">
                  {composerMode === 'agent'
                    ? 'Visible to customer · Marked as Human Agent Reply'
                    : 'Visible only to internal agents'}
                </span>
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {composerMode === 'agent' ? 'Send Reply' : 'Save Internal Note'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Ticket Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-sm font-semibold text-[#111827] mb-4">
              Ticket Timeline
            </h2>
            <ol className="space-y-3.5">
              {ticket.timeline.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-xs font-medium text-[#111827]">
                      {ev.label}
                    </p>
                    {ev.detail && (
                      <p className="mt-0.5 text-xs text-[#64748B]">{ev.detail}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-[#64748B]">
                      Actor: {ev.actor}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-[#64748B] whitespace-nowrap">
                    {formatDateTime(ev.timestamp)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* RIGHT SECTION: AI Classification, Reliability, Escalation Reason, KB Sources */}
        <div className="lg:col-span-5 space-y-6">
          {/* Assignment Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-sm font-semibold text-[#111827] mb-3">
              Ticket Assignment
            </h2>
            <label
              htmlFor="agent-assign"
              className="block text-xs text-[#64748B] mb-1.5"
            >
              Assigned Support Specialist
            </label>
            <select
              id="agent-assign"
              value={ticket.assignedAgent || ''}
              disabled={isSaving}
              onChange={(e) =>
                onUpdateTicket(ticket.id, {
                  assignedAgent: e.target.value || null,
                })
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="">Unassigned</option>
              {agents.map((ag) => (
                <option key={ag} value={ag}>
                  {ag}
                </option>
              ))}
            </select>
          </div>

          {/* AI Classification & Reliability */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-[#111827]">
                AI Classification & Triage
              </h2>
              <span className="font-mono text-xs tabular-nums text-[#64748B]">
                {ticket.aiAnalysis.classificationConfidence}% conf.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-[#F7F9FC] p-3">
                <p className="text-[#64748B]">Detected Category</p>
                <p className="mt-1 font-semibold text-[#111827]">
                  {ticket.aiAnalysis.detectedCategory}
                </p>
              </div>
              <div className="rounded-lg bg-[#F7F9FC] p-3">
                <p className="text-[#64748B]">Detected Urgency</p>
                <p className="mt-1 font-semibold text-[#111827]">
                  {ticket.aiAnalysis.detectedUrgency}
                </p>
              </div>
            </div>

            <ReliabilityIndicator
              score={ticket.aiAnalysis.reliabilityScore}
              level={ticket.aiAnalysis.reliabilityLevel}
              isGroundedInKB={ticket.aiAnalysis.isGroundedInKB}
              threshold={reliabilityThreshold}
            />

            <div className="rounded-lg border border-slate-100 bg-[#F7F9FC] p-3.5">
              <p className="text-xs font-medium text-[#111827] mb-1">
                Triage Reasoning
              </p>
              <p className="text-xs leading-relaxed text-[#64748B]">
                {ticket.aiAnalysis.reasoningSummary}
              </p>
            </div>
          </div>

          {/* Escalation Notice (if applicable) */}
          {ticket.aiAnalysis.requiresEscalation && (
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-5">
              <div className="flex items-start gap-2.5">
                <ShieldAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-display text-sm font-semibold text-[#111827]">
                    Escalation Reason
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#111827]">
                    {ticket.aiAnalysis.escalationReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Retrieved Knowledge Sources */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-sm font-semibold text-[#111827] mb-3">
              Retrieved Knowledge Sources (
              {ticket.aiAnalysis.knowledgeSourcesUsed.length})
            </h2>
            {ticket.aiAnalysis.knowledgeSourcesUsed.length === 0 ? (
              <p className="text-xs text-[#64748B]">
                No verified Knowledge Base articles matched this query with
                sufficient coverage.
              </p>
            ) : (
              <div className="space-y-3">
                {ticket.aiAnalysis.knowledgeSourcesUsed.map((src) => (
                  <KnowledgeSourceCard
                    key={src.id}
                    source={src}
                    onInspect={onInspectKbArticle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
