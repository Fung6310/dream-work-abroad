import { ProviderType, PROVIDER_TYPES } from "@dreamworkabroad/shared";

export default function ProviderTypeBadge({ providerType }: { providerType: ProviderType }) {
  const info = PROVIDER_TYPES[providerType];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: info.badgeColor }}
    >
      {info.label}
    </span>
  );
}
