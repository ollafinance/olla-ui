import { useState } from "react";
import { useCurrency } from "@/hooks/useCurrency";

interface ReturnsCardProps {
  shares: string;
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
 * Calculates ONLY the profit earned over a period.
 * Uses the standard compounding APY formula.
 */
function calculateProfit(shares: string, days: number, apyStr: string): string {
  const principal = parseFloat(shares) || 0;
  const apy = parseFloat(apyStr) / 100;

  if (principal === 0) return "0.0000";

  // Total = P * (1 + r)^(t/365)
  const totalValue = principal * Math.pow(1 + apy, days / 365);
  const profit = totalValue - principal;

  // We use 4 decimals so Daily/Monthly aren't just "0.00"
  return profit.toFixed(4);
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
export function ReturnsCard({ shares, apy, exchangeRate }: ReturnsCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("daily");
  const { isUsdMode, stAztecToAztec, aztecToUsd } = useCurrency({
    exchangeRate: parseFloat(exchangeRate) || null,
  });

  // Calculate profit in stAztec tokens
  const stAztecProfit = calculateProfit(shares, periodMultiplier[selectedPeriod], apy);

  // Convert to Aztec
  const aztecProfit = stAztecToAztec(stAztecProfit);

  // Convert to USD
  const usdProfit = aztecToUsd(aztecProfit);

  // Determine display values based on currency mode
  const primaryValue = isUsdMode ? usdProfit : stAztecProfit;
  const primaryLabel = isUsdMode ? "USD" : "stAztec";
  const secondaryValue = isUsdMode ? stAztecProfit : usdProfit;
  const secondaryLabel = isUsdMode ? "stAztec" : "USD";
  const showSecondaryPrefix = !isUsdMode;

  return (
    <div className="bg-card-returns rounded-card flex min-h-[175px] w-full flex-1 flex-col items-start justify-between p-6 lg:min-h-0 lg:flex-1">
      <p className="text-card-returns-foreground text-lg leading-[1.16] font-medium">
        Estimated Profit
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
        <div className="flex w-full items-start justify-between">
          <span className="text-text-display text-[28.43px] leading-none font-medium tracking-[-0.57px]">
            {isUsdMode && "$"}
            {primaryValue}
          </span>
          <span className="text-text-display text-base leading-[1.8]">{primaryLabel}</span>
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
