import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  AIAnalysisResult,
  KnowledgeArticle,
  SupportCategory,
  SystemSettings,
  TicketPriority,
} from '../src/types/support.ts';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.'
    );
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const VALID_CATEGORIES: SupportCategory[] = [
  'Billing & Payments',
  'Account Access',
  'Technical Issues',
  'Product Questions',
  'Other',
];

const VALID_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export async function analyzeCustomerQuery(params: {
  subject: string;
  categoryHint: SupportCategory;
  message: string;
  knowledgeBase: KnowledgeArticle[];
  settings: SystemSettings;
}): Promise<AIAnalysisResult> {
  const ai = getAIClient();
  const activeArticles = params.knowledgeBase.filter((kb) => kb.active);

  const kbContext = activeArticles
    .map(
      (kb) =>
        `[ID: ${kb.id}] [Category: ${kb.category}] [Ref: ${kb.sourceRef}] [Updated: ${kb.lastUpdated}]\nTitle: ${kb.title}\nContent: ${kb.content}`
    )
    .join('\n\n---\n\n');

  const rulesContext = `
Escalation & Reliability Policy:
- Reliability threshold for autonomous AI response: ${params.settings.escalationRules.reliabilityThreshold}%
- Auto-escalate Critical urgency tickets: ${params.settings.escalationRules.autoEscalateCritical}
- Auto-escalate Billing disputes / duplicate charges / refund exceptions: ${params.settings.escalationRules.autoEscalateBillingDisputes}
- Auto-escalate Security risks / full org lockouts / breaches: ${params.settings.escalationRules.autoEscalateSecurityRisks}
- Sensitive trigger keywords: ${params.settings.escalationRules.sensitiveKeywords.join(', ')}
- Require verified KB citation for AI answers: ${params.settings.aiSettings.requireVerifiedCitation}
- Response tone: ${params.settings.aiSettings.responseTone}
- Max knowledge sources to cite: ${params.settings.aiSettings.maxSourcesCited}
`;

  const systemInstruction = `You are ResolveAI, an enterprise customer query triage and evidence-based resolution engine.
Analyze the incoming customer support query strictly against the provided Verified Knowledge Base articles and Escalation Policy.

CRITICAL INTEGRITY RULES:
1. NEVER hallucinate facts, policies, prices, or procedures not explicitly stated in the Verified Knowledge Base articles below.
2. Only cite Knowledge Base article IDs that actually appear in the Verified Knowledge Base below and genuinely answer the customer's question.
3. If the Verified Knowledge Base does not contain enough evidence to answer safely, OR if the query involves a sensitive/disputed/account-specific action (e.g., duplicate charge refund, legal/GDPR request, full admin lockout, security breach, custom contract, or outage), set requiresEscalation=true, set isGroundedInKB accordingly, keep reliabilityScore below ${params.settings.escalationRules.reliabilityThreshold}, and provide a clear escalationReason.
4. When requiresEscalation=true, set aiResponse to null (do NOT output a speculative or unsupported answer).
5. When requiresEscalation=false and the answer is clearly supported by one or more active KB articles, write a clear, structured, helpful aiResponse strictly grounded in those articles using the tone "${params.settings.aiSettings.responseTone}".`;

  const prompt = `Customer Query:
Subject: ${params.subject}
Customer Selected Category: ${params.categoryHint}
Message: ${params.message}

${rulesContext}

Verified Knowledge Base Articles (Active Only):
${kbContext || '(No active knowledge base articles available)'}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedCategory: {
            type: Type.STRING,
            description:
              'One of: Billing & Payments, Account Access, Technical Issues, Product Questions, Other',
          },
          detectedUrgency: {
            type: Type.STRING,
            description: 'One of: Low, Medium, High, Critical',
          },
          classificationConfidence: {
            type: Type.INTEGER,
            description: 'Confidence percentage from 0 to 100 for category & urgency classification.',
          },
          reliabilityScore: {
            type: Type.INTEGER,
            description:
              'Evidence reliability percentage from 0 to 100 based on how thoroughly the active KB supports an accurate answer.',
          },
          isGroundedInKB: {
            type: Type.BOOLEAN,
            description: 'True only if verified active KB articles directly address the query.',
          },
          requiresEscalation: {
            type: Type.BOOLEAN,
            description:
              'True if reliability is below threshold, KB coverage is insufficient, or policy rules require human review.',
          },
          escalationReason: {
            type: Type.STRING,
            description:
              'Clear explanation of why human review is required, or empty string if no escalation is needed.',
          },
          aiResponse: {
            type: Type.STRING,
            description:
              'Evidence-based customer response strictly grounded in the cited KB articles, or empty string if requiresEscalation is true.',
          },
          reasoningSummary: {
            type: Type.STRING,
            description:
              'Brief internal explanation for support agents summarizing classification, KB match, and escalation decision.',
          },
          matchedArticleIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of exact KB article IDs (e.g. KB-101) used to ground the answer.',
          },
        },
        required: [
          'detectedCategory',
          'detectedUrgency',
          'classificationConfidence',
          'reliabilityScore',
          'isGroundedInKB',
          'requiresEscalation',
          'escalationReason',
          'aiResponse',
          'reasoningSummary',
          'matchedArticleIds',
        ],
      },
    },
  });

  const rawText = (response.text ?? '{}').trim();
  const parsed = JSON.parse(rawText) as {
    detectedCategory: string;
    detectedUrgency: string;
    classificationConfidence: number;
    reliabilityScore: number;
    isGroundedInKB: boolean;
    requiresEscalation: boolean;
    escalationReason: string;
    aiResponse: string;
    reasoningSummary: string;
    matchedArticleIds: string[];
  };

  const detectedCategory: SupportCategory = VALID_CATEGORIES.includes(
    parsed.detectedCategory as SupportCategory
  )
    ? (parsed.detectedCategory as SupportCategory)
    : params.categoryHint;

  const detectedUrgency: TicketPriority = VALID_PRIORITIES.includes(
    parsed.detectedUrgency as TicketPriority
  )
    ? (parsed.detectedUrgency as TicketPriority)
    : 'Medium';

  const matchedIds = Array.isArray(parsed.matchedArticleIds)
    ? parsed.matchedArticleIds.slice(0, params.settings.aiSettings.maxSourcesCited)
    : [];

  const matchedArticles = activeArticles.filter((kb) => matchedIds.includes(kb.id));

  // Enforce deterministic safety guardrails alongside model evaluation
  let reliabilityScore = Math.max(0, Math.min(100, Math.round(parsed.reliabilityScore ?? 0)));
  let requiresEscalation = Boolean(parsed.requiresEscalation);
  let escalationReason = parsed.escalationReason?.trim() || null;

  const lowerQuery = `${params.subject} ${params.message}`.toLowerCase();
  const matchedKeyword = params.settings.escalationRules.sensitiveKeywords.find((kw) =>
    kw.trim() ? lowerQuery.includes(kw.trim().toLowerCase()) : false
  );

  if (matchedKeyword && !requiresEscalation) {
    requiresEscalation = true;
    escalationReason = `Sensitive keyword detected ("${matchedKeyword}"). Policy requires human specialist review.`;
    reliabilityScore = Math.min(reliabilityScore, params.settings.escalationRules.reliabilityThreshold - 10);
  }

  if (params.settings.escalationRules.autoEscalateCritical && detectedUrgency === 'Critical' && !requiresEscalation) {
    requiresEscalation = true;
    escalationReason = 'Critical urgency queries are automatically routed to senior human support.';
  }

  if (params.settings.aiSettings.requireVerifiedCitation && matchedArticles.length === 0 && !requiresEscalation) {
    requiresEscalation = true;
    escalationReason =
      'No verified active Knowledge Base article directly covers this request. Escalated to prevent unsupported guidance.';
    reliabilityScore = Math.min(reliabilityScore, 45);
  }

  if (reliabilityScore < params.settings.escalationRules.reliabilityThreshold && !requiresEscalation) {
    requiresEscalation = true;
    escalationReason =
      escalationReason ||
      `Response reliability (${reliabilityScore}%) is below the configured ${params.settings.escalationRules.reliabilityThreshold}% threshold.`;
  }

  const reliabilityLevel: 'High' | 'Moderate' | 'Low' =
    reliabilityScore >= 80 ? 'High' : reliabilityScore >= 60 ? 'Moderate' : 'Low';

  const knowledgeSourcesUsed = matchedArticles.map((kb) => ({
    id: kb.id,
    title: kb.title,
    sourceRef: kb.sourceRef,
    excerpt: kb.content.slice(0, 180) + (kb.content.length > 180 ? '...' : ''),
  }));

  // Never present an unsupported AI answer when escalated
  const finalAiResponse =
    requiresEscalation || !parsed.aiResponse?.trim() ? null : parsed.aiResponse.trim();

  return {
    detectedCategory,
    detectedUrgency,
    classificationConfidence: Math.max(
      0,
      Math.min(100, Math.round(parsed.classificationConfidence ?? 85))
    ),
    reliabilityScore,
    reliabilityLevel,
    isGroundedInKB: matchedArticles.length > 0 && Boolean(parsed.isGroundedInKB),
    requiresEscalation,
    escalationReason: requiresEscalation
      ? escalationReason || 'Human specialist verification required for accurate resolution.'
      : null,
    aiResponse: finalAiResponse,
    reasoningSummary:
      parsed.reasoningSummary?.trim() ||
      (requiresEscalation
        ? 'Escalated for human review based on policy thresholds and KB coverage.'
        : 'Verified against active Knowledge Base documentation.'),
    knowledgeSourcesUsed,
  };
}
