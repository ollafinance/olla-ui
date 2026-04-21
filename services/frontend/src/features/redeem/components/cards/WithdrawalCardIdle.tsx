import { Button } from "@/components/ui/Button";
import { CurrencySwapButton } from "@/components/ui/CurrencySwapButton";
import { PercentageButtons } from "@/components/ui/PercentageButtons";
import { useCurrency } from "@/hooks/useCurrency";
import { useAmountInput } from "@/hooks/useAmountInput";
import { usePercentageSelect } from "@/hooks/usePercentageSelect";
import { useTransactionFeeEstimate } from "@/hooks/protocol";
import { getAmountSizeClass } from "@/lib/utils";
import { BalanceBadge } from "@/components/ui/BalanceBadge";

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
  canInstantRedeem,
}: WithdrawalCardIdleProps) {
  const exchangeRateNum = parseFloat(exchangeRateProp) || null;
  const { isUsdMode, stAztecToUsd, usdToStAztec, aztecToUsd } = useCurrency({
    exchangeRate: exchangeRateNum,
  });
  const { inputValue, handleInputChange: handleAmountChange } = useAmountInput({
    amount,
    isUsdMode,
    onAmountChange,
    usdToToken: usdToStAztec,
    tokenToUsd: stAztecToUsd,
  });

  const { selectedPercentage, setSelectedPercentage, handlePercentageSelect } =
    usePercentageSelect({
      balance,
      isUsdMode,
      onAmountChange,
      usdToToken: usdToStAztec,
      tokenToUsd: stAztecToUsd,
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPercentage(undefined);
    handleAmountChange(e);
  };

  const usdValue = stAztecToUsd(amount);
  const previewUsdValue = aztecToUsd(previewAssets);

  const numericAmount = Number(amount);
  const numericBalance = parseFloat(balance);
  const isInputValid =
    !!amount && !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= numericBalance;

  const primaryLabel = isUsdMode ? "USD" : "stAztec";

  const inputAmountSizeClass = getAmountSizeClass(
    (isUsdMode ? "$" : "") + (inputValue || "0.00"),
    "withdraw"
  );

  const receiveDisplay = isUsdMode ? `$${previewUsdValue}` : previewAssets;
  const receiveSizeClass = getAmountSizeClass(receiveDisplay, "withdraw");

  const transactionFee = useTransactionFeeEstimate(
    isInstantMode ? "withdraw-instant" : "withdraw-request"
  );

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

          <div className="flex w-full items-end justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-end">
              {isUsdMode && (
                <span
                  className={`text-text-display pr-2 ${inputAmountSizeClass} leading-[1.16] font-medium tracking-[-1px]`}
                >
                  $
                </span>
              )}
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                maxLength={22}
                value={inputValue}
                onChange={handleInputChange}
                className={`text-text-display w-full min-w-0 border-none bg-transparent ${inputAmountSizeClass} leading-[1.16] font-medium tracking-[-1px] outline-none`}
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
          <p className="text-base leading-[1.16] font-medium text-[rgba(61,0,50,0.82)]">
            You will receive
          </p>

          <div className="flex w-full flex-col gap-2">
            {/* Net amount - always shown */}
            <div className="flex w-full items-end justify-between gap-2">
              <span
                className={`text-text-display min-w-0 flex-1 truncate ${receiveSizeClass} leading-[1.16] font-medium tracking-[-1px]`}
              >
                {receiveDisplay}
              </span>
              <span className="text-text-display shrink-0 text-base leading-[1.8] font-medium">
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
                  1 Aztec = {exchangeRateProp} stAztec
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] leading-[1.4] tracking-[0.27px] text-[#6c6c6c]">
                  Transaction Fee
                </span>
                <span className="text-[9px] leading-[1.4] font-medium tracking-[0.27px] text-[#6c6c6c]">
                  ~{transactionFee} ETH
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
