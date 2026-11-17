import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Save } from 'lucide-react';
import type { SystemSettings } from '../../types/support';

interface SettingsPageProps {
  settings: SystemSettings;
  onSaveSettings: (updated: SystemSettings) => Promise<void>;
  onResetDemoData: () => Promise<void>;
}

export function SettingsPage({
  settings,
  onSaveSettings,
  onResetDemoData,
}: SettingsPageProps) {
  const [draft, setDraft] = useState<SystemSettings>(() =>
    structuredClone(settings)
  );
  const [keywordInput, setKeywordInput] = useState(
    settings.escalationRules.sensitiveKeywords.join(', ')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedNotice(false);
    try {
      const keywords = keywordInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      const next: SystemSettings = {
        ...draft,
        escalationRules: {
          ...draft.escalationRules,
          sensitiveKeywords: keywords,
        },
      };
      await onSaveSettings(next);
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827]">
            Workspace Settings
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Configure admin profile, notification routing, support categories,
            escalation policies, and AI response rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Settings saved
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {/* 1. Admin Profile */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-[#111827] mb-4">
          Admin Profile
        </h2>
        <div className="flex flex-wrap items-center gap-5 mb-5">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shrink-0">
            <img
              src={draft.adminProfile.avatarUrl}
              alt={draft.adminProfile.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              {draft.adminProfile.name}
            </p>
            <p className="text-xs text-[#64748B]">{draft.adminProfile.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-[#111827] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={draft.adminProfile.name}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  adminProfile: { ...draft.adminProfile, name: e.target.value },
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#111827] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={draft.adminProfile.email}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  adminProfile: { ...draft.adminProfile, email: e.target.value },
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#111827] mb-1">
              Role Title
            </label>
            <input
              type="text"
              value={draft.adminProfile.role}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  adminProfile: { ...draft.adminProfile, role: e.target.value },
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 2. Notification Preferences */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-[#111827] mb-4">
          Notification Preferences
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              {
                key: 'criticalEscalations',
                label: 'Critical Escalation Alerts',
                desc: 'Immediate alert when a Critical ticket is escalated.',
              },
              {
                key: 'lowReliabilityAlerts',
                label: 'Low Reliability Warnings',
                desc: 'Notify team leads when KB coverage drops below threshold.',
              },
              {
                key: 'dailyDigest',
                label: 'Daily Operations Summary',
                desc: 'Morning digest of AI resolution rate and SLA status.',
              },
              {
                key: 'newTicketEmail',
                label: 'Every New Query Email',
                desc: 'Send email copy for every portal submission.',
              },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-[#F7F9FC] p-3.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={draft.notifications[item.key]}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    notifications: {
                      ...draft.notifications,
                      [item.key]: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563EB]"
              />
              <div>
                <p className="text-xs font-semibold text-[#111827]">
                  {item.label}
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* 3. Support Categories */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-[#111827] mb-1">
          Support Categories & SLA Targets
        </h2>
        <p className="text-xs text-[#64748B] mb-4">
          Manage active classification categories and target first-response SLA
          hours.
        </p>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
          {draft.categories.map((cat, idx) => (
            <div
              key={cat.name}
              className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-xs"
            >
              <label className="flex items-center gap-2.5 font-medium text-[#111827]">
                <input
                  type="checkbox"
                  checked={cat.enabled}
                  onChange={(e) => {
                    const updated = [...draft.categories];
                    updated[idx] = { ...cat, enabled: e.target.checked };
                    setDraft({ ...draft, categories: updated });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
                />
                <span>{cat.name}</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">Target SLA (hours):</span>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={cat.defaultSlaHours}
                  onChange={(e) => {
                    const updated = [...draft.categories];
                    updated[idx] = {
                      ...cat,
                      defaultSlaHours: Math.max(1, Number(e.target.value) || 1),
                    };
                    setDraft({ ...draft, categories: updated });
                  }}
                  className="w-16 rounded border border-slate-200 px-2 py-1 font-mono text-xs text-[#111827]"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Escalation Rules */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold text-[#111827]">
            Escalation Rules
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Define strict guardrails controlling when ResolveAI routes queries
            to human agents.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-[#111827]">
              Minimum Reliability Threshold for AI Response
            </span>
            <span className="font-mono font-semibold text-[#2563EB]">
              {draft.escalationRules.reliabilityThreshold}%
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={draft.escalationRules.reliabilityThreshold}
            onChange={(e) =>
              setDraft({
                ...draft,
                escalationRules: {
                  ...draft.escalationRules,
                  reliabilityThreshold: Number(e.target.value),
                },
              })
            }
            className="w-full accent-[#2563EB]"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3 text-xs font-medium text-[#111827] cursor-pointer">
            <input
              type="checkbox"
              checked={draft.escalationRules.autoEscalateCritical}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  escalationRules: {
                    ...draft.escalationRules,
                    autoEscalateCritical: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
            />
            <span>Auto-escalate Critical priority</span>
          </label>
          <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3 text-xs font-medium text-[#111827] cursor-pointer">
            <input
              type="checkbox"
              checked={draft.escalationRules.autoEscalateBillingDisputes}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  escalationRules: {
                    ...draft.escalationRules,
                    autoEscalateBillingDisputes: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
            />
            <span>Escalate billing disputes</span>
          </label>
          <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3 text-xs font-medium text-[#111827] cursor-pointer">
            <input
              type="checkbox"
              checked={draft.escalationRules.autoEscalateSecurityRisks}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  escalationRules: {
                    ...draft.escalationRules,
                    autoEscalateSecurityRisks: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
            />
            <span>Escalate security/lockout risks</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#111827] mb-1">
            Sensitive Escalation Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      </section>

      {/* 5. AI Response Settings */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-[#111827]">
          AI Response Settings
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-[#111827] mb-1">
              Response Tone
            </label>
            <select
              value={draft.aiSettings.responseTone}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  aiSettings: {
                    ...draft.aiSettings,
                    responseTone: e.target.value as
                      | 'Professional & Concise'
                      | 'Empathetic & Detailed',
                  },
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="Professional & Concise">
                Professional & Concise
              </option>
              <option value="Empathetic & Detailed">
                Empathetic & Detailed
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111827] mb-1">
              Max Knowledge Sources Cited
            </label>
            <select
              value={draft.aiSettings.maxSourcesCited}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  aiSettings: {
                    ...draft.aiSettings,
                    maxSourcesCited: Number(e.target.value),
                  },
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#2563EB] focus:outline-none"
            >
              <option value={1}>1 source</option>
              <option value={2}>2 sources</option>
              <option value={3}>3 sources</option>
              <option value={5}>5 sources</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-xs font-medium text-[#111827] cursor-pointer">
          <input
            type="checkbox"
            checked={draft.aiSettings.requireVerifiedCitation}
            onChange={(e) =>
              setDraft({
                ...draft,
                aiSettings: {
                  ...draft.aiSettings,
                  requireVerifiedCitation: e.target.checked,
                },
              })
            }
            className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
          />
          <span>
            Require at least one verified Knowledge Base citation before
            delivering an automated answer
          </span>
        </label>
      </section>

      {/* Sample Dataset Reset Utility */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <p className="text-xs font-semibold text-[#111827]">
            Sample Demo Dataset
          </p>
          <p className="text-xs text-[#64748B]">
            Restore initial sample tickets, knowledge articles, and default
            settings.
          </p>
        </div>
        <button
          type="button"
          onClick={onResetDemoData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F7F9FC] px-3.5 py-2 text-xs font-semibold text-[#172554] hover:border-[#2563EB]"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </form>
  );
}
