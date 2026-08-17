import { ApplyClickEvent, PremiumLead, Scholarship } from "@dreamworkabroad/shared";

// Both backends (fileStore.ts for local dev, pgStore.ts for production)
// implement this exact interface, so routes/*.ts never know or care which one
// is active — see store/index.ts for the switch and docs/ARCHITECTURE.md §3.
export interface Store {
  /** Load/connect and seed if empty. Must be awaited once before any other call. */
  init(): Promise<void>;

  getAllScholarships(): Promise<Scholarship[]>;
  getScholarshipById(id: string): Promise<Scholarship | undefined>;
  addScholarship(s: Scholarship): Promise<void>;
  updateScholarship(id: string, patch: Partial<Scholarship>): Promise<Scholarship | undefined>;
  deleteScholarship(id: string): Promise<boolean>;

  addClick(click: ApplyClickEvent): Promise<void>;
  getClicks(): Promise<ApplyClickEvent[]>;

  addLead(lead: PremiumLead): Promise<void>;
  getLeads(): Promise<PremiumLead[]>;
}
