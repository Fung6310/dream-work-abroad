export default function QuizProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-1">
      <div className="mb-1.5 flex items-center justify-between text-xs text-textMuted dark:text-textMuted2">
        <span>
          Step {step} of {total}
        </span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bgAlt dark:bg-bgAlt2">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 dark:bg-primary2"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
