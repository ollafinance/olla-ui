import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Toggle } from "@/components/ui/Toggle";
import { CurrencySwapButton } from "@/components/ui/CurrencySwapButton";
import { PercentageButtons } from "@/features/staking/components/shared/PercentageButtons";
import { useCurrency } from "@/hooks/useCurrency";
import { sanitizeNumericInput } from "@/lib/utils";
import infoIcon from "@/assets/icons/info-icon.svg";
import { BalanceBadge } from "@/features/staking/components";

interface WithdrawalCardIdleProps {
  amount: string;
  onAmountChange: (val: string) => void;
  onWithdraw: () => void;
  isConnected: boolean;
  balance: string;
  exchangeRate: string;
  grossAssets: string;
  previewAssets: string;
  minAssetsOut: string;
  isInstantMode: boolean;
  onInstantModeChange: (val: boolean) => void;
  instantWithdrawFee: string;
  instantWithdrawFeePercent: string;
  canInstantRedeem: boolean;
}

export function WithdrawalCardIdle({
  amount,
  onAmountChange,
  onWithdraw,
  isConnected,
  balance,
  exchangeRate: exchangeRateProp,
  previewAssets,
  isInstantMode,
  onInstantModeChange,
  instantWithdrawFee,
  instantWithdrawFeePercent,
  canInstantRedeem,
}: WithdrawalCardIdleProps) {
  const exchangeRateNum = parseFloat(exchangeRateProp) || null;
  const { isUsdMode, stAztecToUsd, usdToStAztec, aztecToUsd } = useCurrency({
    exchangeRate: exchangeRateNum,
  });
  const [selectedPercentage, setSelectedPercentage] = useState<number | undefined>();

  // Local input state to prevent cursor jumping and formatting issues while typing
  const [inputValue, setInputValue] = useState("");

  // Sync local input when amount changes externally or mode changes
  const [lastSyncedAmount, setLastSyncedAmount] = useState(amount);
  const [lastMode, setLastMode] = useState(isUsdMode);

  if (amount !== lastSyncedAmount || isUsdMode !== lastMode) {
    const shouldUpdate = (() => {
      if (isUsdMode !== lastMode) return true;
      const currentValInStAztec = isUsdMode ? usdToStAztec(inputValue) : inputValue;
      if (!currentValInStAztec || isNaN(parseFloat(currentValInStAztec))) return true;
      return Math.abs(parseFloat(currentValInStAztec) - parseFloat(amount || "0")) > 0.000001;
    })();

    if (shouldUpdate) {
      const newValue = isUsdMode ? stAztecToUsd(amount) : amount;
      setInputValue(newValue === "0" ? "" : newValue);
    }

    setLastSyncedAmount(amount);
    setLastMode(isUsdMode);
  }

  const handlePercentageSelect = (percentage: number) => {
    setSelectedPercentage(percentage);
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || parsedBalance <= 0) return;

    if (isUsdMode) {
      const usdBalance = stAztecToUsd(parsedBalance);
      const newUsdAmount = (parseFloat(usdBalance) * percentage).toFixed(2);
      onAmountChange(usdToStAztec(newUsdAmount));
    } else {
      const newAmount = (parsedBalance * percentage).toFixed(2);
      onAmountChange(newAmount);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPercentage(undefined);
    const rawValue = e.target.value;

    if (!/^\d*\.?\d*$/.test(rawValue)) return;

    setInputValue(rawValue);
    const sanitizedValue = sanitizeNumericInput(rawValue);

    if (isUsdMode) {
      const usdAmount = parseFloat(sanitizedValue);
      if (!isNaN(usdAmount) && usdAmount > 0) {
        onAmountChange(usdToStAztec(usdAmount));
      } else {
        onAmountChange("0");
      }
    } else {
      onAmountChange(sanitizedValue);
    }
  };

  const usdValue = stAztecToUsd(amount);
  const previewUsdValue = aztecToUsd(previewAssets);

  const numericAmount = Number(amount);
  const numericBalance = parseFloat(balance);
  const isInputValid =
    !!amount && !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= numericBalance;

  const primaryLabel = isUsdMode ? "USD" : "stAztec";

  const handleToggleInstantMode = (checked: boolean) => {
    if (!canInstantRedeem && checked) {
      return;
    }
    onInstantModeChange(checked);
  };

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col">
      {/* Top section - Header and Input */}
      <div className="flex flex-col gap-4 px-8 pt-6 pb-4">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-[21.33px] leading-[1.16] font-medium text-black">
            Request Withdrawal
          </h2>
          <BalanceBadge balance={balance} isConnected={isConnected} currency="stAztec" />
        </div>

        <div className="mb-4 flex w-full flex-col gap-[11px]">
          <div className="flex w-full items-center justify-start">
            <PercentageButtons
              selectedPercentage={selectedPercentage}
              onSelect={handlePercentageSelect}
            />
          </div>

          <div className="flex w-full items-end justify-between">
            <div className="flex max-w-[70%] items-end">
              {isUsdMode && (
                <span className="text-text-display pr-2 text-[50px] leading-[1.16] font-medium tracking-[-1px]">
                  $
                </span>
              )}
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={inputValue}
                onChange={handleInputChange}
                className="text-text-display w-full border-none bg-transparent text-[50px] leading-[1.16] font-medium tracking-[-1px] outline-none"
              />
            </div>
            <span className="text-text-display shrink-0 text-base leading-[1.8] font-medium">
              {primaryLabel}
            </span>
          </div>
          <div className="bg-border h-px w-full" />
          <div className="flex w-full items-center justify-between">
            <span className="text-muted-foreground text-base leading-[1.16] font-medium">
              {isUsdMode ? `${amount} stAztec` : `$ ${usdValue}`}
            </span>
            <CurrencySwapButton />
          </div>
        </div>
      </div>

      {/* Middle section - takes remaining space */}
      <div className="flex-1" />

      {/* Bottom section - always at bottom */}
      <div className="px-4 pb-4">
        <div className="flex w-full flex-col gap-3 rounded-[28px] bg-[#efeee6] p-4">
          <div className="flex w-full items-start justify-between">
            <p className="text-base leading-[1.16] font-medium text-[rgba(61,0,50,0.82)]">
              You will receive
            </p>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-text-display text-xs">Instant withdrawal</span>
                <div className="relative">
                  <Toggle
                    checked={isInstantMode}
                    onChange={handleToggleInstantMode}
                    disabled={!canInstantRedeem && !isInstantMode}
                  />
                  {!canInstantRedeem && (
                    <Tooltip content="Insufficient liquidity in the buffer for instant withdrawal">
                      <img
                        src={infoIcon}
                        alt=""
                        className="absolute -top-1 -right-1 h-3 w-3 opacity-50"
                      />
                    </Tooltip>
                  )}
                </div>
              </div>
              {isInstantMode && (
                <p className="text-[9px] tracking-[0.27px] text-[#6c6c6c]">
                  Fee ({instantWithdrawFeePercent}) ~{instantWithdrawFee} Aztec
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            {/* Net amount - always shown */}
            <div className="flex w-full items-end justify-between">
              <span className="text-text-display text-[50px] leading-[1.16] font-medium tracking-[-1px]">
                {isUsdMode ? `$${previewUsdValue}` : previewAssets}
              </span>
              <span className="text-text-display text-base leading-[1.8] font-medium">
                {isUsdMode ? "USD" : "Aztec"}
              </span>
            </div>

            <div className="bg-border h-px w-full" />

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-0.5">
                {/* Converted value - show opposite currency */}
                <span className="text-muted-foreground text-base leading-[1.16] font-medium">
                  {isUsdMode ? `${previewAssets} Aztec` : `$ ${previewUsdValue}`}
                </span>
              </div>
              <CurrencySwapButton />
            </div>
          </div>

          <div className="mt-2 flex w-full items-center justify-between">
            <div className="flex items-center gap-7">
              <div className="flex flex-col">
                <span className="text-[9px] leading-[1.4] tracking-[0.27px] text-[#6c6c6c]">
                  Exchange Rate
                </span>
                <span className="text-[9px] leading-[1.4] font-medium tracking-[0.27px] text-[#6c6c6c]">
                  1 Aztec = 0.95 stAztec
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] leading-[1.4] tracking-[0.27px] text-[#6c6c6c]">
                  Transaction Fee
                </span>
                <span className="text-[9px] leading-[1.4] font-medium tracking-[0.27px] text-[#6c6c6c]">
                  ~0.0001 Aztec
                </span>
              </div>
            </div>

            <Button
              variant="pink"
              size="xl"
              onClick={onWithdraw}
              disabled={!isInputValid || (isInstantMode && !canInstantRedeem)}
              className="rounded-full bg-[#ffb0f1] px-6 py-3.5 text-lg font-medium tracking-[-0.36px] text-[#660053]"
            >
              Withdraw
              <svg
                width="11"
                height="13"
                viewBox="0 0 11 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2.5 inline-block"
              >
                <path d="M10.5 6.5L0.5 12.2735L0.5 0.726497L10.5 6.5Z" fill="currentColor" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
