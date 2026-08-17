import { ScrapedScholarshipCandidate } from "@dreamworkabroad/shared";
import { MOCK_SCRAPE_SEED } from "../data/mockScrapeSeed";
import { ScholarshipSourceAdapter } from "./types";

// Stands in for a real scraper: "fetches" candidates by filtering the local
// mock-scrape seed file by sourceTag, so the ingest pipeline is fully
// demoable without ever hitting a live external site during dev.
export function createMockScholarshipAdapter(source: string): ScholarshipSourceAdapter {
  return {
    source,
    async fetchNew(): Promise<ScrapedScholarshipCandidate[]> {
      return MOCK_SCRAPE_SEED.filter((item) => item.sourceTag === source).map(
        ({ sourceTag, ...candidate }) => candidate
      );
    },
  };
}
