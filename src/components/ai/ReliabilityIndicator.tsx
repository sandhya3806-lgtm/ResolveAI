import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ReliabilityIndicatorProps {
  score: number;
  level: 'High' | 'Moderate' | 'Low';
  isGroundedInKB: boolean;
  threshold?: number;
  compact?: boolean;
}

export function ReliabilityIndicator({
  score,
  level,
  isGroundedInKB,
  threshold = 75,
  compact = false,
}: ReliabilityIndicatorProps) {
  const palette =
    level === 'High'
      ? {
          bar: 'bg-[#16A34A]',
          text: 'text-[#16A34A]',
          bg: 'bg-emerald-50/70 border-emerald-200/80',
          icon: CheckCircle2,
          label: 'High Reliability',
        }
      : level === 'Moderate'
      ? {
          bar: 'bg-[#F59E0B]',
          text: 'text-[#D97706]',
          bg: 'bg-amber-50/70 border-amber-200/80',
          icon: AlertTriangle,
          label: 'Moderate Reliability',
        }
      : {
          bar: 'bg-[#DC2626]',
          text: 'text-[#DC2626]',
          bg: 'bg-red-50/70 border-red-200/80',
          icon: ShieldAlert,
          label: 'Low Reliability — Escalated',
        };

  const Icon = palette.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Icon className={`h-3.5 w-3.5 shrink-0 ${palette.text}`} aria-hidden="true" />
        <span className={`font-medium ${palette.text}`}>{palette.label}</span>
        <span className="text-[#64748B]" aria-hidden="true">·</span>
        <span className="font-mono tabular-nums text-[#111827] font-medium">
          {score}%
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${palette.bg}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 shrink-0 ${palette.text}`} aria-hidden="true" />
          <span className={`text-sm font-semibold ${palette.text}`}>
            {palette.label}
          </span>
        </div>
        <span className="font-mono text-sm font-semibold tabular-nums text-[#111827]">
          {score}%
        </span>
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/80">
        <div
          className={`h-full rounded-full transition-all duration-300 ${palette.bar}`}
          style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
        <span>
          {isGroundedInKB
            ? 'Grounded in verified Knowledge Base'
            : 'Insufficient verified KB coverage'}
        </span>
        <span className="font-mono tabular-nums">Policy gate: {threshold}%</span>
      </div>
    </div>
  );
}
