import { createMockScholarshipAdapter } from "./mockAdapter";
import { ScholarshipSourceAdapter } from "./types";

// One adapter per ingestion source. Today both are mock adapters reading
// data/mockScrapeSeed.ts. To go live for a given source later:
//
//   1. Confirm the target site's robots.txt / terms of service actually
//      permit automated fetching — never bypass bot-detection or CAPTCHAs.
//   2. Implement a class satisfying ScholarshipSourceAdapter (adapters/types.ts)
//      that fetches + parses that site instead of reading the mock seed.
//   3. Swap the corresponding line below — nothing else in the app changes,
//      since routes/admin.ts's ingest endpoint just iterates ADAPTERS.
//
// See docs/ARCHITECTURE.md §5 for the full rationale.
export const ADAPTERS: ScholarshipSourceAdapter[] = [
  createMockScholarshipAdapter("study-malaysia-directory-mock"),
  createMockScholarshipAdapter("moe-portal-mock"),
];
