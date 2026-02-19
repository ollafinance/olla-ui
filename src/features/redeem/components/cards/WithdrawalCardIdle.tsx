import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Tooltip } from "@/components/ui/Tooltip";
import { CurrencySwapButton } from "@/components/ui/CurrencySwapButton";
import { PercentageButtons } from "@/features/staking/components/shared/PercentageButtons";
import { ProtocolInfo } from "@/components/ProtocolInfo";
import { useCurrencySwap } from "@/hooks/useCurrencySwap";
import { MOCK_BALANCES, REDEEM_CONSTANTS } from "../../constants";
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
  const { isUsdMode } = useCurrencySwap();
  const [selectedPercentage, setSelectedPercentage] = useState<number | undefined>(0.25);

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

  const primaryValue = isUsdMode ? usdValue : amount || "00.00";
  const primaryLabel = isUsdMode ? "USD" : "Aztec";
  const primaryPrefix = isUsdMode ? "$ " : "";

  const secondaryValue = isUsdMode ? amount || "00.00" : usdValue;
  const secondaryLabel = isUsdMode ? "Aztec" : "";
  const secondaryPrefix = isUsdMode ? "" : "$ ";

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col">
      <div className="flex flex-col gap-8 px-8 pt-6 pb-4">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-[21.33px] leading-[1.16] font-medium text-black">
            Request Withdrawal
          </h2>
          <div className="flex items-center gap-2 rounded-full bg-[#efeee6] py-1 pr-1 pl-[17px]">
            <span className="text-xs leading-[1.16] font-medium text-black">Balance</span>
            <div className="bg-card flex items-center justify-center rounded-full px-[15px] py-2">
              <span className="text-center text-xs leading-[1.16] font-medium text-black">
                {MOCK_BALANCES.STAZTEC_BALANCE} stAztec
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
                checked={isInstantWithdraw}
                onChange={setIsInstantWithdraw}
                label="Instant Withdraw"
              />
              <Tooltip content="Enabling this will make your Aztec tokens instantly available and you would not have to wait the regular process time. This feature has a cost attached to it.">
                <img
                  src={infoIcon}
                  alt=""
                  className="h-4 w-4 opacity-50 transition-opacity hover:opacity-100"
                />
              </Tooltip>
            </div>
          </div>

          <div className="flex w-full items-end justify-between">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setSelectedPercentage(undefined);
                onAmountChange(e.target.value);
              }}
              className="w-[70%] border-none bg-transparent text-[50px] leading-[1.16] font-medium tracking-[-1px] text-black outline-none"
            />
            <span className="text-base leading-[1.8] font-medium text-black">stAztec</span>
          </div>

          <div className="flex min-h-[20px] w-full items-center justify-between">
            {isInstantWithdraw && instantWithdrawFee > 0 ? (
              <>
                <span className="text-muted text-sm leading-[1.16] font-medium">
                  Instant withdrawal fee (0.5%)
                </span>
                <span className="text-sm leading-[1.16] font-medium text-black">
                  - {instantWithdrawFee.toFixed(2)} stAztec
                </span>
              </>
            ) : null}
          </div>

          <div className="bg-border h-px w-full" />
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex w-full flex-col gap-5 rounded-[28px] bg-[#efeee6] p-6">
          <p className="text-base leading-[1.16] font-medium text-black">You will receive</p>

          <div className="flex w-full flex-col gap-[11px]">
            <div className="flex w-full items-end justify-between">
              <span className="text-[50px] leading-[1.16] font-medium tracking-[-1px] text-black">
                {primaryPrefix}
                {primaryValue}
              </span>
              <span className="text-base leading-[1.8] font-medium text-black">{primaryLabel}</span>
            </div>

            <div className="bg-border h-px w-full" />

            <div className="flex w-full items-center justify-between">
              <span className="text-muted text-base leading-[1.16] font-medium">
                {secondaryPrefix}
                {secondaryValue} {secondaryLabel}
              </span>
              <CurrencySwapButton />
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-[43px] lg:flex-row">
            <ProtocolInfo
              exchangeRate={REDEEM_CONSTANTS.EXCHANGE_RATE}
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
