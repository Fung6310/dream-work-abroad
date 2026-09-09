// FAQ content — every answer here is either a fact about how this specific
// site works (100% verifiable against the actual code) or deliberately
// general study-abroad guidance that hedges to the official source, same
// anti-fabrication principle as eligibilitySummary/applicationTimeline
// throughout the catalogue (see docs/ARCHITECTURE.md). Nothing here invents
// a specific statistic, success rate, or deadline that isn't already true
// elsewhere in this codebase.
export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "using-dreamworkabroad",
    label: "Using DreamWorkAbroad",
    items: [
      {
        question: "Is DreamWorkAbroad free to use?",
        answer:
          "Yes — searching, filtering, and using the matcher cost nothing, and always will. We're a directory, not a paid consultancy: providers pay for featured placement, not students for access.",
      },
      {
        question: "Do you process my application or apply on my behalf?",
        answer:
          "No. Every Apply button redirects you to the scholarship provider's own official application page — DreamWorkAbroad never handles your application, documents, or personal data for it. We list and organise scholarships; you apply directly.",
      },
      {
        question: "How is this different from a study-abroad consultancy?",
        answer:
          "A consultancy typically charges you (or earns commission) to counsel you 1-on-1 and submit applications for you. DreamWorkAbroad is a free self-serve directory — you search, compare, and apply yourself, directly on each provider's site.",
      },
      {
        question: "What does the \"Featured\" badge mean?",
        answer:
          "A paid placement, clearly labelled as such — the provider pays for visibility, but the scholarship still had to meet the same eligibility and accuracy checks as any other listing. See our partners page for how that works.",
      },
      {
        question: "Can I get notified before a deadline?",
        answer:
          "That's what Premium (currently in early access, join the waitlist) is for — deadline alerts, saved searches, and a weekly digest, free with no commitment. Until then, each scholarship's own detail page has a \"Get reminded\" option.",
      },
    ],
  },
  {
    id: "search-matching",
    label: "Search & Matching",
    items: [
      {
        question: "How does the matcher decide which scholarships I qualify for?",
        answer:
          "It narrows the catalogue by the structured fields we track — education level, field of study, region (Malaysia/international), and, for postgraduate, verified work-experience minimums. It's a starting shortlist, not a guarantee.",
      },
      {
        question: "I only have SPM — why do I see undergraduate-level scholarships, not just diplomas?",
        answer:
          "Several Malaysian government/GLC scholarships (JPA, MARA, Petronas, Khazanah-type awards) accept fresh SPM leavers directly and bundle a foundation or pre-university year into the sponsorship itself — so they're tagged undergraduate, not diploma. Always check the specific entry requirements on each listing.",
      },
      {
        question: "Does the matcher check my citizenship or grades?",
        answer:
          "No — those aren't structured, reliably-comparable fields across every scholarship, so we never filter on them (that would risk hiding something you actually qualify for, or fabricating a cutoff we can't verify). Always read the General Entry Requirements section on each listing before applying.",
      },
      {
        question: "No scholarships matched my search — what now?",
        answer:
          "Try broadening one input at a time: field of study to \"Any field\" first, then region, then reconsider your qualification tier. Our catalogue is a curated set, not every scholarship that exists, so a genuine gap is possible too.",
      },
    ],
  },
  {
    id: "scholarships-eligibility",
    label: "Scholarships & Eligibility",
    items: [
      {
        question: "What does \"verified-eligible\" mean?",
        answer:
          "Every listing's education level, funding type, and region were individually checked against the provider's own published information — not scraped and published blind. That said, providers update requirements over time, so the official page is always the final word.",
      },
      {
        question: "A scholarship's deadline or details look outdated — what do I do?",
        answer:
          "Please tell us via the contact details on our partners page. We'd rather fix it than leave it wrong, and we don't auto-publish anything scraped without a staff review first.",
      },
      {
        question: "Are Malaysian scholarships only for studying in Malaysia?",
        answer:
          "No — some Malaysian government/GLC/foundation scholarships (MARA Overseas, Khazanah Global, Yayasan Sime Darby, and others) fund study abroad too. That's what the Scope filter (Malaysia vs. International) tracks — who funds it, not where you study.",
      },
    ],
  },
  {
    id: "for-providers",
    label: "For Scholarship Providers",
    items: [
      {
        question: "How do I get my scholarship listed?",
        answer:
          "Get in touch via our partners page — we review every submission for accuracy before it goes live, the same standard every listing on the site is held to.",
      },
      {
        question: "What does a Featured placement cost?",
        answer:
          "Indicative pricing starts from RM 200/month, cheaper on a quarterly commitment, exact rate depending on how many relevant searches your programme matches — see the partners page for the full breakdown.",
      },
    ],
  },
];
