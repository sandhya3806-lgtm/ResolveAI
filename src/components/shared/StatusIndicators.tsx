import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Flame,
  Inbox,
  Minus,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import type { TicketPriority, TicketStatus } from '../../types/support';

export function StatusIndicator({ status }: { status: TicketStatus }) {
  const config: Record<
    TicketStatus,
    { color: string; bg: string; icon: typeof CheckCircle2 }
  > = {
    New: {
      color: 'text-[#2563EB]',
      bg: 'bg-blue-50 border-blue-200/70',
      icon: Inbox,
    },
    'AI Answered': {
      color: 'text-[#16A34A]',
      bg: 'bg-emerald-50 border-emerald-200/70',
      icon: Bot,
    },
    Escalated: {
      color: 'text-[#DC2626]',
      bg: 'bg-red-50 border-red-200/70',
      icon: ShieldAlert,
    },
    'In Progress': {
      color: 'text-[#172554]',
      bg: 'bg-slate-100 border-slate-200',
      icon: UserCheck,
    },
    'Waiting for Customer': {
      color: 'text-[#D97706]',
      bg: 'bg-amber-50 border-amber-200/70',
      icon: Clock,
    },
    Resolved: {
      color: 'text-[#16A34A]',
      bg: 'bg-emerald-50 border-emerald-200/70',
      icon: CheckCircle2,
    },
  };

  const { color, bg, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${bg} ${color}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function PriorityIndicator({ priority }: { priority: TicketPriority }) {
  const config: Record<
    TicketPriority,
    { text: string; bg: string; icon: typeof Minus }
  > = {
    Low: {
      text: 'text-[#64748B]',
      bg: 'bg-slate-50 border-slate-200',
      icon: Minus,
    },
    Medium: {
      text: 'text-[#2563EB]',
      bg: 'bg-blue-50/70 border-blue-200/60',
      icon: Clock,
    },
    High: {
      text: 'text-[#D97706]',
      bg: 'bg-amber-50 border-amber-200/70',
      icon: AlertTriangle,
    },
    Critical: {
      text: 'text-[#DC2626] font-semibold',
      bg: 'bg-red-50 border-red-200',
      icon: Flame,
    },
  };

  const { text, bg, icon: Icon } = config[priority];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${bg} ${text}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{priority}</span>
    </span>
  );
}
