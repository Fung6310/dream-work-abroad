import { ScrapedScholarshipCandidate } from "@dreamworkabroad/shared";

// Stand-in for what a real crawl of a scholarship directory/portal would
// surface — deliberately rougher than data/seed.ts (terse descriptions, some
// missing eligibilitySummary) so the admin review queue has realistic content
// to clean up before approving. Tagged by `sourceTag` so each mock
// ScholarshipSourceAdapter only picks up "its own" candidates — see
// adapters/mockAdapter.ts.
//
// Nothing here is fetched from a real website. Wiring an adapter to a real
// source is future work, gated on checking that site's robots.txt/terms first
// (see docs/ARCHITECTURE.md §5).

export interface MockScrapeSeedItem extends ScrapedScholarshipCandidate {
  sourceTag: string;
}

export const MOCK_SCRAPE_SEED: MockScrapeSeedItem[] = [
  // --- simulated crawl of a Malaysian scholarship directory ---
  {
    sourceTag: "study-malaysia-directory-mock",
    title: "Genting Group Scholarship",
    provider: "Genting Group",
    providerType: "private",
    scope: "malaysia",
    destinationCountry: "Malaysia",
    educationLevel: ["undergraduate"],
    fieldOfStudy: "Business, Hospitality, Engineering",
    fundingType: "partial",
    deadline: "2026-12-31",
    officialApplicationUrl: "https://www.gentinggroup.com",
    shortDescription: "Scholarship for Malaysian undergrads, tuition support.",
  },
  {
    sourceTag: "study-malaysia-directory-mock",
    title: "Top Glove Foundation Scholarship",
    provider: "Top Glove Foundation",
    providerType: "foundation",
    scope: "malaysia",
    destinationCountry: "Malaysia",
    educationLevel: ["undergraduate"],
    fieldOfStudy: "Any",
    fundingType: "full",
    deadline: "2027-01-20",
    officialApplicationUrl: "https://www.topglove.com",
    shortDescription: "Full scholarship, need-based, for B40 Malaysian students.",
  },
  {
    sourceTag: "study-malaysia-directory-mock",
    title: "Yayasan Tan Sri Khoo Teck Puat Scholarship",
    provider: "Yayasan Tan Sri Khoo Teck Puat",
    providerType: "foundation",
    scope: "malaysia",
    destinationCountry: "Malaysia",
    educationLevel: ["undergraduate"],
    fieldOfStudy: "Medicine, Engineering, Sciences",
    fundingType: "full",
    deadline: "2026-11-25",
    officialApplicationUrl: "https://www.ytskhtp.org.my",
    shortDescription: "Merit scholarship, medicine/engineering/science focus.",
  },
  {
    sourceTag: "study-malaysia-directory-mock",
    title: "Yayasan Sarawak Scholarship",
    provider: "Yayasan Sarawak",
    providerType: "government",
    scope: "malaysia",
    destinationCountry: "Malaysia",
    educationLevel: ["diploma", "undergraduate"],
    fieldOfStudy: "Any",
    fundingType: "full",
    deadline: "2027-02-10",
    officialApplicationUrl: "https://www.yayasansarawak.gov.my",
    shortDescription: "State scholarship for Sarawakian students.",
    eligibilitySummary: "Sarawak-born Malaysian citizen, meets academic requirement.",
  },
  {
    sourceTag: "study-malaysia-directory-mock",
    title: "Yayasan Sabah Scholarship",
    provider: "Yayasan Sabah",
    providerType: "government",
    scope: "malaysia",
    destinationCountry: "Malaysia",
    educationLevel: ["diploma", "undergraduate"],
    fieldOfStudy: "Any",
    fundingType: "full",
    deadline: "2027-02-10",
    officialApplicationUrl: "https://www.yayasansabah.org.my",
    shortDescription: "State scholarship for Sabahan students.",
    eligibilitySummary: "Sabah-born Malaysian citizen, meets academic requirement.",
  },

  // --- simulated crawl of a foreign-ministry / study-abroad portal ---
  {
    sourceTag: "moe-portal-mock",
    title: "Endeavour Leadership Program",
    provider: "Australian Government",
    providerType: "international",
    scope: "international",
    destinationCountry: "Australia",
    educationLevel: ["postgraduate", "phd"],
    fieldOfStudy: "Any",
    fundingType: "full",
    deadline: "2027-03-01",
    officialApplicationUrl: "https://www.dfat.gov.au",
    shortDescription: "Leadership-focused Australian govt award, funding varies.",
  },
  {
    sourceTag: "moe-portal-mock",
    title: "Taiwan ICDF Scholarship",
    provider: "Taiwan International Cooperation and Development Fund",
    providerType: "international",
    scope: "international",
    destinationCountry: "Taiwan",
    educationLevel: ["undergraduate", "postgraduate"],
    fieldOfStudy: "Any",
    fundingType: "full",
    deadline: "2027-03-31",
    officialApplicationUrl: "https://www.icdf.org.tw",
    shortDescription: "Full scholarship, tuition + stipend, various programmes.",
  },
  {
    sourceTag: "moe-portal-mock",
    title: "Government of Ireland International Scholarship",
    provider: "Government of Ireland",
    providerType: "international",
    scope: "international",
    destinationCountry: "Ireland",
    educationLevel: ["postgraduate"],
    fieldOfStudy: "Any",
    fundingType: "partial",
    deadline: "2027-03-15",
    officialApplicationUrl: "https://hea.ie",
    shortDescription: "Partial tuition waiver scholarship for postgrad study in Ireland.",
  },
  {
    sourceTag: "moe-portal-mock",
    title: "ASEAN-China Young Leaders Scholarship",
    provider: "China Scholarship Council",
    providerType: "international",
    scope: "international",
    destinationCountry: "China",
    educationLevel: ["postgraduate"],
    fieldOfStudy: "Public Policy, International Relations",
    fundingType: "full",
    deadline: "2027-04-01",
    officialApplicationUrl: "https://www.campuschina.org",
    shortDescription: "Full scholarship for ASEAN students, policy/IR focus.",
  },
  {
    sourceTag: "moe-portal-mock",
    title: "Chulalongkorn University ASEAN Scholarship",
    provider: "Chulalongkorn University",
    providerType: "university",
    scope: "international",
    destinationCountry: "Thailand",
    educationLevel: ["postgraduate"],
    fieldOfStudy: "Any",
    fundingType: "partial",
    deadline: "2027-02-15",
    officialApplicationUrl: "https://www.chula.ac.th",
    shortDescription: "Tuition waiver for ASEAN postgrad students at Chulalongkorn.",
  },
];
