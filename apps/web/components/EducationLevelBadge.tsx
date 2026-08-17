import { EducationLevel, EDUCATION_LEVELS } from "@dreamworkabroad/shared";

export default function EducationLevelBadge({ level }: { level: EducationLevel }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border dark:border-border2 px-2.5 py-0.5 text-xs text-textMuted dark:text-textMuted2">
      {EDUCATION_LEVELS[level].label}
    </span>
  );
}
