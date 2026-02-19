import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CurrencySwapButton } from "@/components/ui/CurrencySwapButton";
import { BalanceBadge } from "../shared/BalanceBadge";
import { PercentageButtons } from "../shared/PercentageButtons";
import { ProtocolInfo } from "@/components/ProtocolInfo";
import { useCurrencySwap } from "@/hooks/useCurrencySwap";
import { MOCK_BALANCES, STAKING_CONSTANTS } from "../../constants";

interface StakingCardIdleProps {
  amount: string;
  onAmountChange: (val: string) => void;
  onStake: () => void;
  onStakeWithError: () => void;
}

export function StakingCardIdle({
  amount,
  onAmountChange,
  onStake,
}: StakingCardIdleProps) {
  const { isUsdMode } = useCurrencySwap();
  const [selectedPercentage, setSelectedPercentage] = useState<
    number | undefined
  >(0.25);

  const handlePercentageSelect = (percentage: number) => {
    setSelectedPercentage(percentage);
    const balance = parseFloat(MOCK_BALANCES.AZTEC_BALANCE);
    if (isUsdMode) {
      const usdBalance = balance * STAKING_CONSTANTS.AZTEC_PRICE_USD;
      const newUsdAmount = (usdBalance * percentage).toFixed(2);
      const tokenAmount = (
        parseFloat(newUsdAmount) / STAKING_CONSTANTS.AZTEC_PRICE_USD
      ).toFixed(2);
      onAmountChange(tokenAmount);
    } else {
      const newAmount = (balance * percentage).toFixed(2);
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
    const inputValue = e.target.value;
    if (isUsdMode) {
      const usdAmount = parseFloat(inputValue);
      if (!isNaN(usdAmount) && usdAmount > 0) {
        const tokenAmount = (
          usdAmount / STAKING_CONSTANTS.AZTEC_PRICE_USD
        ).toFixed(2);
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
    <div className="bg-card rounded-card p-6 flex flex-col items-center justify-between w-full h-full min-h-[551px]">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-lg text-black leading-[1.16] font-medium">
          You Stake
        </h2>
        <BalanceBadge />
      </div>

      <div className="flex flex-col gap-3 w-full flex-1 justify-center">
        <PercentageButtons
          selectedPercentage={selectedPercentage}
          onSelect={handlePercentageSelect}
        />

        <div className="flex items-end justify-between w-full">
          <div className="flex items-end max-w-[70%]">
            {isUsdMode && (
              <span className="text-[67px] leading-[1.16] tracking-[-1.35px] text-black pr-2 font-medium">
                $
              </span>
            )}
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={displayValue}
              onChange={handleInputChange}
              className="text-[67px] leading-[1.16] tracking-[-1.35px] text-black bg-transparent border-none outline-none font-medium w-full"
            />
          </div>
          <span className="text-base text-black leading-[1.8] font-medium shrink-0">
            {primaryLabel}
          </span>
        </div>

        <div className="h-px w-full bg-border" />

        <div className="flex items-center justify-between w-full">
          <span className="text-base text-primary-accent font-medium leading-[1.16]">
            {isUsdMode
              ? `${secondaryValue} ${secondaryLabel}`
              : `$ ${secondaryValue}`}
          </span>
          <CurrencySwapButton />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-43px ">
        <ProtocolInfo
          exchangeRate={STAKING_CONSTANTS.EXCHANGE_RATE}
          transactionFee={STAKING_CONSTANTS.TRANSACTION_FEE}
          apy={STAKING_CONSTANTS.APY}
        />
        <div className="flex gap-2 items-center">
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
        </div>
      </div>
    </div>
  );
}

