import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { CurrencySwapButton } from "@/components/ui/CurrencySwapButton";
import { BalanceBadge } from "@/components/ui/BalanceBadge";
import { PercentageButtons } from "@/components/ui/PercentageButtons";
import { ProtocolInfo } from "@/components/ProtocolInfo";
import { useCurrency } from "@/hooks/useCurrency";
import { useAmountInput } from "@/hooks/useAmountInput";
import { usePercentageSelect } from "@/hooks/usePercentageSelect";
import { useTransactionFeeEstimate } from "@/hooks/protocol";
import { getAmountSizeClass } from "@/lib/utils";

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
  const { isUsdMode, aztecToUsd, usdToAztec } = useCurrency();

  const { inputValue, handleInputChange: handleAmountChange } = useAmountInput({
    amount,
    isUsdMode,
    onAmountChange,
    usdToToken: usdToAztec,
    tokenToUsd: aztecToUsd,
  });

  const { selectedPercentage, setSelectedPercentage, handlePercentageSelect } =
    usePercentageSelect({
      balance,
      isUsdMode,
      onAmountChange,
      usdToToken: usdToAztec,
      tokenToUsd: aztecToUsd,
      initialPercentage: 0.25,
    });

  const usdValue = aztecToUsd(amount);

  const numericAmount = Number(amount);
  const numericBalance = parseFloat(balance);
  const isInputValid =
    !!amount && !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= numericBalance;
  const isBalanceExceeded = numericAmount > numericBalance;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPercentage(undefined);
    handleAmountChange(e);
  };

  const primaryLabel = isUsdMode ? "USD" : "Aztec";
  const secondaryValue = isUsdMode ? amount : usdValue;
  const secondaryLabel = isUsdMode ? "Aztec" : "$";

  const amountSizeClass = getAmountSizeClass(
    (isUsdMode ? "$" : "") + (inputValue || "0.00"),
    "staking"
  );

  const transactionFee = useTransactionFeeEstimate("stake");

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col items-center justify-between p-6">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-text-display text-lg leading-[1.16] font-medium text-black">
          You Stake
        </h2>
        <BalanceBadge balance={balance} isConnected={isConnected} currency="Aztec" />
      </div>

      <div className="flex w-full flex-1 flex-col justify-center gap-3">
        <PercentageButtons
          selectedPercentage={selectedPercentage}
          onSelect={handlePercentageSelect}
        />

        <div className="flex w-full items-end justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-end">
            {isUsdMode && (
              <span
                className={`text-text-display pr-2 ${amountSizeClass} leading-[1.16] font-medium tracking-[-1.35px]`}
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
              className={`text-text-display w-full min-w-0 border-none bg-transparent ${amountSizeClass} leading-[1.16] font-medium tracking-[-1.35px] outline-none`}
            />
          </div>
          <span className="text-text-display shrink-0 text-base leading-[1.8] font-medium text-black">
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
        <ProtocolInfo exchangeRate={exchangeRate} transactionFee={transactionFee} />
        <div className="flex items-center gap-2">
          {isConnected ? (
            isBalanceExceeded ? (
              <Tooltip content="You do not have this amount of Aztec tokens in your wallet">
                <Button
                  variant="muted"
                  size="xl"
                  onClick={onStake}
                  disabled={true}
                  showArrow
                  className="w-button-stake h-button bg-muted-soft text-black"
                >
                  Stake
                </Button>
              </Tooltip>
            ) : (
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
            )
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </div>
  );
}
