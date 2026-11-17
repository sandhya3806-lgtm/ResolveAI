import { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Bot,
  Inbox,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldAlert,
  X,
} from 'lucide-react';
import type {
  KnowledgeArticle,
  SupportCategory,
  SystemSettings,
  Ticket,
  TicketStatus,
} from '../../types/support';
import { ResolveLogo } from '../shared/ResolveLogo';
import { AnalyticsPage } from './AnalyticsPage';
import { EscalatedQueuePage } from './EscalatedQueuePage';
import { KnowledgeBasePage } from './KnowledgeBasePage';
import { OverviewPage } from './OverviewPage';
import { SettingsPage } from './SettingsPage';
import { TicketDetailPage } from './TicketDetailPage';
import { TicketsPage } from './TicketsPage';

export type AdminTab =
  | 'overview'
  | 'tickets'
  | 'ai_resolved'
  | 'escalated'
  | 'kb'
  | 'analytics'
  | 'settings';

interface AdminDashboardProps {
  tickets: Ticket[];
  agents: string[];
  knowledgeBase: KnowledgeArticle[];
  settings: SystemSettings;
  initialTicketId?: string | null;
  onSwitchToPortal: () => void;
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
  onCreateArticle: (payload: {
    title: string;
    category: SupportCategory;
    content: string;
    sourceRef: string;
  }) => Promise<void>;
  onUpdateArticle: (
    id: string,
    patch: Partial<KnowledgeArticle>
  ) => Promise<void>;
  onSaveSettings: (updated: SystemSettings) => Promise<void>;
  onResetDemoData: () => Promise<void>;
}

export function AdminDashboard({
  tickets,
  agents,
  knowledgeBase,
  settings,
  initialTicketId = null,
  onSwitchToPortal,
  onUpdateTicket,
  onAddMessage,
  onCreateArticle,
  onUpdateArticle,
  onSaveSettings,
  onResetDemoData,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(
    initialTicketId ? 'tickets' : 'overview'
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialTicketId
  );
  const [inspectKbId, setInspectKbId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const escalatedCount = tickets.filter(
    (t) =>
      t.status === 'Escalated' ||
      (t.aiAnalysis.requiresEscalation && t.status !== 'Resolved')
  ).length;

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tickets', label: 'All Tickets', icon: Inbox },
    { id: 'ai_resolved', label: 'AI Resolved', icon: Bot },
    {
      id: 'escalated',
      label: 'Escalated Tickets',
      icon: ShieldAlert,
      badge: escalatedCount,
    },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setSelectedTicketId(null);
    setMobileMenuOpen(false);
  };

  const selectedTicket = selectedTicketId
    ? tickets.find((t) => t.id === selectedTicketId) || null
    : null;

  const handleInspectKb = (articleId: string) => {
    setInspectKbId(articleId);
    setSelectedTicketId(null);
    setActiveTab('kb');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#172554] text-white">
      <div>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <ResolveLogo dark />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden rounded p-1 text-slate-300 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Dashboard navigation" className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedTicket;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-red-500/20 text-red-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Portal Switch */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <button
          type="button"
          onClick={onSwitchToPortal}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-white/10 whitespace-nowrap"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Customer Support Portal</span>
        </button>

        <div className="flex items-center gap-3 pt-1">
          <div className="h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-slate-700 shrink-0">
            <img
              src={settings.adminProfile.avatarUrl}
              alt={settings.adminProfile.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {settings.adminProfile.name}
            </p>
            <p className="truncate text-[11px] text-slate-300">
              {settings.adminProfile.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#111827] flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:fixed lg:inset-y-0 lg:left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] h-full">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Compact Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-lg border border-slate-200 p-2 text-[#172554] hover:bg-slate-50"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-xs font-medium text-[#64748B]">
              <span>Admin Console</span>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-[#111827]">
                {selectedTicket
                  ? `Ticket ${selectedTicket.id}`
                  : navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSwitchToPortal}
            className="rounded-lg border border-slate-200 bg-[#F7F9FC] px-3.5 py-1.5 text-xs font-semibold text-[#172554] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
          >
            Customer Portal
          </button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-7xl w-full mx-auto">
          {selectedTicket ? (
            <TicketDetailPage
              ticket={selectedTicket}
              agents={agents}
              knowledgeBase={knowledgeBase}
              reliabilityThreshold={settings.escalationRules.reliabilityThreshold}
              onBack={() => setSelectedTicketId(null)}
              onUpdateTicket={onUpdateTicket}
              onAddMessage={onAddMessage}
              onInspectKbArticle={handleInspectKb}
            />
          ) : activeTab === 'overview' ? (
            <OverviewPage
              tickets={tickets}
              onOpenTicket={(id) => setSelectedTicketId(id)}
              onNavigateTab={(tab) => handleSelectTab(tab)}
            />
          ) : activeTab === 'tickets' ? (
            <TicketsPage
              tickets={tickets}
              mode="all"
              onOpenTicket={(id) => setSelectedTicketId(id)}
            />
          ) : activeTab === 'ai_resolved' ? (
            <TicketsPage
              tickets={tickets}
              mode="ai_resolved"
              onOpenTicket={(id) => setSelectedTicketId(id)}
            />
          ) : activeTab === 'escalated' ? (
            <EscalatedQueuePage
              tickets={tickets}
              onOpenTicket={(id) => setSelectedTicketId(id)}
            />
          ) : activeTab === 'kb' ? (
            <KnowledgeBasePage
              articles={knowledgeBase}
              onCreateArticle={onCreateArticle}
              onUpdateArticle={onUpdateArticle}
              initialInspectId={inspectKbId}
              onClearInspect={() => setInspectKbId(null)}
            />
          ) : activeTab === 'analytics' ? (
            <AnalyticsPage tickets={tickets} />
          ) : (
            <SettingsPage
              settings={settings}
              onSaveSettings={onSaveSettings}
              onResetDemoData={onResetDemoData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
