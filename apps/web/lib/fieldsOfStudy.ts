// A fixed, general list of university study fields for the matcher's "Field
// of study" dropdown — not derived from the live catalogue (unlike
// FilterSidebar's other facets), since the ask here is "every field a
// university offers", not "every field currently in our 34-row seed".
//
// `value` is matched against a scholarship's free-text fieldOfStudy via
// substring (see matchesFilters in packages/shared/src/compare.ts) — the
// same weak-but-honest matching the rest of the app already uses. Some
// values are deliberately shorter than their label (e.g. "Development"
// instead of "Development Studies") so they actually overlap with real
// seed-data phrasing like "Development-related fields"; most values will
// return 0 results today simply because the catalogue doesn't cover every
// discipline yet — that's expected, not a bug.
export interface FieldOfStudyOption {
  value: string;
  label: string;
}

export const FIELDS_OF_STUDY: FieldOfStudyOption[] = [
  { value: "", label: "Any field" },
  { value: "Accounting", label: "Accounting" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "Architecture", label: "Architecture" },
  { value: "Arts", label: "Arts & Humanities" },
  { value: "Biology", label: "Biology" },
  { value: "Built Environment", label: "Built Environment" },
  { value: "Business", label: "Business" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Communication", label: "Communication & Media" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Data Science", label: "Data Science" },
  { value: "Dentistry", label: "Dentistry" },
  { value: "Design", label: "Design" },
  { value: "Development", label: "Development Studies" },
  { value: "Economics", label: "Economics" },
  { value: "Education", label: "Education" },
  { value: "Electrical", label: "Electrical & Electronic Engineering" },
  { value: "Engineering", label: "Engineering (General)" },
  { value: "Environmental Science", label: "Environmental Science" },
  { value: "Finance", label: "Finance" },
  { value: "History", label: "History" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "International Relations", label: "International Relations" },
  { value: "Law", label: "Law" },
  { value: "Life Sciences", label: "Life Sciences" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Medicine", label: "Medicine" },
  { value: "Nursing", label: "Nursing" },
  { value: "Pharmacy", label: "Pharmacy" },
  { value: "Physics", label: "Physics" },
  { value: "Political Science", label: "Political Science" },
  { value: "Psychology", label: "Psychology" },
  { value: "Public Health", label: "Public Health" },
  { value: "Public Policy", label: "Public Policy" },
  { value: "Social Sciences", label: "Social Sciences" },
  { value: "Sociology", label: "Sociology" },
  { value: "Software Engineering", label: "Software Engineering" },
];
