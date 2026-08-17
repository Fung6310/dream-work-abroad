import { FundingType, FUNDING_TYPES } from "@dreamworkabroad/shared";

export default function FundingTypeBadge({ fundingType }: { fundingType: FundingType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-bgAlt dark:bg-bgAlt2 px-2.5 py-0.5 text-xs font-medium text-text dark:text-text2">
      {FUNDING_TYPES[fundingType].label}
    </span>
  );
}
