import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";
import { CurrencySwapButton } from "@/components/ui/CurrencySwapButton";
import { BalanceBadge } from "../shared/BalanceBadge";
import { PercentageButtons } from "../shared/PercentageButtons";
import { ProtocolInfo } from "@/components/ProtocolInfo";
import { useCurrencySwap } from "@/hooks/useCurrencySwap";
import { STAKING_CONSTANTS } from "../../constants";
import { sanitizeNumericInput } from "@/lib/utils";

interface StakingCardIdleProps {
  amount: string;
  balance: string;
  isConnected: boolean;
  exchangeRate: string;
  onAmountChange: (val: string) => void;
  onStake: () => void;
}

export function StakingCardIdle({
  amount,
  balance,
  isConnected,
  exchangeRate,
  onAmountChange,
  onStake,
}: StakingCardIdleProps) {
  const { isUsdMode } = useCurrencySwap();
  const [selectedPercentage, setSelectedPercentage] = useState<number | undefined>(0.25);

  const handlePercentageSelect = (percentage: number) => {
    setSelectedPercentage(percentage);
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || parsedBalance <= 0) return;

    if (isUsdMode) {
      const usdBalance = parsedBalance * STAKING_CONSTANTS.AZTEC_PRICE_USD;
      const newUsdAmount = (usdBalance * percentage).toFixed(2);
      const tokenAmount = (parseFloat(newUsdAmount) / STAKING_CONSTANTS.AZTEC_PRICE_USD).toFixed(2);
      onAmountChange(tokenAmount);
    } else {
      const newAmount = (parsedBalance * percentage).toFixed(2);
      onAmountChange(newAmount);
    }
  };

  const usdValue =
    amount && !isNaN(Number(amount))
      ? (Number(amount) * STAKING_CONSTANTS.AZTEC_PRICE_USD).toFixed(2)
      : "0.00";

  const isInputValid = !!amount && !isNaN(Number(amount)) && Number(amount) > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPercentage(undefined);
    const inputValue = sanitizeNumericInput(e.target.value);
    
    if (isUsdMode) {
      const usdAmount = parseFloat(inputValue);
      if (!isNaN(usdAmount) && usdAmount > 0) {
        const tokenAmount = (usdAmount / STAKING_CONSTANTS.AZTEC_PRICE_USD).toFixed(2);
        onAmountChange(tokenAmount);
      } else {
        onAmountChange("0");
      }
    } else {
      onAmountChange(inputValue);
    }
  };

  const displayValue = isUsdMode ? usdValue : amount;
  const primaryLabel = isUsdMode ? "USD" : "Aztec";
  const secondaryValue = isUsdMode ? amount : usdValue;
  const secondaryLabel = isUsdMode ? "Aztec" : "$";

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col items-center justify-between p-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-lg leading-[1.16] font-medium text-black">You Stake</h2>
        <BalanceBadge balance={balance} isConnected={isConnected} />
      </div>

      <div className="flex w-full flex-1 flex-col justify-center gap-3">
        <PercentageButtons
          selectedPercentage={selectedPercentage}
          onSelect={handlePercentageSelect}
        />

        <div className="flex w-full items-end justify-between">
          <div className="flex max-w-[70%] items-end">
            {isUsdMode && (
              <span className="pr-2 text-[67px] leading-[1.16] font-medium tracking-[-1.35px] text-black">
                $
              </span>
            )}
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={displayValue}
              onChange={handleInputChange}
              className="w-full border-none bg-transparent text-[67px] leading-[1.16] font-medium tracking-[-1.35px] text-black outline-none"
            />
          </div>
          <span className="shrink-0 text-base leading-[1.8] font-medium text-black">
            {primaryLabel}
          </span>
        </div>

        <div className="bg-border h-px w-full" />

        <div className="flex w-full items-center justify-between">
          <span className="text-primary-accent text-base leading-[1.16] font-medium">
            {isUsdMode ? `${secondaryValue} ${secondaryLabel}` : `$ ${secondaryValue}`}
          </span>
          <CurrencySwapButton />
        </div>
      </div>

      <div className="gap-43px flex w-full flex-col items-center justify-between lg:flex-row">
        <ProtocolInfo
          exchangeRate={exchangeRate}
          transactionFee={STAKING_CONSTANTS.TRANSACTION_FEE}
          apy={STAKING_CONSTANTS.APY}
        />
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Button
              variant="muted"
              size="xl"
              onClick={onStake}
              disabled={!isInputValid}
              showArrow
              className="w-button-stake h-button bg-muted-soft text-black"
            >
              Stake
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </div>
  );
}
