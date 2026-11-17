import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type {
  KnowledgeArticle,
  SupportCategory,
  SystemSettings,
  Ticket,
  TicketPriority,
  TicketStatus,
} from './src/types/support.ts';
import { analyzeCustomerQuery } from './server/geminiService.ts';
import {
  AGENT_ROSTER,
  INITIAL_KNOWLEDGE_BASE,
  INITIAL_SETTINGS,
  INITIAL_TICKETS,
} from './server/seedData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

// In-memory store initialized with realistic sample data
let tickets: Ticket[] = structuredClone(INITIAL_TICKETS);
let knowledgeBase: KnowledgeArticle[] = structuredClone(INITIAL_KNOWLEDGE_BASE);
let settings: SystemSettings = structuredClone(INITIAL_SETTINGS);
let ticketSequence = 1049;

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ResolveAI' });
});

app.get('/api/tickets', (_req, res) => {
  const sorted = [...tickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ tickets: sorted, agents: AGENT_ROSTER });
});

app.get('/api/tickets/:id', (req, res) => {
  const found = tickets.find(
    (t) => t.id.toLowerCase() === req.params.id.trim().toLowerCase()
  );
  if (!found) {
    res.status(404).json({ error: `Ticket ${req.params.id} was not found.` });
    return;
  }
  res.json({ ticket: found });
});

app.post('/api/tickets/analyze', async (req, res) => {
  try {
    const {
      customerName = 'Guest Customer',
      customerEmail = 'customer@company.com',
      subject,
      categoryHint = 'Other',
      message,
    } = req.body as {
      customerName?: string;
      customerEmail?: string;
      subject?: string;
      categoryHint?: SupportCategory;
      message?: string;
    };

    if (!subject?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Please provide both a subject and a detailed message.' });
      return;
    }

    const analysis = await analyzeCustomerQuery({
      subject: subject.trim(),
      categoryHint,
      message: message.trim(),
      knowledgeBase,
      settings,
    });

    const now = new Date().toISOString();
    const ticketId = `RES-${ticketSequence++}`;
    const assignedAgent = analysis.requiresEscalation
      ? AGENT_ROSTER[ticketSequence % AGENT_ROSTER.length]
      : null;

    const initialStatus: TicketStatus = analysis.requiresEscalation
      ? 'Escalated'
      : 'AI Answered';

    const messages: Ticket['messages'] = [
      {
        id: `MSG-${ticketId}-1`,
        authorType: 'customer',
        authorName: customerName.trim() || 'Guest Customer',
        content: message.trim(),
        timestamp: now,
      },
    ];

    if (analysis.aiResponse && !analysis.requiresEscalation) {
      messages.push({
        id: `MSG-${ticketId}-2`,
        authorType: 'ai',
        authorName: 'ResolveAI Assistant',
        authorRole: 'Evidence-Based AI Response',
        content: analysis.aiResponse,
        timestamp: now,
        sourcesUsed: analysis.knowledgeSourcesUsed,
      });
    } else if (analysis.requiresEscalation) {
      messages.push({
        id: `MSG-${ticketId}-2`,
        authorType: 'internal_note',
        authorName: 'ResolveAI Triage',
        authorRole: 'Automated Reliability Gate',
        content: `Escalated automatically: ${analysis.escalationReason}`,
        timestamp: now,
      });
    }

    const timeline: Ticket['timeline'] = [
      {
        id: `TL-${ticketId}-1`,
        label: 'Query submitted via Customer Support Portal',
        timestamp: now,
        actor: 'Customer',
      },
      {
        id: `TL-${ticketId}-2`,
        label: `Classified as ${analysis.detectedCategory} · ${analysis.detectedUrgency}`,
        detail: `Reliability score: ${analysis.reliabilityScore}%`,
        timestamp: now,
        actor: 'ResolveAI',
      },
      {
        id: `TL-${ticketId}-3`,
        label: analysis.requiresEscalation
          ? `Escalated to ${assignedAgent ?? 'Support Queue'}`
          : 'Evidence-based AI response delivered',
        detail: analysis.requiresEscalation
          ? analysis.escalationReason ?? undefined
          : `${analysis.knowledgeSourcesUsed.length} verified KB source(s) cited`,
        timestamp: now,
        actor: analysis.requiresEscalation ? 'System' : 'ResolveAI',
      },
    ];

    const newTicket: Ticket = {
      id: ticketId,
      customerName: customerName.trim() || 'Guest Customer',
      customerEmail: customerEmail.trim() || 'customer@company.com',
      customerTier: 'Growth',
      subject: subject.trim(),
      query: message.trim(),
      userSelectedCategory: categoryHint,
      detectedCategory: analysis.detectedCategory,
      priority: analysis.detectedUrgency,
      status: initialStatus,
      createdAt: now,
      updatedAt: now,
      assignedAgent,
      isSampleData: false,
      aiAnalysis: analysis,
      messages,
      timeline,
    };

    tickets.unshift(newTicket);
    res.status(201).json({ ticket: newTicket });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unable to process query right now.';
    const statusCode =
      errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('PERMISSION_DENIED')
        ? 403
        : errorMessage.includes('RESOURCE_EXHAUSTED')
        ? 429
        : 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

app.patch('/api/tickets/:id', (req, res) => {
  const idx = tickets.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const { status, priority, assignedAgent } = req.body as {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedAgent?: string | null;
  };

  const ticket = tickets[idx];
  const now = new Date().toISOString();
  const changes: string[] = [];

  if (status && status !== ticket.status) {
    changes.push(`Status changed from ${ticket.status} to ${status}`);
    ticket.status = status;
  }
  if (priority && priority !== ticket.priority) {
    changes.push(`Priority changed from ${ticket.priority} to ${priority}`);
    ticket.priority = priority;
  }
  if (assignedAgent !== undefined && assignedAgent !== ticket.assignedAgent) {
    changes.push(`Assigned to ${assignedAgent || 'Unassigned'}`);
    ticket.assignedAgent = assignedAgent;
  }

  if (changes.length > 0) {
    ticket.updatedAt = now;
    ticket.timeline.push({
      id: `TL-${ticket.id}-${ticket.timeline.length + 1}`,
      label: changes.join(' · '),
      timestamp: now,
      actor: 'Agent',
    });
  }

  res.json({ ticket });
});

app.post('/api/tickets/:id/messages', (req, res) => {
  const idx = tickets.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const { authorType, authorName, authorRole, content, nextStatus } = req.body as {
    authorType: 'agent' | 'internal_note';
    authorName?: string;
    authorRole?: string;
    content: string;
    nextStatus?: TicketStatus;
  };

  if (!content?.trim()) {
    res.status(400).json({ error: 'Message content cannot be empty.' });
    return;
  }

  const ticket = tickets[idx];
  const now = new Date().toISOString();

  ticket.messages.push({
    id: `MSG-${ticket.id}-${ticket.messages.length + 1}`,
    authorType,
    authorName: authorName || settings.adminProfile.name,
    authorRole:
      authorType === 'internal_note'
        ? 'Internal Agent Note'
        : authorRole || settings.adminProfile.role,
    content: content.trim(),
    timestamp: now,
  });

  if (nextStatus && nextStatus !== ticket.status) {
    ticket.status = nextStatus;
  } else if (authorType === 'agent' && (ticket.status === 'Escalated' || ticket.status === 'New')) {
    ticket.status = 'In Progress';
  }

  ticket.updatedAt = now;
  ticket.timeline.push({
    id: `TL-${ticket.id}-${ticket.timeline.length + 1}`,
    label:
      authorType === 'internal_note'
        ? `Internal note added by ${authorName || settings.adminProfile.name}`
        : `Human reply sent by ${authorName || settings.adminProfile.name}`,
    timestamp: now,
    actor: 'Agent',
  });

  res.status(201).json({ ticket });
});

app.get('/api/kb', (_req, res) => {
  res.json({ articles: knowledgeBase });
});

app.post('/api/kb', (req, res) => {
  const { title, category, content, sourceRef, active = true } = req.body as {
    title?: string;
    category?: SupportCategory;
    content?: string;
    sourceRef?: string;
    active?: boolean;
  };

  if (!title?.trim() || !content?.trim()) {
    res.status(400).json({ error: 'Article title and content are required.' });
    return;
  }

  const nextIdNum = 101 + knowledgeBase.length;
  const article: KnowledgeArticle = {
    id: `KB-${nextIdNum}`,
    title: title.trim(),
    category: category || 'Product Questions',
    content: content.trim(),
    sourceRef: sourceRef?.trim() || `CUSTOM-DOC-${nextIdNum}`,
    lastUpdated: new Date().toISOString().slice(0, 10),
    active,
  };

  knowledgeBase.unshift(article);
  res.status(201).json({ article });
});

app.patch('/api/kb/:id', (req, res) => {
  const idx = knowledgeBase.findIndex((kb) => kb.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Knowledge article not found.' });
    return;
  }

  const { title, category, content, sourceRef, active } = req.body as Partial<KnowledgeArticle>;
  const existing = knowledgeBase[idx];

  knowledgeBase[idx] = {
    ...existing,
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(category !== undefined ? { category } : {}),
    ...(content !== undefined ? { content: content.trim() } : {}),
    ...(sourceRef !== undefined ? { sourceRef: sourceRef.trim() } : {}),
    ...(active !== undefined ? { active } : {}),
    lastUpdated: new Date().toISOString().slice(0, 10),
  };

  res.json({ article: knowledgeBase[idx] });
});

app.get('/api/settings', (_req, res) => {
  res.json({ settings });
});

app.patch('/api/settings', (req, res) => {
  const incoming = req.body as Partial<SystemSettings>;
  settings = {
    adminProfile: { ...settings.adminProfile, ...(incoming.adminProfile || {}) },
    notifications: { ...settings.notifications, ...(incoming.notifications || {}) },
    categories: incoming.categories || settings.categories,
    escalationRules: { ...settings.escalationRules, ...(incoming.escalationRules || {}) },
    aiSettings: { ...settings.aiSettings, ...(incoming.aiSettings || {}) },
  };
  res.json({ settings });
});

app.post('/api/demo/reset', (_req, res) => {
  tickets = structuredClone(INITIAL_TICKETS);
  knowledgeBase = structuredClone(INITIAL_KNOWLEDGE_BASE);
  settings = structuredClone(INITIAL_SETTINGS);
  ticketSequence = 1049;
  res.json({ ok: true });
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResolveAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
