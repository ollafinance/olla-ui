import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BalanceBadge } from "../shared/BalanceBadge";
import { PercentageButtons } from "../shared/PercentageButtons";
import { StakeInfo } from "../shared/StakeInfo";
import { MOCK_BALANCES, STAKING_CONSTANTS } from "../../constants";
import arrowUpDownIcon from "@/assets/icons/arrow-up-down.svg";

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
  const [selectedPercentage, setSelectedPercentage] = useState<
    number | undefined
  >(0.25);

  const handlePercentageSelect = (percentage: number) => {
    setSelectedPercentage(percentage);
    const balance = parseFloat(MOCK_BALANCES.AZTEC_BALANCE);
    const newAmount = (balance * percentage).toFixed(2);
    onAmountChange(newAmount);
  };

  const usdValue =
    amount && !isNaN(Number(amount))
      ? (Number(amount) * STAKING_CONSTANTS.AZTEC_PRICE_USD).toFixed(2)
      : "0.00";

  const isInputValid = !!amount && !isNaN(Number(amount)) && Number(amount) > 0;

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
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setSelectedPercentage(undefined);
              onAmountChange(e.target.value);
            }}
            className="text-[67px] leading-[1.16] tracking-[-1.35px] text-black bg-transparent border-none outline-none w-[70%] font-medium"
          />
          <span className="text-base text-black leading-[1.8] font-medium">
            Aztec
          </span>
        </div>

        <div className="h-px w-full bg-border" />

        <div className="flex items-center justify-between w-full">
          <span className="text-base text-primary-accent font-medium leading-[1.16]">
            $ {usdValue}
          </span>
          <img src={arrowUpDownIcon} alt="" className="h-[11px] w-[14px]" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-43px ">
        <StakeInfo />
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
