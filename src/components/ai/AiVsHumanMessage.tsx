import { Bot, Lock, User, UserCheck } from 'lucide-react';
import type { TicketMessage } from '../../types/support';
import { FormattedProse, formatDateTime } from '../../utils/format';

interface AiVsHumanMessageProps {
  message: TicketMessage;
  onInspectSource?: (sourceId: string) => void;
}

export function AiVsHumanMessage({
  message,
  onInspectSource,
}: AiVsHumanMessageProps) {
  const isAI = message.authorType === 'ai';
  const isAgent = message.authorType === 'agent';
  const isNote = message.authorType === 'internal_note';

  const containerStyle = isAI
    ? 'border-blue-200 bg-[#F7F9FC]'
    : isNote
    ? 'border-amber-200 bg-amber-50/50'
    : isAgent
    ? 'border-slate-200 bg-white'
    : 'border-slate-200 bg-white';

  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${containerStyle}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {isAgent ? (
            <div className="h-7 w-7 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shrink-0">
              <img
                src="/src/assets/images/avatar_support_agent_1794918298521.jpg"
                alt={message.authorName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${
                isAI
                  ? 'bg-[#172554] text-white'
                  : isNote
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-[#172554]'
              }`}
            >
              {isAI ? (
                <Bot className="h-4 w-4" aria-hidden="true" />
              ) : isNote ? (
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <User className="h-4 w-4" aria-hidden="true" />
              )}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[#111827]">
                {message.authorName}
              </span>
              <span className="text-xs text-[#64748B]">
                {isAI
                  ? 'AI-Generated Response'
                  : isNote
                  ? 'Internal Note (Hidden from Customer)'
                  : isAgent
                  ? 'Human Agent Reply'
                  : 'Customer'}
              </span>
            </div>
          </div>
        </div>

        <span className="font-mono text-xs tabular-nums text-[#64748B]">
          {formatDateTime(message.timestamp)}
        </span>
      </div>

      <FormattedProse text={message.content} />

      {isAI && message.sourcesUsed && message.sourcesUsed.length > 0 && (
        <div className="mt-4 border-t border-slate-200/80 pt-3">
          <p className="mb-2 text-xs font-medium text-[#64748B]">
            Verified Knowledge Sources Cited
          </p>
          <div className="flex flex-wrap gap-2">
            {message.sourcesUsed.map((src) => (
              <button
                key={src.id}
                type="button"
                onClick={() => onInspectSource?.(src.id)}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-[#172554] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                <span className="font-mono">{src.id}</span>
                <span className="max-w-[220px] truncate">{src.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isAgent && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]">
          <UserCheck className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
          <span>Verified human specialist response</span>
        </div>
      )}
    </div>
  );
}
