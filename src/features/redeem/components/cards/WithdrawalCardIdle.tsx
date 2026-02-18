import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Tooltip } from "@/components/ui/Tooltip";
import { PercentageButtons } from "@/features/staking/components/shared/PercentageButtons";
import { StakeInfo } from "@/features/staking/components/shared/StakeInfo";
import { MOCK_BALANCES, REDEEM_CONSTANTS } from "../../constants";
import arrowUpDownIcon from "@/assets/icons/arrow-up-down.svg";
import infoIcon from "@/assets/icons/info-icon.svg";

interface WithdrawalCardIdleProps {
  amount: string;
  onAmountChange: (val: string) => void;
  onWithdraw: () => void;
  onWithdrawWithError: () => void;
}

export function WithdrawalCardIdle({
  amount,
  onAmountChange,
  onWithdraw,
}: WithdrawalCardIdleProps) {
  const [selectedPercentage, setSelectedPercentage] = useState<
    number | undefined
  >(0.25);

  const [isInstantWithdraw, setIsInstantWithdraw] = useState(false);

  const handlePercentageSelect = (percentage: number) => {
    setSelectedPercentage(percentage);
    const balance = parseFloat(MOCK_BALANCES.STAZTEC_BALANCE);
    const newAmount = (balance * percentage).toFixed(2);
    onAmountChange(newAmount);
  };

  const usdValue =
    amount && !isNaN(Number(amount))
      ? (Number(amount) * REDEEM_CONSTANTS.AZTEC_PRICE_USD).toFixed(2)
      : "0.00";

  const isInputValid = !!amount && !isNaN(Number(amount)) && Number(amount) > 0;

  const instantWithdrawFee =
    isInstantWithdraw && amount && !isNaN(Number(amount))
      ? Number(amount) * REDEEM_CONSTANTS.INSTANT_WITHDRAW_FEE_PERCENT
      : 0;

  return (
    <div className="bg-card rounded-card flex flex-col w-full h-full min-h-[551px]">
      {/* Top Section: Request Withdrawal Input */}
      <div className="flex flex-col gap-8 pt-6 pb-4 px-8">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-[21.33px] text-black leading-[1.16] font-medium">
            Request Withdrawal
          </h2>
          <div className="bg-[#efeee6] flex items-center gap-2 pl-[17px] pr-1 py-1 rounded-full">
            <span className="text-xs text-black leading-[1.16] font-medium">
              Balance
            </span>
            <div className="bg-card flex items-center justify-center px-[15px] py-2 rounded-full">
              <span className="text-xs text-black leading-[1.16] font-medium text-center">
                {MOCK_BALANCES.STAZTEC_BALANCE} stAztec
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col mb-4 gap-[11px] w-full">
          <div className="flex items-center justify-between w-full">
            <PercentageButtons
              selectedPercentage={selectedPercentage}
              onSelect={handlePercentageSelect}
            />
            <div className="flex items-center gap-2">
              <Toggle
                checked={isInstantWithdraw}
                onChange={setIsInstantWithdraw}
                label="Instant Withdraw"
              />
              <Tooltip content="Enabling this will make your Aztec tokens instantly available and you would not have to wait the regular process time. This feature has a cost attached to it.">
                <img
                  src={infoIcon}
                  alt=""
                  className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                />
              </Tooltip>
            </div>
          </div>

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
              className="text-[50px] leading-[1.16] tracking-[-1px] text-black bg-transparent border-none outline-none w-[70%] font-medium"
            />
            <span className="text-base text-black leading-[1.8] font-medium">
              stAztec
            </span>
          </div>

          <div className="flex items-center justify-between w-full min-h-[20px]">
              {isInstantWithdraw && instantWithdrawFee > 0 ? (
                <>
                  <span className="text-sm text-muted font-medium leading-[1.16]">
                    Instant withdrawal fee (0.5%)
                  </span>
                  <span className="text-sm text-black font-medium leading-[1.16]">
                    - {instantWithdrawFee.toFixed(2)} stAztec
                  </span>
                </>
              ) : null}
            </div>

          <div className="h-px w-full bg-border" />
        </div>
      </div>

      {/* Bottom Section: You Will Receive */}
      <div className="pb-4 px-4">
        <div className="bg-[#efeee6] rounded-[28px] p-6 flex flex-col gap-5 w-full">
          <p className="text-base text-black leading-[1.16] font-medium">
            You will receive
          </p>

          <div className="flex flex-col gap-[11px] w-full">
            <div className="flex items-end justify-between w-full">
              <span className="text-[50px] leading-[1.16] tracking-[-1px] text-black font-medium">
                {amount || "00.00"}
              </span>
              <span className="text-base text-black leading-[1.8] font-medium">
                Aztec
              </span>
            </div>

            <div className="h-px w-full bg-border" />

            <div className="flex items-center justify-between w-full">
              <span className="text-base text-muted font-medium leading-[1.16]">
                $ {usdValue}
              </span>
              <img src={arrowUpDownIcon} alt="" className="h-[11px] w-[14px]" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-[43px]">
            <StakeInfo
              exchangeRate={`1 Aztec = ${REDEEM_CONSTANTS.EXCHANGE_RATE} stAZTEC`}
              transactionFee={REDEEM_CONSTANTS.TRANSACTION_FEE}
              apy={REDEEM_CONSTANTS.APY}
            />
            <Button
              variant="pink"
              size="xl"
              onClick={onWithdraw}
              disabled={!isInputValid}
              showArrow
              className="w-button-stake h-button bg-primary text-black"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
