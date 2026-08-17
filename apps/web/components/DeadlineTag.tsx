import { formatDeadline, isDeadlineSoon, isExpired } from "@dreamworkabroad/shared";

export default function DeadlineTag({ deadline }: { deadline: string }) {
  const expired = isExpired(deadline);
  const soon = !expired && isDeadlineSoon(deadline);

  const classes = expired
    ? "bg-statusExpiredBg dark:bg-statusExpiredBg2 text-statusExpiredText dark:text-statusExpiredText2"
    : soon
      ? "bg-statusRejectedBg dark:bg-statusRejectedBg2 text-danger dark:text-danger2"
      : "bg-bgAlt dark:bg-bgAlt2 text-textMuted dark:text-textMuted2";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {expired ? "Closed " : soon ? "Deadline soon: " : "Deadline: "}
      {formatDeadline(deadline)}
    </span>
  );
}
