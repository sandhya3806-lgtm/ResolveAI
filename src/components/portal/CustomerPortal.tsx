import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileSearch,
  HelpCircle,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import type {
  KnowledgeArticle,
  SupportCategory,
  Ticket,
} from '../../types/support';
import { formatDateOnly, formatDateTime, FormattedProse } from '../../utils/format';
import { KnowledgeSourceCard } from '../ai/KnowledgeSourceCard';
import {
  PROCESSING_STAGES,
  ProcessingPipeline,
} from '../ai/ProcessingPipeline';
import { ReliabilityIndicator } from '../ai/ReliabilityIndicator';
import { ResolveLogo } from '../shared/ResolveLogo';
import { PriorityIndicator, StatusIndicator } from '../shared/StatusIndicators';

interface CustomerPortalProps {
  knowledgeBase: KnowledgeArticle[];
  tickets: Ticket[];
  reliabilityThreshold: number;
  onTicketCreated: (ticket: Ticket) => void;
  onSwitchToAdmin: (ticketId?: string) => void;
}

type PortalStage = 'home' | 'processing' | 'result';

const CATEGORIES: SupportCategory[] = [
  'Billing & Payments',
  'Account Access',
  'Technical Issues',
  'Product Questions',
  'Other',
];

const SAMPLE_PROMPTS: Array<{
  label: string;
  subject: string;
  category: SupportCategory;
  message: string;
}> = [
  {
    label: 'Example: Update VAT ID on invoice',
    subject: 'How do I add a finance email and VAT ID to monthly invoices?',
    category: 'Billing & Payments',
    message:
      'We need our accounts payable email to receive monthly PDF invoices automatically, and we also need to update our company VAT ID before next month.',
  },
  {
    label: 'Example: Webhook 429 rate limit',
    subject: 'Receiving HTTP 429 on webhook sync',
    category: 'Technical Issues',
    message:
      'Our integration started getting HTTP 429 errors during batch sync. What is the burst rate limit and how many times do webhooks retry?',
  },
  {
    label: 'Example: Duplicate charge dispute (Escalation)',
    subject: 'Charged twice on corporate card for November renewal',
    category: 'Billing & Payments',
    message:
      'We noticed a duplicate charge of $1,850 on our corporate card this morning for our annual subscription. Please reverse the second charge immediately.',
  },
];

export function CustomerPortal({
  knowledgeBase,
  tickets,
  reliabilityThreshold,
  onTicketCreated,
  onSwitchToAdmin,
}: CustomerPortalProps) {
  const [stage, setStage] = useState<PortalStage>('home');
  const [customerName, setCustomerName] = useState('Jordan Avery');
  const [customerEmail, setCustomerEmail] = useState('jordan.avery@acme-corp.io');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportCategory>('Billing & Payments');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [processingStep, setProcessingStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resultTicket, setResultTicket] = useState<Ticket | null>(null);

  const [selectedFaq, setSelectedFaq] = useState<KnowledgeArticle | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedTicket, setTrackedTicket] = useState<Ticket | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const activeFaqs = useMemo(
    () => knowledgeBase.filter((kb) => kb.active).slice(0, 6),
    [knowledgeBase]
  );

  const handleApplySample = (sample: (typeof SAMPLE_PROMPTS)[number]) => {
    setSubject(sample.subject);
    setCategory(sample.category);
    setMessage(sample.message);
    setFormError(null);
  };

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setFormError('Please enter a brief subject for your issue.');
      return;
    }
    if (message.trim().length < 10) {
      setFormError('Please describe your question or issue in at least 10 characters.');
      return;
    }

    setFormError(null);
    setApiError(null);
    setStage('processing');
    setProcessingStep(0);

    // Advance stages smoothly while waiting on real server-side Gemini analysis
    const stepTimer = window.setInterval(() => {
      setProcessingStep((prev) =>
        prev < PROCESSING_STAGES.length - 2 ? prev + 1 : prev
      );
    }, 650);

    try {
      const response = await fetch('/api/tickets/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          subject,
          categoryHint: category,
          message,
        }),
      });

      const data = await response.json();
      window.clearInterval(stepTimer);

      if (!response.ok) {
        setApiError(
          data.error || 'We encountered an issue evaluating your query. Please try again.'
        );
        return;
      }

      setProcessingStep(PROCESSING_STAGES.length - 1);
      window.setTimeout(() => {
        setResultTicket(data.ticket);
        onTicketCreated(data.ticket);
        setStage('result');
      }, 450);
    } catch {
      window.clearInterval(stepTimer);
      setApiError('Network error while connecting to ResolveAI triage service.');
    }
  };

  const handleResetToNewQuery = () => {
    setSubject('');
    setMessage('');
    setResultTicket(null);
    setApiError(null);
    setStage('home');
  };

  const handleLookupTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    const cleaned = trackQuery.trim().toLowerCase();
    if (!cleaned) {
      setTrackError('Enter a Ticket ID (e.g., RES-1047).');
      return;
    }
    const found = tickets.find((t) => t.id.toLowerCase() === cleaned);
    if (!found) {
      setTrackedTicket(null);
      setTrackError(`No ticket found matching "${trackQuery.trim()}".`);
      return;
    }
    setTrackedTicket(found);
  };

  const handleInspectSourceById = (sourceId: string) => {
    const found = knowledgeBase.find((kb) => kb.id === sourceId);
    if (found) setSelectedFaq(found);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#111827] flex flex-col">
      {/* Top Bar Contract: Brand — 3–4 Nav Links — 1 Primary Action */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setStage('home')}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md"
          >
            <ResolveLogo />
          </button>

          <nav
            aria-label="Customer support navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#64748B]"
          >
            <button
              type="button"
              onClick={() => setStage('home')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#172554] ${
                stage === 'home' ? 'text-[#172554] font-semibold' : ''
              }`}
            >
              Submit Query
            </button>
            <a
              href="#faq-shortcuts"
              onClick={() => setStage('home')}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#172554]"
            >
              Knowledge Help
            </a>
            <button
              type="button"
              onClick={() => {
                setTrackedTicket(null);
                setTrackError(null);
                setShowTracker(true);
              }}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#172554]"
            >
              Track Ticket
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setTrackedTicket(null);
                setTrackError(null);
                setShowTracker(true);
              }}
              className="md:hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-[#172554] hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Track
            </button>
            <button
              type="button"
              onClick={() => onSwitchToAdmin()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#172554] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1e3a8a] whitespace-nowrap shrink-0"
            >
              <span>Admin Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* PAGE 1: CUSTOMER SUPPORT HOME */}
        {stage === 'home' && (
          <div className="space-y-12">
            {/* Hero Heading */}
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-wide text-[#2563EB] mb-2">
                Intelligent Support. Reliable Resolution.
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#111827] text-balance">
                How can we help you today?
              </h1>
              <p className="mt-3 text-base text-[#64748B]">
                Describe your issue and our AI assistant will help you find a
                solution.
              </p>
            </div>

            {/* Main Query Card + Support Guidance Split */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
              {/* Query Submission Card */}
              <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[#111827]">
                      Submit a Support Query
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Verified against approved documentation before answering
                    </p>
                  </div>
                </div>

                {/* Quick Demo Presets */}
                <div className="mb-5">
                  <p className="mb-2 text-xs font-medium text-[#64748B]">
                    Try a realistic scenario or enter your own question:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROMPTS.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => handleApplySample(sample)}
                        className="rounded-lg border border-slate-200 bg-[#F7F9FC] px-3 py-1.5 text-xs font-medium text-[#172554] transition-colors hover:border-[#2563EB] hover:bg-blue-50/50"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmitQuery} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="customer-name"
                        className="block text-xs font-medium text-[#111827] mb-1.5"
                      >
                        Your Name
                      </label>
                      <input
                        id="customer-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Jordan Avery"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="customer-email"
                        className="block text-xs font-medium text-[#111827] mb-1.5"
                      >
                        Work Email
                      </label>
                      <input
                        id="customer-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="jordan.avery@acme-corp.io"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="query-subject"
                        className="block text-xs font-medium text-[#111827] mb-1.5"
                      >
                        Subject <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        id="query-subject"
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g., How do I rotate our SAML SSO certificate?"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="query-category"
                        className="block text-xs font-medium text-[#111827] mb-1.5"
                      >
                        Category
                      </label>
                      <select
                        id="query-category"
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as SupportCategory)
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="query-message"
                      className="block text-xs font-medium text-[#111827] mb-1.5"
                    >
                      Message <span className="text-[#DC2626]">*</span>
                    </label>
                    <textarea
                      id="query-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Include relevant details such as account settings, error codes, invoice references, or steps you've already tried..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {formError && (
                    <div
                      role="alert"
                      className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-[#DC2626]"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <p className="text-xs text-[#64748B]">
                      Sensitive or unverified requests are escalated directly to a
                      human specialist.
                    </p>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      <span>Submit Query</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Support Info Column */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="font-display text-base font-semibold text-[#111827]">
                    How ResolveAI Protects Answer Quality
                  </h3>
                  <ul className="mt-4 space-y-4 text-sm text-[#64748B]">
                    <li className="flex items-start gap-3">
                      <ShieldCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium text-[#111827]">
                          Evidence-Based Responses
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed">
                          Answers are generated strictly from verified Knowledge
                          Base documentation with clickable source citations.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldAlert
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium text-[#111827]">
                          Automatic Human Escalation
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed">
                          Billing disputes, lockouts, legal inquiries, and
                          low-reliability topics route straight to support agents.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium text-[#111827]">
                          Support Hours & SLA
                        </p>
                        <p className="text-xs mt-0.5 leading-relaxed">
                          AI triage is instant 24/7. Escalated Critical tickets
                          receive specialist review within 2 hours.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-[#111827]">
                      Already have a Ticket ID?
                    </h3>
                    <FileSearch
                      className="h-4 w-4 text-[#64748B]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[#64748B]">
                    Look up the current status and agent updates for any
                    submitted request.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackedTicket(null);
                      setTrackError(null);
                      setShowTracker(true);
                    }}
                    className="mt-4 w-full rounded-lg border border-slate-200 bg-[#F7F9FC] px-4 py-2 text-xs font-semibold text-[#172554] transition-colors hover:border-[#2563EB] hover:bg-blue-50/40"
                  >
                    Check Ticket Status
                  </button>
                </div>
              </aside>
            </div>

            {/* Verified FAQ Shortcuts */}
            <section id="faq-shortcuts" className="pt-2">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#111827]">
                    Verified FAQ Shortcuts
                  </h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Browse approved documentation before submitting a ticket.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeFaqs.map((faq) => (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => setSelectedFaq(faq)}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-[#2563EB]"
                  >
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs text-[#64748B]">
                        <span>{faq.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[#172554]">{faq.id}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                        {faq.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#64748B]">
                        {faq.content}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#2563EB]">
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Read verified guide</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* PAGE 2: QUERY PROCESSING */}
        {stage === 'processing' && (
          <div className="py-8">
            {apiError ? (
              <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#DC2626]">
                  <AlertCircle className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#111827]">
                  Unable to Complete AI Triage
                </h2>
                <p className="mt-2 text-sm text-[#64748B]">{apiError}</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStage('home')}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-[#111827] hover:bg-slate-50"
                  >
                    Back to Form
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmitQuery(e)}
                    className="rounded-lg bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                  >
                    Retry Analysis
                  </button>
                </div>
              </div>
            ) : (
              <ProcessingPipeline
                currentStageIndex={processingStep}
                subject={subject}
              />
            )}
          </div>
        )}

        {/* PAGE 3: QUERY RESULT */}
        {stage === 'result' && resultTicket && (
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleResetToNewQuery}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#172554]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Submit Another Query</span>
              </button>

              <button
                type="button"
                onClick={() => onSwitchToAdmin(resultTicket.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#172554] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                <span>Open in Agent Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Ticket Summary Header Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#64748B] mb-2">
                    <span className="font-mono font-semibold text-[#172554] text-sm">
                      {resultTicket.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{resultTicket.detectedCategory}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {formatDateTime(resultTicket.createdAt)}
                    </span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-[#111827]">
                    {resultTicket.subject}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PriorityIndicator priority={resultTicket.priority} />
                  <StatusIndicator status={resultTicket.status} />
                </div>
              </div>

              {/* Response Section: Grounded AI Answer OR Explicit Human Escalation */}
              {resultTicket.aiAnalysis.requiresEscalation ||
              !resultTicket.aiAnalysis.aiResponse ? (
                <div className="mt-6 space-y-5">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6">
                    <div className="flex items-start gap-3.5">
                      <ShieldAlert
                        className="mt-0.5 h-6 w-6 shrink-0 text-[#D97706]"
                        aria-hidden="true"
                      />
                      <div>
                        <h2 className="font-display text-lg font-bold text-[#111827]">
                          Human Support Review Required
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#111827]">
                          To protect accuracy and account security, ResolveAI has
                          not issued an automated solution for this request. Your
                          ticket has been prioritized and assigned to a human
                          support specialist.
                        </p>
                        {resultTicket.aiAnalysis.escalationReason && (
                          <p className="mt-3 rounded-lg border border-amber-200/80 bg-white/80 px-3.5 py-2.5 text-xs text-[#111827]">
                            <span className="font-semibold">Routing reason: </span>
                            {resultTicket.aiAnalysis.escalationReason}
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
                          <span>
                            Assigned Specialist:{' '}
                            <strong className="text-[#111827]">
                              {resultTicket.assignedAgent || 'Next Available Agent'}
                            </strong>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            Reference ID:{' '}
                            <strong className="font-mono text-[#172554]">
                              {resultTicket.id}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ReliabilityIndicator
                    score={resultTicket.aiAnalysis.reliabilityScore}
                    level={resultTicket.aiAnalysis.reliabilityLevel}
                    isGroundedInKB={resultTicket.aiAnalysis.isGroundedInKB}
                    threshold={reliabilityThreshold}
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  <div className="rounded-xl border border-blue-200 bg-[#F7F9FC] p-6">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#172554]">
                        <CheckCircle2
                          className="h-4 w-4 text-[#16A34A]"
                          aria-hidden="true"
                        />
                        <span>Verified AI-Generated Solution</span>
                      </div>
                      <span className="font-mono text-xs tabular-nums text-[#16A34A] font-medium">
                        {resultTicket.aiAnalysis.reliabilityScore}% reliability
                      </span>
                    </div>
                    <FormattedProse text={resultTicket.aiAnalysis.aiResponse} />
                  </div>

                  <ReliabilityIndicator
                    score={resultTicket.aiAnalysis.reliabilityScore}
                    level={resultTicket.aiAnalysis.reliabilityLevel}
                    isGroundedInKB={resultTicket.aiAnalysis.isGroundedInKB}
                    threshold={reliabilityThreshold}
                  />

                  {resultTicket.aiAnalysis.knowledgeSourcesUsed.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-display text-sm font-semibold text-[#111827]">
                        Knowledge Sources Used (
                        {resultTicket.aiAnalysis.knowledgeSourcesUsed.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {resultTicket.aiAnalysis.knowledgeSourcesUsed.map((src) => (
                          <KnowledgeSourceCard
                            key={src.id}
                            source={src}
                            onInspect={handleInspectSourceById}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Actions */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <p className="text-xs text-[#64748B]">
                  Your original query has been logged under{' '}
                  <span className="font-mono text-[#172554]">
                    {resultTicket.id}
                  </span>
                  .
                </p>
                <button
                  type="button"
                  onClick={handleResetToNewQuery}
                  className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  Submit Another Query
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-[#64748B]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <span>
            ResolveAI — Intelligent Support. Reliable Resolution.
          </span>
          <span>Verified Knowledge Base & Human Escalation Workflow</span>
        </div>
      </footer>

      {/* FAQ Detail Modal */}
      {selectedFaq && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-modal-title"
        >
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                  <span className="font-mono text-[#172554]">
                    {selectedFaq.id}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedFaq.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Updated {formatDateOnly(selectedFaq.lastUpdated)}</span>
                </div>
                <h3
                  id="faq-modal-title"
                  className="font-display text-lg font-bold text-[#111827]"
                >
                  {selectedFaq.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFaq(null)}
                aria-label="Close guide"
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#111827]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-sm leading-relaxed text-[#111827]">
                {selectedFaq.content}
              </p>
              <div className="rounded-lg bg-[#F7F9FC] px-3.5 py-2.5 text-xs text-[#64748B]">
                Source reference:{' '}
                <span className="font-medium text-[#172554]">
                  {selectedFaq.sourceRef}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCategory(selectedFaq.category);
                  setSubject(`Question about: ${selectedFaq.title}`);
                  setSelectedFaq(null);
                  setStage('home');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#172554] hover:bg-slate-50"
              >
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Still need help? Ask Support</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFaq(null)}
                className="rounded-lg bg-[#172554] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e3a8a]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Ticket Modal */}
      {showTracker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="track-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3
                id="track-modal-title"
                className="font-display text-lg font-bold text-[#111827]"
              >
                Track Existing Support Ticket
              </h3>
              <button
                type="button"
                onClick={() => setShowTracker(false)}
                aria-label="Close ticket tracker"
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLookupTicket} className="mt-4 flex gap-2">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Enter Ticket ID (e.g., RES-1048 or RES-1047)"
                className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Find</span>
              </button>
            </form>

            {trackError && (
              <p className="mt-3 text-xs font-medium text-[#DC2626]">
                {trackError}
              </p>
            )}

            {trackedTicket && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-[#F7F9FC] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-[#172554]">
                    {trackedTicket.id}
                  </span>
                  <StatusIndicator status={trackedTicket.status} />
                </div>
                <p className="text-sm font-semibold text-[#111827]">
                  {trackedTicket.subject}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                  <span>{trackedTicket.detectedCategory}</span>
                  <span aria-hidden="true">·</span>
                  <span>Priority: {trackedTicket.priority}</span>
                  {trackedTicket.assignedAgent && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Agent: {trackedTicket.assignedAgent}</span>
                    </>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTracker(false);
                      onSwitchToAdmin(trackedTicket.id);
                    }}
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    View full thread in Agent Console →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
