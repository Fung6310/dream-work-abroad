// Splits the free-text fieldOfStudy ("Engineering, Sciences, Finance") into
// individual chips for display — no data-model change needed, since the
// underlying field already stores comma-separated subjects for multi-field
// scholarships (see packages/shared's Scholarship.fieldOfStudy).
export default function SubjectsSponsored({ fieldOfStudy }: { fieldOfStudy: string }) {
  const isAny = fieldOfStudy.trim().toLowerCase() === "any";
  const subjects = isAny
    ? []
    : fieldOfStudy
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  return (
    <div className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4">
      <h2 className="mb-2 font-semibold text-text dark:text-text2">Subjects Sponsored</h2>
      {isAny ? (
        <span className="inline-flex items-center rounded-full bg-bgAlt dark:bg-bgAlt2 px-2.5 py-0.5 text-xs font-medium text-text dark:text-text2">
          Open to all fields of study
        </span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((subject) => (
            <span
              key={subject}
              className="inline-flex items-center rounded-full bg-bgAlt dark:bg-bgAlt2 px-2.5 py-0.5 text-xs font-medium text-text dark:text-text2"
            >
              {subject}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
