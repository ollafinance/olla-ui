import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Toggle } from "@/components/ui/Toggle";
import { CurrencySwapButton } from "@/components/ui/CurrencySwapButton";
import { PercentageButtons } from "@/features/staking/components/shared/PercentageButtons";
import { ProtocolInfo } from "@/components/ProtocolInfo";
import { useCurrencySwap } from "@/hooks/useCurrencySwap";
import { sanitizeNumericInput } from "@/lib/utils";
import infoIcon from "@/assets/icons/info-icon.svg";

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
  exchangeRate,
  grossAssets,
  previewAssets,
  minAssetsOut,
  isInstantMode,
  onInstantModeChange,
  instantWithdrawFee,
  instantWithdrawFeePercent,
  canInstantRedeem,
}: WithdrawalCardIdleProps) {
  const { isUsdMode } = useCurrencySwap();
  const [selectedPercentage, setSelectedPercentage] = useState<number | undefined>();

  const AZTEC_PRICE_USD = 2.1; // TODO: Get from config

  const handlePercentageSelect = (percentage: number) => {
    setSelectedPercentage(percentage);
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || parsedBalance <= 0) return;

    if (isUsdMode) {
      const usdBalance = parsedBalance * AZTEC_PRICE_USD;
      const newUsdAmount = (usdBalance * percentage).toFixed(2);
      const tokenAmount = (parseFloat(newUsdAmount) / AZTEC_PRICE_USD).toFixed(2);
      onAmountChange(tokenAmount);
    } else {
      const newAmount = (parsedBalance * percentage).toFixed(2);
      onAmountChange(newAmount);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPercentage(undefined);
    const inputValue = sanitizeNumericInput(e.target.value);

    if (isUsdMode) {
      const usdAmount = parseFloat(inputValue);
      if (!isNaN(usdAmount) && usdAmount > 0) {
        const tokenAmount = (usdAmount / AZTEC_PRICE_USD).toFixed(2);
        onAmountChange(tokenAmount);
      } else {
        onAmountChange("0");
      }
    } else {
      onAmountChange(inputValue);
    }
  };

  const usdValue =
    amount && !isNaN(Number(amount)) ? (Number(amount) * AZTEC_PRICE_USD).toFixed(2) : "0.00";

  const numericAmount = Number(amount);
  const numericBalance = parseFloat(balance);
  const isInputValid =
    !!amount && !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= numericBalance;
  const isBalanceExceeded = numericAmount > numericBalance;

  const displayValue = isUsdMode ? usdValue : amount;
  const primaryLabel = isUsdMode ? "USD" : "stAztec";

  const handleToggleInstantMode = (checked: boolean) => {
    if (!canInstantRedeem && checked) {
      return; // Don't allow enabling if insufficient liquidity
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
          <div className="flex items-center gap-2 rounded-full bg-[#efeee6] py-1 pr-1 pl-[17px]">
            <span className="text-xs leading-[1.16] font-medium text-black">Balance</span>
            <div className="bg-card flex items-center justify-center rounded-full px-[15px] py-2">
              <span className="text-center text-xs leading-[1.16] font-medium text-black">
                {balance} stAztec
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex w-full flex-col gap-[11px]">
          <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
            <PercentageButtons
              selectedPercentage={selectedPercentage}
              onSelect={handlePercentageSelect}
            />
            <div className="flex items-center gap-2">
              <Toggle
                checked={isInstantMode}
                onChange={handleToggleInstantMode}
                label="Instant Withdraw"
                disabled={!canInstantRedeem && !isInstantMode}
              />
              <Tooltip
                content={
                  canInstantRedeem
                    ? "Enabling this will make your Aztec tokens instantly available."
                    : "Insufficient liquidity in the buffer for instant withdrawal"
                }
              >
                <img
                  src={infoIcon}
                  alt=""
                  className="h-4 w-4 opacity-50 transition-opacity hover:opacity-100"
                />
              </Tooltip>
            </div>
          </div>

          <div className="flex w-full items-end justify-between">
            <div className="flex max-w-[70%] items-end">
              {isUsdMode && (
                <span className="pr-2 text-[50px] leading-[1.16] font-medium tracking-[-1px] text-black">
                  $
                </span>
              )}
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={displayValue}
                onChange={handleInputChange}
                className="w-full border-none bg-transparent text-[50px] leading-[1.16] font-medium tracking-[-1px] text-black outline-none"
              />
            </div>
            <span className="text-base leading-[1.8] font-medium text-black">{primaryLabel}</span>
          </div>
          <div className="bg-border h-px w-full" />
          <div className="flex w-full items-center justify-between">
            <span className="text-primary-accent text-base leading-[1.16] font-medium">
              {isUsdMode ? `${amount} Aztec` : `$${usdValue} USD`}
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
          <p className="text-sm leading-[1.16] font-medium text-black">You will receive</p>

          <div className="flex w-full flex-col gap-2">
            {/* Show gross amount when instant mode is on */}
            {isInstantMode && (
              <>
                <div className="flex w-full items-baseline justify-between">
                  <span className="text-base leading-[1.16] font-medium tracking-[-0.5px] text-black">
                    {isUsdMode ? "$" : ""}
                    {grossAssets}
                  </span>
                  <span className="text-xs leading-[1.8] font-medium text-black">
                    {isUsdMode ? "USD" : "Aztec"}
                  </span>
                </div>

                {/* Fee line - SEPARATE and MORE VISIBLE */}
                {instantWithdrawFee !== "0" && (
                  <div className="flex w-full items-center justify-between py-0.5">
                    <span className="text-sm leading-[1.16] font-bold text-red-600">
                      -{instantWithdrawFee} {isUsdMode ? "USD" : "Aztec"}
                    </span>
                    <span className="text-sm leading-[1.16] font-medium text-black">
                      Instant fee ({instantWithdrawFeePercent})
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Net amount - always shown */}
            <div className="flex w-full items-end justify-between">
              <span className="text-[36px] leading-[1.16] font-medium tracking-[-0.8px] text-black">
                {isUsdMode
                  ? `$${(Number(previewAssets) * AZTEC_PRICE_USD).toFixed(2)} USD`
                  : `${previewAssets} Aztec`}
              </span>
              <span className="text-sm leading-[1.8] font-medium text-black">
                {isUsdMode ? "USD" : "Aztec"}
              </span>
            </div>

            <div className="bg-border h-px w-full" />

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-0.5">
                {/* Converted value - show opposite currency */}
                <span className="text-primary-accent text-sm leading-[1.16] font-medium">
                  {isUsdMode
                    ? `${previewAssets} Aztec`
                    : `$${(Number(previewAssets) * AZTEC_PRICE_USD).toFixed(2)} USD`}
                </span>
                {isInstantMode ? (
                  <span className="text-muted text-xs leading-[1.16] font-medium">
                    Min: {minAssetsOut} Aztec • Rate may vary
                  </span>
                ) : (
                  <span className="text-muted text-xs leading-[1.16] font-medium">
                    Final amount depends on exchange rate at claim time
                  </span>
                )}
              </div>
              <CurrencySwapButton />
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
            <ProtocolInfo exchangeRate={exchangeRate} transactionFee="0.0001" apy="5.2%" />
            <div className="flex items-center gap-2">
              {isConnected ? (
                isBalanceExceeded ? (
                  <Tooltip content="You do not have this amount of stAztec tokens">
                    <Button
                      variant="pink"
                      size="xl"
                      onClick={onWithdraw}
                      disabled={true}
                      showArrow
                      className="w-button-stake h-button bg-primary text-black"
                    >
                      Withdraw
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    variant="pink"
                    size="xl"
                    onClick={onWithdraw}
                    disabled={!isInputValid}
                    showArrow
                    className="w-button-stake h-button bg-primary text-black whitespace-nowrap"
                  >
                    Withdraw
                  </Button>
                )
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
