import { ScrapedScholarshipCandidate } from "@dreamworkabroad/shared";

// Same shape as deal-aggregator's SourceAdapter (identifier + one async fetch
// method), adapted because scholarship ingestion is a periodic "what's new"
// pull rather than a per-query search. See docs/ARCHITECTURE.md §5 for how a
// real per-site scraper would implement this later.
export interface ScholarshipSourceAdapter {
  source: string;
  fetchNew(): Promise<ScrapedScholarshipCandidate[]>;
}
