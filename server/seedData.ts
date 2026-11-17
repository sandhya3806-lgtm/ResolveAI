import type { KnowledgeArticle, SystemSettings, Ticket } from '../src/types/support.ts';

export const INITIAL_KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: 'KB-101',
    title: 'Single Sign-On (SSO) SAML 2.0 Configuration & Certificate Rotation',
    category: 'Account Access',
    content:
      'Administrators on Growth and Enterprise plans can configure SAML 2.0 SSO under Workspace Settings > Authentication. When rotating an Identity Provider (IdP) X.509 certificate, upload the new certificate in the Secondary Certificate slot before retiring the primary key to prevent user lockouts. Changes propagate across active sessions within 5 minutes. If all admins are locked out due to an expired certificate, an organization owner must verify domain ownership with Support to perform an emergency SSO bypass.',
    sourceRef: 'AUTH-DOC-04 · Security & Identity Guide',
    lastUpdated: '2026-11-08',
    active: true,
  },
  {
    id: 'KB-102',
    title: 'Two-Factor Authentication (2FA) Recovery & Backup Codes',
    category: 'Account Access',
    content:
      'Users who lose access to their authenticator app can sign in using one of the 10 single-use backup codes generated during 2FA enrollment. Navigate to the sign-in challenge screen, select "Use a backup code," and enter an unused 8-character code. Workspace admins can also reset 2FA for team members from Directory > Members > Reset MFA. If an account owner has lost both their device and backup codes, human identity verification is required.',
    sourceRef: 'AUTH-DOC-09 · Account Recovery Policy',
    lastUpdated: '2026-11-02',
    active: true,
  },
  {
    id: 'KB-103',
    title: 'Downloading Monthly VAT Invoices & Updating Billing Contacts',
    category: 'Billing & Payments',
    content:
      'PDF invoices and receipts are automatically generated on the 1st of each billing cycle. Billing Administrators can download historical invoices from Billing > Invoices & Receipts. To add a secondary finance email address for automated invoice delivery or update your company VAT/Tax ID, open Billing > Payment & Tax Details and click Save Changes. Updated Tax IDs apply to all future invoices.',
    sourceRef: 'BILL-DOC-02 · Billing Administration',
    lastUpdated: '2026-11-11',
    active: true,
  },
  {
    id: 'KB-104',
    title: 'Annual Plan Refund Policy & Seat Downgrade Proration',
    category: 'Billing & Payments',
    content:
      'Seat reductions made mid-cycle take effect at the next renewal date unless otherwise covered by an Enterprise MSA. Full refunds on annual subscriptions are available within 14 calendar days of the initial purchase date, provided total platform API usage remains under 10,000 requests. Duplicate charges, disputed invoice amounts, or out-of-window refund exceptions must be reviewed directly by a Billing Specialist.',
    sourceRef: 'BILL-DOC-07 · Subscription & Refund Policy',
    lastUpdated: '2026-10-29',
    active: true,
  },
  {
    id: 'KB-105',
    title: 'Webhook Delivery Retries, Signing Verification & Error 429 Handling',
    category: 'Technical Issues',
    content:
      'ResolveAI Cloud dispatches webhooks with an HMAC-SHA256 signature header (X-Webhook-Signature). Endpoints must respond with a 2xx status code within 5 seconds. Failed deliveries are retried with exponential backoff up to 8 times over 24 hours. If your integration receives HTTP 429 Too Many Requests, inspect the Retry-After header and ensure your client stays within the 120 requests/minute workspace burst quota.',
    sourceRef: 'TECH-DOC-12 · Developer Webhooks & Rate Limits',
    lastUpdated: '2026-11-12',
    active: true,
  },
  {
    id: 'KB-106',
    title: 'CSV & JSON Data Export Limits and Scheduled Backups',
    category: 'Product Questions',
    content:
      'Workspaces can export up to 50,000 records per synchronous CSV download from Reports > Export. Datasets exceeding 50,000 rows are queued automatically as asynchronous background exports and delivered via a secure download link to your registered email within 15 minutes. Automated weekly S3/GCS archive sync is included on Enterprise plans.',
    sourceRef: 'PROD-DOC-05 · Reporting & Exports',
    lastUpdated: '2026-11-05',
    active: true,
  },
  {
    id: 'KB-107',
    title: 'Role-Based Permissions Matrix: Admin, Agent, and Read-Only Viewer',
    category: 'Product Questions',
    content:
      'Workspace roles control access across billing, configuration, and customer records. Admins have full access to settings, billing, user provisioning, and knowledge articles. Support Agents can view, triage, reply to, and resolve tickets as well as propose knowledge base edits. Read-Only Viewers can inspect analytics and ticket summaries without modifying records or viewing internal agent notes.',
    sourceRef: 'PROD-DOC-01 · Workspace Governance',
    lastUpdated: '2026-10-24',
    active: true,
  },
  {
    id: 'KB-108',
    title: 'Browser Compatibility & WebSocket Live Sync Troubleshooting',
    category: 'Technical Issues',
    content:
      'The web console officially supports the latest two major versions of Chrome, Firefox, Safari, and Edge. If real-time updates stall or fail to connect, verify that corporate firewalls or VPN proxies allow outbound WSS connections on port 443 and do not strip WebSocket upgrade headers. Clearing site cache and re-authenticating resolves stale session token mismatches.',
    sourceRef: 'TECH-DOC-03 · Client Connectivity Guide',
    lastUpdated: '2026-10-18',
    active: false,
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  adminProfile: {
    name: 'Claire Bennett',
    email: 'claire.bennett@resolveai.io',
    role: 'Support Operations Lead',
    avatarUrl: '/src/assets/images/avatar_admin_lead_1794918299651.jpg',
  },
  notifications: {
    criticalEscalations: true,
    lowReliabilityAlerts: true,
    dailyDigest: true,
    newTicketEmail: false,
  },
  categories: [
    { name: 'Billing & Payments', enabled: true, defaultSlaHours: 4 },
    { name: 'Account Access', enabled: true, defaultSlaHours: 2 },
    { name: 'Technical Issues', enabled: true, defaultSlaHours: 4 },
    { name: 'Product Questions', enabled: true, defaultSlaHours: 12 },
    { name: 'Other', enabled: true, defaultSlaHours: 24 },
  ],
  escalationRules: {
    reliabilityThreshold: 75,
    autoEscalateCritical: true,
    autoEscalateBillingDisputes: true,
    autoEscalateSecurityRisks: true,
    sensitiveKeywords: ['double charged', 'data breach', 'unauthorized', 'legal', 'gdpr deletion', 'outage'],
  },
  aiSettings: {
    responseTone: 'Professional & Concise',
    requireVerifiedCitation: true,
    maxSourcesCited: 3,
    showConfidenceToAgents: true,
  },
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'RES-1048',
    customerName: 'Marcus Holloway',
    customerEmail: 'm.holloway@northstar-logistics.com',
    customerTier: 'Enterprise',
    subject: 'Duplicate charge of $2,400 on November invoice #INV-8842',
    query:
      'We were charged twice ($2,400 x 2) on our corporate Visa ending in 4190 this morning for invoice #INV-8842. Our finance controller needs an immediate reversal and confirmation before month-end close.',
    userSelectedCategory: 'Billing & Payments',
    detectedCategory: 'Billing & Payments',
    priority: 'Critical',
    status: 'Escalated',
    createdAt: '2026-11-17T03:42:00Z',
    updatedAt: '2026-11-17T03:45:00Z',
    assignedAgent: 'Elena Vance',
    isSampleData: true,
    aiAnalysis: {
      detectedCategory: 'Billing & Payments',
      detectedUrgency: 'Critical',
      classificationConfidence: 98,
      reliabilityScore: 42,
      reliabilityLevel: 'Low',
      isGroundedInKB: true,
      requiresEscalation: true,
      escalationReason:
        'Duplicate payment dispute ($2,400) requires human billing authorization and manual ledger verification per BILL-DOC-07.',
      aiResponse: null,
      reasoningSummary:
        'Detected duplicate charge keyword and Enterprise financial dispute. Policy BILL-DOC-07 explicitly mandates human Billing Specialist review for duplicate charges and refunds.',
      knowledgeSourcesUsed: [
        {
          id: 'KB-104',
          title: 'Annual Plan Refund Policy & Seat Downgrade Proration',
          sourceRef: 'BILL-DOC-07 · Subscription & Refund Policy',
          excerpt:
            'Duplicate charges, disputed invoice amounts, or out-of-window refund exceptions must be reviewed directly by a Billing Specialist.',
        },
      ],
    },
    messages: [
      {
        id: 'MSG-1048-1',
        authorType: 'customer',
        authorName: 'Marcus Holloway',
        content:
          'We were charged twice ($2,400 x 2) on our corporate Visa ending in 4190 this morning for invoice #INV-8842. Our finance controller needs an immediate reversal and confirmation before month-end close.',
        timestamp: '2026-11-17T03:42:00Z',
      },
      {
        id: 'MSG-1048-2',
        authorType: 'internal_note',
        authorName: 'ResolveAI Triage',
        authorRole: 'Automated Reliability Gate',
        content:
          'Escalated automatically: Billing dispute detected ($2,400 duplicate charge). No autonomous refund or ledger commitment issued to customer.',
        timestamp: '2026-11-17T03:42:05Z',
      },
    ],
    timeline: [
      {
        id: 'TL-1048-1',
        label: 'Query submitted via Customer Support Portal',
        timestamp: '2026-11-17T03:42:00Z',
        actor: 'Customer',
      },
      {
        id: 'TL-1048-2',
        label: 'Classified as Billing & Payments · Critical',
        detail: 'Matched escalation rule: Billing dispute / duplicate charge',
        timestamp: '2026-11-17T03:42:03Z',
        actor: 'ResolveAI',
      },
      {
        id: 'TL-1048-3',
        label: 'Escalated to Elena Vance (Billing Operations)',
        timestamp: '2026-11-17T03:45:00Z',
        actor: 'System',
      },
    ],
  },
  {
    id: 'RES-1047',
    customerName: 'Priya Nair',
    customerEmail: 'priya.nair@veridianhealth.io',
    customerTier: 'Growth',
    subject: 'How to add our finance alias and VAT ID to monthly PDF invoices',
    query:
      'Hi team, can you let me know how we can add our accounts-payable@veridianhealth.io alias to receive monthly invoices and update our VAT ID before the December cycle?',
    userSelectedCategory: 'Billing & Payments',
    detectedCategory: 'Billing & Payments',
    priority: 'Low',
    status: 'AI Answered',
    createdAt: '2026-11-17T02:15:00Z',
    updatedAt: '2026-11-17T02:15:08Z',
    assignedAgent: null,
    isSampleData: true,
    aiAnalysis: {
      detectedCategory: 'Billing & Payments',
      detectedUrgency: 'Low',
      classificationConfidence: 97,
      reliabilityScore: 96,
      reliabilityLevel: 'High',
      isGroundedInKB: true,
      requiresEscalation: false,
      escalationReason: null,
      aiResponse:
        'You can update both your invoice recipient email and VAT ID directly in your workspace billing settings:\n\n1. Sign in as a Billing Administrator and open **Billing > Payment & Tax Details**.\n2. Add `accounts-payable@veridianhealth.io` as your secondary finance contact for automated monthly PDF delivery.\n3. Enter your updated company VAT/Tax ID and click **Save Changes**.\n\nAll updated Tax ID details apply automatically to future invoices starting with your December cycle, and historical PDF invoices remain available anytime under **Billing > Invoices & Receipts**.',
      reasoningSummary:
        'Directly grounded in KB-103 (BILL-DOC-02) with complete procedural steps and no sensitive account modifications required.',
      knowledgeSourcesUsed: [
        {
          id: 'KB-103',
          title: 'Downloading Monthly VAT Invoices & Updating Billing Contacts',
          sourceRef: 'BILL-DOC-02 · Billing Administration',
          excerpt:
            'To add a secondary finance email address for automated invoice delivery or update your company VAT/Tax ID, open Billing > Payment & Tax Details and click Save Changes.',
        },
      ],
    },
    messages: [
      {
        id: 'MSG-1047-1',
        authorType: 'customer',
        authorName: 'Priya Nair',
        content:
          'Hi team, can you let me know how we can add our accounts-payable@veridianhealth.io alias to receive monthly invoices and update our VAT ID before the December cycle?',
        timestamp: '2026-11-17T02:15:00Z',
      },
      {
        id: 'MSG-1047-2',
        authorType: 'ai',
        authorName: 'ResolveAI Assistant',
        authorRole: 'Evidence-Based AI Response',
        content:
          'You can update both your invoice recipient email and VAT ID directly in your workspace billing settings:\n\n1. Sign in as a Billing Administrator and open **Billing > Payment & Tax Details**.\n2. Add `accounts-payable@veridianhealth.io` as your secondary finance contact for automated monthly PDF delivery.\n3. Enter your updated company VAT/Tax ID and click **Save Changes**.\n\nAll updated Tax ID details apply automatically to future invoices starting with your December cycle, and historical PDF invoices remain available anytime under **Billing > Invoices & Receipts**.',
        timestamp: '2026-11-17T02:15:08Z',
        sourcesUsed: [
          {
            id: 'KB-103',
            title: 'Downloading Monthly VAT Invoices & Updating Billing Contacts',
            sourceRef: 'BILL-DOC-02 · Billing Administration',
            excerpt:
              'To add a secondary finance email address for automated invoice delivery or update your company VAT/Tax ID, open Billing > Payment & Tax Details and click Save Changes.',
          },
        ],
      },
    ],
    timeline: [
      {
        id: 'TL-1047-1',
        label: 'Query submitted via Customer Support Portal',
        timestamp: '2026-11-17T02:15:00Z',
        actor: 'Customer',
      },
      {
        id: 'TL-1047-2',
        label: 'Verified against KB-103 (96% reliability)',
        timestamp: '2026-11-17T02:15:05Z',
        actor: 'ResolveAI',
      },
      {
        id: 'TL-1047-3',
        label: 'AI response delivered to customer',
        timestamp: '2026-11-17T02:15:08Z',
        actor: 'ResolveAI',
      },
    ],
  },
  {
    id: 'RES-1046',
    customerName: 'Daniel Lindqvist',
    customerEmail: 'dlindqvist@nordicgrid.se',
    customerTier: 'Enterprise',
    subject: 'All admins locked out after IdP SAML certificate expired overnight',
    query:
      'Our Okta X.509 certificate expired at 01:00 UTC and now every admin in our organization is locked out of the workspace. We need an emergency SSO bypass to upload the new cert.',
    userSelectedCategory: 'Account Access',
    detectedCategory: 'Account Access',
    priority: 'Critical',
    status: 'In Progress',
    createdAt: '2026-11-17T00:50:00Z',
    updatedAt: '2026-11-17T01:18:00Z',
    assignedAgent: 'Claire Bennett',
    isSampleData: true,
    aiAnalysis: {
      detectedCategory: 'Account Access',
      detectedUrgency: 'Critical',
      classificationConfidence: 99,
      reliabilityScore: 61,
      reliabilityLevel: 'Low',
      isGroundedInKB: true,
      requiresEscalation: true,
      escalationReason:
        'Organization-wide admin lockout requires domain ownership verification and manual emergency SSO bypass by Support.',
      aiResponse: null,
      reasoningSummary:
        'KB-101 states that when all admins are locked out due to an expired SAML certificate, emergency bypass requires human Support domain verification.',
      knowledgeSourcesUsed: [
        {
          id: 'KB-101',
          title: 'Single Sign-On (SSO) SAML 2.0 Configuration & Certificate Rotation',
          sourceRef: 'AUTH-DOC-04 · Security & Identity Guide',
          excerpt:
            'If all admins are locked out due to an expired certificate, an organization owner must verify domain ownership with Support to perform an emergency SSO bypass.',
        },
      ],
    },
    messages: [
      {
        id: 'MSG-1046-1',
        authorType: 'customer',
        authorName: 'Daniel Lindqvist',
        content:
          'Our Okta X.509 certificate expired at 01:00 UTC and now every admin in our organization is locked out of the workspace. We need an emergency SSO bypass to upload the new cert.',
        timestamp: '2026-11-17T00:50:00Z',
      },
      {
        id: 'MSG-1046-2',
        authorType: 'agent',
        authorName: 'Claire Bennett',
        authorRole: 'Support Operations Lead',
        content:
          'Hi Daniel — I have initiated the emergency SSO bypass workflow for nordicgrid.se. Could you please add the DNS TXT verification record `resolveai-verify=8831a4` and reply here once propagated so I can temporarily unlock your owner account?',
        timestamp: '2026-11-17T01:18:00Z',
      },
    ],
    timeline: [
      {
        id: 'TL-1046-1',
        label: 'Query submitted via Customer Support Portal',
        timestamp: '2026-11-17T00:50:00Z',
        actor: 'Customer',
      },
      {
        id: 'TL-1046-2',
        label: 'Escalated automatically (Security & Lockout Critical Priority)',
        timestamp: '2026-11-17T00:50:04Z',
        actor: 'ResolveAI',
      },
      {
        id: 'TL-1046-3',
        label: 'Claire Bennett sent domain verification instructions',
        timestamp: '2026-11-17T01:18:00Z',
        actor: 'Agent',
      },
    ],
  },
  {
    id: 'RES-1045',
    customerName: 'Hannah Brooks',
    customerEmail: 'hannah@latticeops.dev',
    customerTier: 'Growth',
    subject: 'Webhook endpoint receiving 429 errors during batch sync',
    query:
      'Our ingestion worker started seeing HTTP 429 responses when posting updates, and webhook deliveries are showing retries. What are the burst limits and signature headers we should verify?',
    userSelectedCategory: 'Technical Issues',
    detectedCategory: 'Technical Issues',
    priority: 'High',
    status: 'AI Answered',
    createdAt: '2026-11-16T19:30:00Z',
    updatedAt: '2026-11-16T19:30:07Z',
    assignedAgent: null,
    isSampleData: true,
    aiAnalysis: {
      detectedCategory: 'Technical Issues',
      detectedUrgency: 'High',
      classificationConfidence: 95,
      reliabilityScore: 93,
      reliabilityLevel: 'High',
      isGroundedInKB: true,
      requiresEscalation: false,
      escalationReason: null,
      aiResponse:
        'Here is how rate limiting and webhook retries operate on your workspace:\n\n- **Burst Quota (HTTP 429)**: Workspaces allow up to **120 requests/minute**. When HTTP 429 occurs, pause requests for the duration indicated in the `Retry-After` response header.\n- **Webhook Retries**: Endpoints must return a `2xx` status within **5 seconds**. Failed deliveries automatically retry with exponential backoff up to **8 times over 24 hours**.\n- **Signature Verification**: Validate incoming webhook payloads using the HMAC-SHA256 signature in the `X-Webhook-Signature` header.',
      reasoningSummary:
        'Exact technical specifications verified in KB-105 (TECH-DOC-12). High confidence and no account-specific server outage reported.',
      knowledgeSourcesUsed: [
        {
          id: 'KB-105',
          title: 'Webhook Delivery Retries, Signing Verification & Error 429 Handling',
          sourceRef: 'TECH-DOC-12 · Developer Webhooks & Rate Limits',
          excerpt:
            'If your integration receives HTTP 429 Too Many Requests, inspect the Retry-After header and ensure your client stays within the 120 requests/minute workspace burst quota.',
        },
      ],
    },
    messages: [
      {
        id: 'MSG-1045-1',
        authorType: 'customer',
        authorName: 'Hannah Brooks',
        content:
          'Our ingestion worker started seeing HTTP 429 responses when posting updates, and webhook deliveries are showing retries. What are the burst limits and signature headers we should verify?',
        timestamp: '2026-11-16T19:30:00Z',
      },
      {
        id: 'MSG-1045-2',
        authorType: 'ai',
        authorName: 'ResolveAI Assistant',
        authorRole: 'Evidence-Based AI Response',
        content:
          'Here is how rate limiting and webhook retries operate on your workspace:\n\n- **Burst Quota (HTTP 429)**: Workspaces allow up to **120 requests/minute**. When HTTP 429 occurs, pause requests for the duration indicated in the `Retry-After` response header.\n- **Webhook Retries**: Endpoints must return a `2xx` status within **5 seconds**. Failed deliveries automatically retry with exponential backoff up to **8 times over 24 hours**.\n- **Signature Verification**: Validate incoming webhook payloads using the HMAC-SHA256 signature in the `X-Webhook-Signature` header.',
        timestamp: '2026-11-16T19:30:07Z',
        sourcesUsed: [
          {
            id: 'KB-105',
            title: 'Webhook Delivery Retries, Signing Verification & Error 429 Handling',
            sourceRef: 'TECH-DOC-12 · Developer Webhooks & Rate Limits',
            excerpt:
              'If your integration receives HTTP 429 Too Many Requests, inspect the Retry-After header and ensure your client stays within the 120 requests/minute workspace burst quota.',
          },
        ],
      },
    ],
    timeline: [
      {
        id: 'TL-1045-1',
        label: 'Query submitted via Customer Support Portal',
        timestamp: '2026-11-16T19:30:00Z',
        actor: 'Customer',
      },
      {
        id: 'TL-1045-2',
        label: 'Verified against KB-105 (93% reliability)',
        timestamp: '2026-11-16T19:30:07Z',
        actor: 'ResolveAI',
      },
    ],
  },
  {
    id: 'RES-1044',
    customerName: 'Sofia Martinez',
    customerEmail: 'smartinez@clearview-analytics.com',
    customerTier: 'Starter',
    subject: 'Custom HIPAA BAA addendum request before upgrading workspace',
    query:
      'Before we upgrade from Starter to Enterprise, our legal counsel requires a signed HIPAA Business Associate Agreement (BAA) with custom liability clauses. Can you send over the redlined contract?',
    userSelectedCategory: 'Other',
    detectedCategory: 'Other',
    priority: 'High',
    status: 'Escalated',
    createdAt: '2026-11-16T16:12:00Z',
    updatedAt: '2026-11-16T16:20:00Z',
    assignedAgent: 'Marcus Reid',
    isSampleData: true,
    aiAnalysis: {
      detectedCategory: 'Other',
      detectedUrgency: 'High',
      classificationConfidence: 91,
      reliabilityScore: 34,
      reliabilityLevel: 'Low',
      isGroundedInKB: false,
      requiresEscalation: true,
      escalationReason:
        'Custom legal agreements and HIPAA BAA redlines are outside verified knowledge base coverage and require Account Legal review.',
      aiResponse: null,
      reasoningSummary:
        'No verified KB article covers custom HIPAA BAA contracts or legal redlines. Escalated to prevent unsupported legal claims.',
      knowledgeSourcesUsed: [],
    },
    messages: [
      {
        id: 'MSG-1044-1',
        authorType: 'customer',
        authorName: 'Sofia Martinez',
        content:
          'Before we upgrade from Starter to Enterprise, our legal counsel requires a signed HIPAA Business Associate Agreement (BAA) with custom liability clauses. Can you send over the redlined contract?',
        timestamp: '2026-11-16T16:12:00Z',
      },
    ],
    timeline: [
      {
        id: 'TL-1044-1',
        label: 'Query submitted via Customer Support Portal',
        timestamp: '2026-11-16T16:12:00Z',
        actor: 'Customer',
      },
      {
        id: 'TL-1044-2',
        label: 'Low KB coverage (34% reliability) · Escalated to Marcus Reid',
        timestamp: '2026-11-16T16:20:00Z',
        actor: 'ResolveAI',
      },
    ],
  },
  {
    id: 'RES-1043',
    customerName: 'Ethan Chen',
    customerEmail: 'ethan.chen@brightwave.co',
    customerTier: 'Growth',
    subject: 'Exporting 85,000 support audit rows to CSV',
    query:
      'When I click Export CSV on our yearly report, it says the export is queued instead of downloading immediately. Is there a row cap on instant downloads?',
    userSelectedCategory: 'Product Questions',
    detectedCategory: 'Product Questions',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '2026-11-16T11:05:00Z',
    updatedAt: '2026-11-16T11:25:00Z',
    assignedAgent: 'Claire Bennett',
    isSampleData: true,
    aiAnalysis: {
      detectedCategory: 'Product Questions',
      detectedUrgency: 'Low',
      classificationConfidence: 96,
      reliabilityScore: 95,
      reliabilityLevel: 'High',
      isGroundedInKB: true,
      requiresEscalation: false,
      escalationReason: null,
      aiResponse:
        'Yes—synchronous CSV downloads in **Reports > Export** support up to **50,000 records** per file. Because your report contains 85,000 rows, ResolveAI automatically queues it as an asynchronous background export and sends a secure download link to your registered email within **15 minutes**.',
      reasoningSummary: 'Verified directly against KB-106 (PROD-DOC-05).',
      knowledgeSourcesUsed: [
        {
          id: 'KB-106',
          title: 'CSV & JSON Data Export Limits and Scheduled Backups',
          sourceRef: 'PROD-DOC-05 · Reporting & Exports',
          excerpt:
            'Workspaces can export up to 50,000 records per synchronous CSV download from Reports > Export. Datasets exceeding 50,000 rows are queued automatically...',
        },
      ],
    },
    messages: [
      {
        id: 'MSG-1043-1',
        authorType: 'customer',
        authorName: 'Ethan Chen',
        content:
          'When I click Export CSV on our yearly report, it says the export is queued instead of downloading immediately. Is there a row cap on instant downloads?',
        timestamp: '2026-11-16T11:05:00Z',
      },
      {
        id: 'MSG-1043-2',
        authorType: 'ai',
        authorName: 'ResolveAI Assistant',
        authorRole: 'Evidence-Based AI Response',
        content:
          'Yes—synchronous CSV downloads in **Reports > Export** support up to **50,000 records** per file. Because your report contains 85,000 rows, ResolveAI automatically queues it as an asynchronous background export and sends a secure download link to your registered email within **15 minutes**.',
        timestamp: '2026-11-16T11:05:06Z',
        sourcesUsed: [
          {
            id: 'KB-106',
            title: 'CSV & JSON Data Export Limits and Scheduled Backups',
            sourceRef: 'PROD-DOC-05 · Reporting & Exports',
            excerpt:
              'Workspaces can export up to 50,000 records per synchronous CSV download from Reports > Export.',
          },
        ],
      },
    ],
    timeline: [
      {
        id: 'TL-1043-1',
        label: 'Query submitted via Customer Support Portal',
        timestamp: '2026-11-16T11:05:00Z',
        actor: 'Customer',
      },
      {
        id: 'TL-1043-2',
        label: 'AI response delivered (95% reliability)',
        timestamp: '2026-11-16T11:05:06Z',
        actor: 'ResolveAI',
      },
      {
        id: 'TL-1043-3',
        label: 'Customer confirmed export link received · Marked Resolved',
        timestamp: '2026-11-16T11:25:00Z',
        actor: 'Agent',
      },
    ],
  },
  {
    id: 'RES-1042',
    customerName: 'Lucas Meyer',
    customerEmail: 'lmeyer@rheinwerk-tech.de',
    customerTier: 'Starter',
    subject: 'Lost authenticator phone — how to use 2FA backup codes',
    query:
      'I replaced my phone this weekend and my authenticator app was wiped. How do I sign in using my backup codes or ask an admin to reset my 2FA?',
    userSelectedCategory: 'Account Access',
    detectedCategory: 'Account Access',
    priority: 'Medium',
    status: 'Waiting for Customer',
    createdAt: '2026-11-15T14:20:00Z',
    updatedAt: '2026-11-15T14:40:00Z',
    assignedAgent: 'Elena Vance',
    isSampleData: true,
    aiAnalysis: {
      detectedCategory: 'Account Access',
      detectedUrgency: 'Medium',
      classificationConfidence: 97,
      reliabilityScore: 92,
      reliabilityLevel: 'High',
      isGroundedInKB: true,
      requiresEscalation: false,
      escalationReason: null,
      aiResponse:
        'You can regain access in either of two ways:\n\n1. **Use a Backup Code**: On the 2FA verification screen, click **"Use a backup code"** and enter one of the 10 single-use 8-character codes saved during enrollment.\n2. **Workspace Admin Reset**: If you do not have your backup codes, any Workspace Admin can reset your MFA under **Directory > Members > Reset MFA**.\n\nIf you are the sole organization owner without backup codes, please reply to this ticket so our security team can complete manual identity verification.',
      reasoningSummary: 'Grounded in KB-102 (AUTH-DOC-09).',
      knowledgeSourcesUsed: [
        {
          id: 'KB-102',
          title: 'Two-Factor Authentication (2FA) Recovery & Backup Codes',
          sourceRef: 'AUTH-DOC-09 · Account Recovery Policy',
          excerpt:
            'Navigate to the sign-in challenge screen, select "Use a backup code," and enter an unused 8-character code.',
        },
      ],
    },
    messages: [
      {
        id: 'MSG-1042-1',
        authorType: 'customer',
        authorName: 'Lucas Meyer',
        content:
          'I replaced my phone this weekend and my authenticator app was wiped. How do I sign in using my backup codes or ask an admin to reset my 2FA?',
        timestamp: '2026-11-15T14:20:00Z',
      },
      {
        id: 'MSG-1042-2',
        authorType: 'ai',
        authorName: 'ResolveAI Assistant',
        authorRole: 'Evidence-Based AI Response',
        content:
          'You can regain access in either of two ways:\n\n1. **Use a Backup Code**: On the 2FA verification screen, click **"Use a backup code"** and enter one of the 10 single-use 8-character codes saved during enrollment.\n2. **Workspace Admin Reset**: If you do not have your backup codes, any Workspace Admin can reset your MFA under **Directory > Members > Reset MFA**.\n\nIf you are the sole organization owner without backup codes, please reply to this ticket so our security team can complete manual identity verification.',
        timestamp: '2026-11-15T14:20:06Z',
      },
      {
        id: 'MSG-1042-3',
        authorType: 'agent',
        authorName: 'Elena Vance',
        authorRole: 'Senior Support Specialist',
        content:
          'Checking in, Lucas — let us know if the backup code worked or if you need us to initiate an owner identity check.',
        timestamp: '2026-11-15T14:40:00Z',
      },
    ],
    timeline: [
      {
        id: 'TL-1042-1',
        label: 'Query submitted via Customer Support Portal',
        timestamp: '2026-11-15T14:20:00Z',
        actor: 'Customer',
      },
      {
        id: 'TL-1042-2',
        label: 'AI response delivered (92% reliability)',
        timestamp: '2026-11-15T14:20:06Z',
        actor: 'ResolveAI',
      },
      {
        id: 'TL-1042-3',
        label: 'Follow-up sent by Elena Vance · Status: Waiting for Customer',
        timestamp: '2026-11-15T14:40:00Z',
        actor: 'Agent',
      },
    ],
  },
  {
    id: 'RES-1041',
    customerName: 'Nadia Patel',
    customerEmail: 'nadia@kestrelstudio.co.uk',
    customerTier: 'Growth',
    subject: 'Difference between Agent and Read-Only Viewer permissions',
    query:
      'We are inviting our product managers to review support trends. Can Read-Only Viewers see internal agent notes or modify ticket statuses?',
    userSelectedCategory: 'Product Questions',
    detectedCategory: 'Product Questions',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '2026-11-14T09:15:00Z',
    updatedAt: '2026-11-14T09:15:05Z',
    assignedAgent: null,
    isSampleData: true,
    aiAnalysis: {
      detectedCategory: 'Product Questions',
      detectedUrgency: 'Low',
      classificationConfidence: 98,
      reliabilityScore: 98,
      reliabilityLevel: 'High',
      isGroundedInKB: true,
      requiresEscalation: false,
      escalationReason: null,
      aiResponse:
        'No—**Read-Only Viewers** cannot modify ticket statuses and cannot view internal agent notes. They can inspect analytics dashboards and customer-facing ticket summaries across the workspace, while Support Agents and Admins retain full triage and internal note access.',
      reasoningSummary: 'Directly answered by KB-107 (PROD-DOC-01).',
      knowledgeSourcesUsed: [
        {
          id: 'KB-107',
          title: 'Role-Based Permissions Matrix: Admin, Agent, and Read-Only Viewer',
          sourceRef: 'PROD-DOC-01 · Workspace Governance',
          excerpt:
            'Read-Only Viewers can inspect analytics and ticket summaries without modifying records or viewing internal agent notes.',
        },
      ],
    },
    messages: [
      {
        id: 'MSG-1041-1',
        authorType: 'customer',
        authorName: 'Nadia Patel',
        content:
          'We are inviting our product managers to review support trends. Can Read-Only Viewers see internal agent notes or modify ticket statuses?',
        timestamp: '2026-11-14T09:15:00Z',
      },
      {
        id: 'MSG-1041-2',
        authorType: 'ai',
        authorName: 'ResolveAI Assistant',
        authorRole: 'Evidence-Based AI Response',
        content:
          'No—**Read-Only Viewers** cannot modify ticket statuses and cannot view internal agent notes. They can inspect analytics dashboards and customer-facing ticket summaries across the workspace, while Support Agents and Admins retain full triage and internal note access.',
        timestamp: '2026-11-14T09:15:05Z',
      },
    ],
    timeline: [
      {
        id: 'TL-1041-1',
        label: 'Query submitted via Customer Support Portal',
        timestamp: '2026-11-14T09:15:00Z',
        actor: 'Customer',
      },
      {
        id: 'TL-1041-2',
        label: 'Resolved automatically via KB-107 (98% reliability)',
        timestamp: '2026-11-14T09:15:05Z',
        actor: 'ResolveAI',
      },
    ],
  },
  {
    id: 'RES-1040',
    customerName: 'Owen Gallagher',
    customerEmail: 'ogallagher@finpulse.com',
    customerTier: 'Enterprise',
    subject: 'Unexpected GDPR erasure request for workspace audit logs',
    query:
      'We received a GDPR Article 17 erasure request from an end-user and need to purge their records from immutable compliance audit exports within 72 hours.',
    userSelectedCategory: 'Other',
    detectedCategory: 'Other',
    priority: 'Critical',
    status: 'New',
    createdAt: '2026-11-17T04:05:00Z',
    updatedAt: '2026-11-17T04:05:00Z',
    assignedAgent: null,
    isSampleData: true,
    aiAnalysis: {
      detectedCategory: 'Other',
      detectedUrgency: 'Critical',
      classificationConfidence: 94,
      reliabilityScore: 28,
      reliabilityLevel: 'Low',
      isGroundedInKB: false,
      requiresEscalation: true,
      escalationReason:
        'GDPR Article 17 compliance deletion from immutable audit logs requires Data Protection Officer & Engineering intervention.',
      aiResponse: null,
      reasoningSummary:
        'Matched sensitive keyword "gdpr deletion" and no KB documentation supports audit log purging. Marked Critical and queued for human triage.',
      knowledgeSourcesUsed: [],
    },
    messages: [
      {
        id: 'MSG-1040-1',
        authorType: 'customer',
        authorName: 'Owen Gallagher',
        content:
          'We received a GDPR Article 17 erasure request from an end-user and need to purge their records from immutable compliance audit exports within 72 hours.',
        timestamp: '2026-11-17T04:05:00Z',
      },
    ],
    timeline: [
      {
        id: 'TL-1040-1',
        label: 'Query submitted via Customer Support Portal',
        timestamp: '2026-11-17T04:05:00Z',
        actor: 'Customer',
      },
      {
        id: 'TL-1040-2',
        label: 'Flagged for Critical Human Triage (28% KB coverage)',
        timestamp: '2026-11-17T04:05:03Z',
        actor: 'ResolveAI',
      },
    ],
  },
];

export const AGENT_ROSTER = [
  'Claire Bennett',
  'Elena Vance',
  'Marcus Reid',
];
