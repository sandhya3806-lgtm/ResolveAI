import { BookOpen, ExternalLink } from 'lucide-react';
import type { KnowledgeSourceRef } from '../../types/support';

interface KnowledgeSourceCardProps {
  source: KnowledgeSourceRef;
  onInspect?: (sourceId: string) => void;
}

export function KnowledgeSourceCard({
  source,
  onInspect,
}: KnowledgeSourceCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#F7F9FC] p-3.5 transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <BookOpen
            className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-[#111827] leading-snug">
              {source.title}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#64748B]">
              <span className="font-mono text-[#172554]">{source.id}</span>
              <span aria-hidden="true">·</span>
              <span>{source.sourceRef}</span>
            </div>
          </div>
        </div>

        {onInspect && (
          <button
            type="button"
            onClick={() => onInspect(source.id)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-[#2563EB] hover:bg-blue-50 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </div>

      {source.excerpt && (
        <p className="mt-2.5 text-xs leading-relaxed text-[#64748B]">
          “{source.excerpt}”
        </p>
      )}
    </div>
  );
}
