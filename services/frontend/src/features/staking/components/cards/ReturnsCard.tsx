import { useState } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import {
  getAmountSizeClass,
  toScaledBigInt,
  fromScaledBigInt,
  mulScaled,
} from "@/lib/utils";

interface ReturnsCardProps {
  amount: string;
  apy: string;
  exchangeRate: string;
}

type Period = "daily" | "monthly" | "yearly";

const periodMultiplier: Record<Period, number> = {
  daily: 1,
  monthly: 30,
  yearly: 365,
};

/**
 * Calculates the total projected value (Principal + Earnings) over a period.
 * Uses the standard compounding APY formula. Principal is kept as a scaled
 * bigint so we never lose precision when the user's balance is large — only
 * the growth factor uses Number (bounded by realistic APY, so precision is
 * not a concern there).
 */
function calculateReturn(shares: string, days: number, apyStr: string): string {
  const principalBig = toScaledBigInt(shares);
  if (principalBig === 0n) return "0";

  const apy = parseFloat(apyStr) / 100;
  if (!Number.isFinite(apy)) return fromScaledBigInt(principalBig, 2);

  const growth = Math.pow(1 + apy, days / 365);
  const growthBig = toScaledBigInt(growth);
  return fromScaledBigInt(mulScaled(principalBig, growthBig), 2);
}

function PeriodButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[28px] px-[10px] py-[2px] text-xs leading-[1.8] font-medium transition-colors ${
        isActive
          ? "bg-card-returns-foreground text-[#ffe7fb]"
          : "text-card-returns-foreground bg-white/50"
      }`}
    >
      {label}
    </button>
  );
}
export function ReturnsCard({ amount, apy, exchangeRate }: ReturnsCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("daily");
  const { isUsdMode, stAztecToAztec, aztecToUsd } = useCurrency({
    exchangeRate: parseFloat(exchangeRate) || null,
  });

  // Calculate total return in stAztec tokens (Principal + Earnings)
  const stAztecReturn = calculateReturn(amount, periodMultiplier[selectedPeriod], apy);

  // Convert to Aztec
  const aztecReturn = stAztecToAztec(stAztecReturn);

  // Convert to USD
  const usdReturn = aztecToUsd(aztecReturn);

  // Determine display values based on currency mode
  const primaryValue = isUsdMode ? usdReturn : stAztecReturn;
  const primaryLabel = isUsdMode ? "USD" : "Aztec";
  const secondaryValue = isUsdMode ? stAztecReturn : usdReturn;
  const secondaryLabel = isUsdMode ? "Aztec" : "USD";
  const showSecondaryPrefix = !isUsdMode;

  const primaryDisplay = (isUsdMode ? "$" : "") + primaryValue;
  const primarySizeClass = getAmountSizeClass(primaryDisplay, "compact");

  return (
    <div className="bg-card-returns rounded-card flex min-h-[175px] w-full flex-1 flex-col items-start justify-between p-6 lg:min-h-0 lg:flex-1">
      <p className="text-card-returns-foreground text-lg leading-[1.16] font-medium">
        Estimated Return
      </p>

      <div className="flex-1" />

      <div className="flex w-full flex-col gap-2">
        {/* Secondary Row (small) */}
        <div className="flex w-full items-start justify-between text-[9px] tracking-[-0.18px]">
          <span className="text-text-display">
            {showSecondaryPrefix && "~ $"}
            {secondaryValue}
          </span>
          <span className="text-text-display">{secondaryLabel}</span>
        </div>

        {/* Primary Row (large) */}
        <div className="flex w-full items-start justify-between gap-2">
          <span
            className={`text-text-display min-w-0 flex-1 truncate ${primarySizeClass} leading-none font-medium tracking-[-0.57px] transition-[font-size] duration-150`}
          >
            {primaryDisplay}
          </span>
          <span className="text-text-display shrink-0 text-base leading-[1.8]">
            {primaryLabel}
          </span>
        </div>

        <div className="bg-primary-line h-px w-full" />

        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {(["daily", "monthly", "yearly"] as Period[]).map((p) => (
              <PeriodButton
                key={p}
                label={p.charAt(0).toUpperCase() + p.slice(1)}
                isActive={selectedPeriod === p}
                onClick={() => setSelectedPeriod(p)}
              />
            ))}
          </div>
          <span className="text-card-returns-foreground text-xs tracking-[0.36px]">
            APY <span className="font-medium tracking-[0.48px]">{apy}%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
