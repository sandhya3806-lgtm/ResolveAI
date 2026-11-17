import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerPortal } from './components/portal/CustomerPortal';
import type {
  KnowledgeArticle,
  SupportCategory,
  SystemSettings,
  Ticket,
  TicketStatus,
} from './types/support';

export default function App() {
  const [view, setView] = useState<'portal' | 'admin'>('portal');
  const [adminInitialTicketId, setAdminInitialTicketId] = useState<string | null>(
    null
  );

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadWorkspaceData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [ticketsRes, kbRes, settingsRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/kb'),
        fetch('/api/settings'),
      ]);

      if (!ticketsRes.ok || !kbRes.ok || !settingsRes.ok) {
        throw new Error('Failed to load workspace records from server.');
      }

      const [ticketsJson, kbJson, settingsJson] = await Promise.all([
        ticketsRes.json(),
        kbRes.json(),
        settingsRes.json(),
      ]);

      setTickets(ticketsJson.tickets || []);
      setAgents(ticketsJson.agents || []);
      setKnowledgeBase(kbJson.articles || []);
      setSettings(settingsJson.settings || null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Unable to initialize ResolveAI.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  const handleTicketCreated = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  const handleUpdateTicket = async (
    ticketId: string,
    patch: { status?: TicketStatus; assignedAgent?: string | null }
  ) => {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    const { ticket } = await res.json();
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? ticket : t)));
  };

  const handleAddMessage = async (
    ticketId: string,
    payload: {
      authorType: 'agent' | 'internal_note';
      content: string;
      nextStatus?: TicketStatus;
    }
  ) => {
    const res = await fetch(`/api/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    const { ticket } = await res.json();
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? ticket : t)));
  };

  const handleCreateArticle = async (payload: {
    title: string;
    category: SupportCategory;
    content: string;
    sourceRef: string;
  }) => {
    const res = await fetch('/api/kb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    const { article } = await res.json();
    setKnowledgeBase((prev) => [article, ...prev]);
  };

  const handleUpdateArticle = async (
    id: string,
    patch: Partial<KnowledgeArticle>
  ) => {
    const res = await fetch(`/api/kb/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    const { article } = await res.json();
    setKnowledgeBase((prev) => prev.map((a) => (a.id === id ? article : a)));
  };

  const handleSaveSettings = async (updated: SystemSettings) => {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) return;
    const { settings: saved } = await res.json();
    setSettings(saved);
  };

  const handleResetDemoData = async () => {
    await fetch('/api/demo/reset', { method: 'POST' });
    await loadWorkspaceData();
  };

  if (isLoading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-6">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <Loader2
            className="h-5 w-5 animate-spin text-[#2563EB]"
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-[#111827]">
            Loading ResolveAI workspace...
          </span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle
            className="mx-auto mb-3 h-8 w-8 text-[#DC2626]"
            aria-hidden="true"
          />
          <h1 className="font-display text-lg font-bold text-[#111827]">
            Connection Error
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">{loadError}</p>
          <button
            type="button"
            onClick={loadWorkspaceData}
            className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <AdminDashboard
        tickets={tickets}
        agents={agents}
        knowledgeBase={knowledgeBase}
        settings={settings}
        initialTicketId={adminInitialTicketId}
        onSwitchToPortal={() => {
          setAdminInitialTicketId(null);
          setView('portal');
        }}
        onUpdateTicket={handleUpdateTicket}
        onAddMessage={handleAddMessage}
        onCreateArticle={handleCreateArticle}
        onUpdateArticle={handleUpdateArticle}
        onSaveSettings={handleSaveSettings}
        onResetDemoData={handleResetDemoData}
      />
    );
  }

  return (
    <CustomerPortal
      knowledgeBase={knowledgeBase}
      tickets={tickets}
      reliabilityThreshold={settings.escalationRules.reliabilityThreshold}
      onTicketCreated={handleTicketCreated}
      onSwitchToAdmin={(ticketId) => {
        setAdminInitialTicketId(ticketId || null);
        setView('admin');
      }}
    />
  );
}
