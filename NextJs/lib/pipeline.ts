// Lead pipeline stages, shared by the dashboard and the API.
export const LEAD_STATUSES = ["New", "Contacted", "Booked", "Won", "Lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
}

// Older rows used other labels before the pipeline existed.
export function normalizeStatus(value: string | null | undefined): LeadStatus {
  if (isLeadStatus(value)) return value;
  if (value === "Follow-up") return "Contacted";
  return "New";
}

export const MAX_JOB_VALUE = 10_000_000;
