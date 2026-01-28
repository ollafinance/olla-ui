import { useState } from "react";
import { useConnection } from "wagmi";
import { StatusPanel } from "./components/StatusPanel";
import { ExchangeRateOverview } from "./components/ExchangeRateOverview";
import { StakingForm } from "./components/StakingForm";
import { useAztecToken } from "@/hooks/protocol/useAztecToken";
import { useOllaCore } from "@/hooks/protocol/useOllaCore";
import { useStAztec } from "@/hooks/protocol/useStAztec";
import { useDebounce } from "@/hooks/useDebounce";

export function StakingFeature() {
  const { isConnected } = useConnection();
  const [amount, setAmount] = useState("");
  const debouncedAmount = useDebounce(amount, 500);

  // Custom Hooks
  const {
    balance,
    allowance,
    approve,
    refetchBalance: refetchAztecBalance,
    refetchAllowance,
  } = useAztecToken();

  const { balance: stAztecBalance, refetchBalance: refetchStAztecBalance } = useStAztec();

  // Pass refetch callback to handle post-deposit updates
  const { deposit, exchangeRate, potentialShares } = useOllaCore({
    onDepositSuccess: () => {
      refetchAztecBalance();
      refetchAllowance();
      refetchStAztecBalance();
      approve.reset(); // Reset approval state to unlock input
      setAmount(""); // Reset amount after successful deposit
    },
    amountToConvert: debouncedAmount,
  });

  return (
    <div className="space-y-6">
      <StatusPanel
        stAztecBalance={stAztecBalance}
        balance={balance}
      />

      <ExchangeRateOverview
        exchangeRate={exchangeRate}
        potentialShares={potentialShares}
      />

      <StakingForm
        isConnected={isConnected}
        balance={balance}
        allowance={allowance}
        amount={amount}
        setAmount={setAmount}
        approve={approve}
        deposit={deposit}
      />

      {/* Transaction Feedback */}
      <div className="space-y-2">
        {(approve.hash || deposit.hash) && (
          <div className="text-xs text-muted-foreground break-all bg-muted p-2 rounded border border-border">
            <span className="font-semibold text-foreground">Tx Hash:</span>{" "}
            {approve.hash || deposit.hash}
          </div>
        )}

        {(approve.isConfirmed ||
          deposit.isConfirmed) && (
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800 text-center font-medium">
            Transaction Successful!
          </div>
        )}

        {deposit.error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
            Error:{" "}
            {(deposit.error as Error & { shortMessage?: string })
              .shortMessage || deposit.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
