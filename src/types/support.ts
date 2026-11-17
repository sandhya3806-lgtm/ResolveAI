export type SupportCategory =
  | 'Billing & Payments'
  | 'Account Access'
  | 'Technical Issues'
  | 'Product Questions'
  | 'Other';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketStatus =
  | 'New'
  | 'AI Answered'
  | 'Escalated'
  | 'In Progress'
  | 'Waiting for Customer'
  | 'Resolved';

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: SupportCategory;
  content: string;
  sourceRef: string;
  lastUpdated: string;
  active: boolean;
}

export interface KnowledgeSourceRef {
  id: string;
  title: string;
  sourceRef: string;
  excerpt: string;
}

export interface TicketMessage {
  id: string;
  authorType: 'customer' | 'ai' | 'agent' | 'internal_note';
  authorName: string;
  authorRole?: string;
  content: string;
  timestamp: string;
  sourcesUsed?: KnowledgeSourceRef[];
}

export interface TimelineEvent {
  id: string;
  label: string;
  detail?: string;
  timestamp: string;
  actor: 'Customer' | 'ResolveAI' | 'Agent' | 'System';
}

export interface AIAnalysisResult {
  detectedCategory: SupportCategory;
  detectedUrgency: TicketPriority;
  classificationConfidence: number;
  reliabilityScore: number;
  reliabilityLevel: 'High' | 'Moderate' | 'Low';
  isGroundedInKB: boolean;
  requiresEscalation: boolean;
  escalationReason: string | null;
  aiResponse: string | null;
  reasoningSummary: string;
  knowledgeSourcesUsed: KnowledgeSourceRef[];
}

export interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  customerTier: 'Enterprise' | 'Growth' | 'Starter';
  subject: string;
  query: string;
  userSelectedCategory: SupportCategory;
  detectedCategory: SupportCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedAgent: string | null;
  isSampleData: boolean;
  aiAnalysis: AIAnalysisResult;
  messages: TicketMessage[];
  timeline: TimelineEvent[];
}

export interface CategorySetting {
  name: SupportCategory;
  enabled: boolean;
  defaultSlaHours: number;
}

export interface SystemSettings {
  adminProfile: {
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
  };
  notifications: {
    criticalEscalations: boolean;
    lowReliabilityAlerts: boolean;
    dailyDigest: boolean;
    newTicketEmail: boolean;
  };
  categories: CategorySetting[];
  escalationRules: {
    reliabilityThreshold: number;
    autoEscalateCritical: boolean;
    autoEscalateBillingDisputes: boolean;
    autoEscalateSecurityRisks: boolean;
    sensitiveKeywords: string[];
  };
  aiSettings: {
    responseTone: 'Professional & Concise' | 'Empathetic & Detailed';
    requireVerifiedCitation: boolean;
    maxSourcesCited: number;
    showConfidenceToAgents: boolean;
  };
}
