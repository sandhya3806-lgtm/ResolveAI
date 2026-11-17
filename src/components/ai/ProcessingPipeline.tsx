import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export const PROCESSING_STAGES = [
  {
    id: 1,
    title: 'Analysing your query',
    detail: 'Extracting intent, context, and key technical or billing entities.',
  },
  {
    id: 2,
    title: 'Identifying issue category',
    detail: 'Determining primary support domain and urgency classification.',
  },
  {
    id: 3,
    title: 'Searching verified knowledge base',
    detail: 'Scanning approved documentation and policy references for matches.',
  },
  {
    id: 4,
    title: 'Evaluating response reliability',
    detail: 'Verifying evidence coverage and escalation policy thresholds.',
  },
  {
    id: 5,
    title: 'Preparing a response or human escalation',
    detail: 'Finalizing grounded guidance or routing to a specialist.',
  },
];

interface ProcessingPipelineProps {
  currentStageIndex: number; // 0 to 4
  subject: string;
}

export function ProcessingPipeline({
  currentStageIndex,
  subject,
}: ProcessingPipelineProps) {
  const progressPct = Math.min(
    100,
    Math.round(((currentStageIndex + 1) / PROCESSING_STAGES.length) * 100)
  );

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-medium text-[#2563EB] mb-1">
          ResolveAI Triage Pipeline
        </p>
        <h2 className="font-display text-2xl font-bold text-[#111827] tracking-tight">
          Evaluating your support request
        </h2>
        <p className="mt-1.5 text-sm text-[#64748B] truncate">
          Subject: <span className="text-[#111827] font-medium">{subject}</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#64748B]">
          <span>
            Step {Math.min(currentStageIndex + 1, PROCESSING_STAGES.length)} of{' '}
            {PROCESSING_STAGES.length}
          </span>
          <span className="font-mono tabular-nums text-[#172554]">
            {progressPct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 5 Stages */}
      <ol className="space-y-3" aria-label="Query processing stages">
        {PROCESSING_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex;
          const isActive = idx === currentStageIndex;
          const isPending = idx > currentStageIndex;

          return (
            <li
              key={stage.id}
              className={`flex items-start gap-3.5 rounded-lg border px-4 py-3.5 transition-colors duration-200 ${
                isActive
                  ? 'border-blue-200 bg-[#F7F9FC]'
                  : isCompleted
                  ? 'border-slate-200/80 bg-white'
                  : 'border-transparent bg-slate-50/60 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2
                    className="h-5 w-5 text-[#16A34A]"
                    aria-label="Completed"
                  />
                ) : isActive ? (
                  <Loader2
                    className="h-5 w-5 animate-spin text-[#2563EB]"
                    aria-label="In progress"
                  />
                ) : (
                  <Circle
                    className="h-5 w-5 text-slate-300"
                    aria-label="Pending"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm font-medium ${
                      isPending ? 'text-[#64748B]' : 'text-[#111827]'
                    }`}
                  >
                    {stage.id}. {stage.title}
                  </p>
                  <span className="text-xs font-medium text-[#64748B] whitespace-nowrap">
                    {isCompleted ? 'Done' : isActive ? 'Running' : 'Queued'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#64748B]">{stage.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
