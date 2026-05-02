import {
  Mail,
  Upload,
  Webhook,
  Clock,
  Send,
  FileInput,
  ScanText,
  GitBranch,
  Sigma,
  Shuffle,
  UserCheck,
  ShieldCheck,
  Users,
  MessageSquare,
  Bell,
  Reply,
  Database,
  FileSpreadsheet,
  Cloud,
  Globe,
  HardDrive,
  Timer,
  Merge,
  Repeat,
  type LucideIcon,
} from "lucide-react";

export type HandleKind =
  | "trigger"
  | "document"
  | "extraction"
  | "decision"
  | "any"
  | "none";

export type NodeCategoryKey =
  | "trigger"
  | "ingest"
  | "extract"
  | "logic"
  | "human"
  | "comms"
  | "destination"
  | "utility";

export interface NodeCategory {
  key: NodeCategoryKey;
  label: string;
  /** HSL string body (e.g. "25 90% 55%") — used inline to keep tailwind safelist-free */
  hue: string;
  description: string;
}

export const NODE_CATEGORIES: Record<NodeCategoryKey, NodeCategory> = {
  trigger: {
    key: "trigger",
    label: "Triggers",
    hue: "25 90% 55%", // amber/orange
    description: "Where a workflow run begins",
  },
  ingest: {
    key: "ingest",
    label: "Ingestion",
    hue: "200 90% 50%", // sky blue
    description: "Collect documents or data from people",
  },
  extract: {
    key: "extract",
    label: "Extraction",
    hue: "265 85% 60%", // violet
    description: "Pull structured fields from documents",
  },
  logic: {
    key: "logic",
    label: "Logic",
    hue: "45 95% 50%", // gold
    description: "Branching, expressions and routing",
  },
  human: {
    key: "human",
    label: "Human Review",
    hue: "330 80% 55%", // pink/rose
    description: "Send out for verification or approval",
  },
  comms: {
    key: "comms",
    label: "Communication",
    hue: "175 75% 42%", // teal
    description: "Notify or message people",
  },
  destination: {
    key: "destination",
    label: "Destinations",
    hue: "150 70% 42%", // green
    description: "Push final data into external systems",
  },
  utility: {
    key: "utility",
    label: "Utility",
    hue: "230 15% 45%", // slate
    description: "Wait, merge, loop and helpers",
  },
};

export interface NodeTypeDef {
  type: string;
  label: string;
  short: string;
  category: NodeCategoryKey;
  icon: LucideIcon;
  inputs: HandleKind[];
  outputs: HandleKind[];
  /** Default config payload for new instances */
  defaults: Record<string, unknown>;
}

export const NODE_TYPES: NodeTypeDef[] = [
  // Triggers
  {
    type: "trigger.email",
    label: "Email Inbox",
    short: "Run when an email arrives at a dedicated inbox",
    category: "trigger",
    icon: Mail,
    inputs: [],
    outputs: ["document"],
    defaults: {
      inboxAddress: "intake@workflow.docstruct.ai",
      attachmentsOnly: true,
    },
  },
  {
    type: "trigger.upload",
    label: "GUI Upload",
    short: "Users drop documents into the portal",
    category: "trigger",
    icon: Upload,
    inputs: [],
    outputs: ["document"],
    defaults: { allowedTypes: ["pdf", "image"], multiple: true },
  },
  {
    type: "trigger.webhook",
    label: "Webhook",
    short: "Run when an external system POSTs payload",
    category: "trigger",
    icon: Webhook,
    inputs: [],
    outputs: ["document"],
    defaults: { url: "https://api.docstruct.ai/hooks/…", auth: "bearer" },
  },
  {
    type: "trigger.schedule",
    label: "Scheduled",
    short: "Run on a recurring schedule",
    category: "trigger",
    icon: Clock,
    inputs: [],
    outputs: ["trigger"],
    defaults: { cron: "0 9 * * MON-FRI" },
  },
  {
    type: "trigger.invitation",
    label: "External Invitation",
    short: "Send a one-time link to a customer to begin",
    category: "trigger",
    icon: Send,
    inputs: [],
    outputs: ["document"],
    defaults: { recipient: "{{customer.email}}", expiresInDays: 7 },
  },

  // Ingestion / multi-step intake
  {
    type: "ingest.requestData",
    label: "Request Data from User",
    short: "Pause flow and ask a person for more docs / fields",
    category: "ingest",
    icon: FileInput,
    inputs: ["any"],
    outputs: ["document"],
    defaults: {
      audience: "external",
      assignee: "{{customer.email}}",
      fields: [{ key: "passport", label: "Passport scan", type: "file" }],
    },
  },
  {
    type: "ingest.formStep",
    label: "Form Step",
    short: "Collect structured form input from an internal user",
    category: "ingest",
    icon: FileInput,
    inputs: ["any"],
    outputs: ["any"],
    defaults: { title: "Reviewer notes", fields: [] },
  },

  // Extraction
  {
    type: "extract.template",
    label: "Template Extract",
    short: "Run a configured template against the document",
    category: "extract",
    icon: ScanText,
    inputs: ["document"],
    outputs: ["extraction"],
    defaults: { templateId: "tmpl_invoice_v3", confidenceThreshold: 0.85 },
  },

  // Logic
  {
    type: "logic.expression",
    label: "Expression",
    short: "Compute a derived value or boolean",
    category: "logic",
    icon: Sigma,
    inputs: ["extraction"],
    outputs: ["extraction"],
    defaults: { expression: "extraction.total > 10000" },
  },
  {
    type: "logic.branch",
    label: "If / Else Branch",
    short: "Send the run down one of two paths",
    category: "logic",
    icon: GitBranch,
    inputs: ["extraction"],
    outputs: ["decision", "decision"],
    defaults: { condition: "extraction.total > 10000" },
  },
  {
    type: "logic.switch",
    label: "Switch / Router",
    short: "Route to one of N outputs based on a value",
    category: "logic",
    icon: Shuffle,
    inputs: ["extraction"],
    outputs: ["decision", "decision", "decision"],
    defaults: {
      on: "extraction.documentType",
      cases: ["invoice", "receipt", "other"],
    },
  },

  // Human review (no "checker" terminology)
  {
    type: "human.verify",
    label: "Send for Verification",
    short: "Person reviews & corrects the extraction",
    category: "human",
    icon: UserCheck,
    inputs: ["extraction"],
    outputs: ["extraction"],
    defaults: {
      payloadType: "document+extraction",
      assigneeRule: "round-robin",
      slaHours: 24,
    },
  },
  {
    type: "human.approve",
    label: "Send for Approval",
    short: "Person approves or rejects",
    category: "human",
    icon: ShieldCheck,
    inputs: ["extraction"],
    outputs: ["decision", "decision"],
    defaults: {
      payloadType: "summary",
      assignee: "approvals@org.com",
      slaHours: 48,
    },
  },
  {
    type: "human.multiApprove",
    label: "Multi-Approval",
    short: "Several people must approve (parallel or sequential)",
    category: "human",
    icon: Users,
    inputs: ["extraction"],
    outputs: ["decision", "decision"],
    defaults: { mode: "parallel", quorum: 2, approvers: [] },
  },

  // Communication
  {
    type: "comms.email",
    label: "Send Email",
    short: "Send a templated email with variables",
    category: "comms",
    icon: Mail,
    inputs: ["any"],
    outputs: ["any"],
    defaults: {
      to: "{{customer.email}}",
      subject: "Update on your submission",
      body: "",
    },
  },
  {
    type: "comms.notify",
    label: "Send Notification",
    short: "In-app or push notification",
    category: "comms",
    icon: Bell,
    inputs: ["any"],
    outputs: ["any"],
    defaults: { channel: "in-app", message: "" },
  },
  {
    type: "comms.requestCorrection",
    label: "Request Correction",
    short: "Ask the original submitter to fix something",
    category: "comms",
    icon: Reply,
    inputs: ["any"],
    outputs: ["document"],
    defaults: { to: "{{customer.email}}", reason: "" },
  },

  // Destinations (UI shells)
  {
    type: "dest.salesforce",
    label: "Salesforce",
    short: "Create or update a Salesforce record",
    category: "destination",
    icon: Cloud,
    inputs: ["extraction"],
    outputs: ["none"],
    defaults: {
      object: "Opportunity",
      operation: "upsert",
      externalIdField: "ExtId__c",
      mapping: {},
    },
  },
  {
    type: "dest.googleSheets",
    label: "Google Sheets",
    short: "Append a row to a sheet",
    category: "destination",
    icon: FileSpreadsheet,
    inputs: ["extraction"],
    outputs: ["none"],
    defaults: { spreadsheetId: "", sheet: "Sheet1", mapping: {} },
  },
  {
    type: "dest.hubspot",
    label: "HubSpot",
    short: "Create or update a HubSpot contact / deal",
    category: "destination",
    icon: Cloud,
    inputs: ["extraction"],
    outputs: ["none"],
    defaults: { object: "contact", operation: "upsert", mapping: {} },
  },
  {
    type: "dest.webhook",
    label: "HTTP Webhook",
    short: "POST the payload to a URL",
    category: "destination",
    icon: Globe,
    inputs: ["extraction"],
    outputs: ["none"],
    defaults: { url: "", method: "POST", auth: "none", headers: {} },
  },
  {
    type: "dest.storage",
    label: "Cloud Storage",
    short: "Save documents and JSON to a bucket / drive",
    category: "destination",
    icon: HardDrive,
    inputs: ["extraction"],
    outputs: ["none"],
    defaults: { provider: "s3", bucket: "", path: "/{{workflow}}/{{date}}/" },
  },
  {
    type: "dest.database",
    label: "Database",
    short: "Insert a row into a managed table",
    category: "destination",
    icon: Database,
    inputs: ["extraction"],
    outputs: ["none"],
    defaults: { table: "submissions", mapping: {} },
  },

  // Utility
  {
    type: "utility.delay",
    label: "Wait / Delay",
    short: "Pause for a duration before continuing",
    category: "utility",
    icon: Timer,
    inputs: ["any"],
    outputs: ["any"],
    defaults: { duration: 1, unit: "hour" },
  },
  {
    type: "utility.merge",
    label: "Merge",
    short: "Wait for multiple incoming branches",
    category: "utility",
    icon: Merge,
    inputs: ["any", "any"],
    outputs: ["any"],
    defaults: { strategy: "all" },
  },
  {
    type: "utility.loop",
    label: "Loop",
    short: "Iterate over an array (e.g. line items)",
    category: "utility",
    icon: Repeat,
    inputs: ["any"],
    outputs: ["any"],
    defaults: { over: "extraction.lineItems" },
  },
];

export const NODE_TYPE_BY_KEY: Record<string, NodeTypeDef> = Object.fromEntries(
  NODE_TYPES.map((n) => [n.type, n])
);

export function nodesByCategory(): Record<NodeCategoryKey, NodeTypeDef[]> {
  const out = {} as Record<NodeCategoryKey, NodeTypeDef[]>;
  (Object.keys(NODE_CATEGORIES) as NodeCategoryKey[]).forEach(
    (k) => (out[k] = [])
  );
  NODE_TYPES.forEach((n) => out[n.category].push(n));
  return out;
}
