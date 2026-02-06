import { useState } from "react";
import { useConnection } from "wagmi";
import { useDebounce } from "@/hooks/useDebounce";
import { useAztecToken } from "@/hooks/protocol/useAztecToken";
import { useStAztec } from "@/hooks/protocol/useStAztec";
import { useOllaCore } from "@/hooks/protocol/useOllaCore";
import { RedeemStatusPanel } from "./components/RedeemStatusPanel";
import { RedeemOverview } from "./components/RedeemOverview";
import { RedeemForm } from "./components/RedeemForm";

export function RedeemFeature() {
  const { isConnected } = useConnection();
  const [amount, setAmount] = useState("");
  const debouncedAmount = useDebounce(amount, 500);

  // Custom Hooks
  const { balance: aztecBalance, refetchBalance: refetchAztecBalance } =
    useAztecToken();

  const {
    balance: stAztecBalance,
    allowance,
    refetchBalance: refetchStAztecBalance,
    refetchAllowance,
  } = useStAztec();

  // Pass refetch callback to handle post-redeem updates
  const {
    requestRedeem,
    exchangeRate,
    potentialAssets,
    activeRequestIds,
  } = useOllaCore({
    onRedeemSuccess: () => {
      refetchStAztecBalance();
      refetchAllowance();
      refetchAztecBalance();
      setAmount(""); // Reset amount after successful request
    },
    amountToConvert: debouncedAmount,
  });

  return (
    <div className="space-y-6">
      <RedeemStatusPanel
        stAztecBalance={stAztecBalance}
        balance={aztecBalance}
        hasActiveRequests={activeRequestIds.length > 0}
      />

      <RedeemOverview
        exchangeRate={exchangeRate}
        potentialAssets={potentialAssets}
      />

      <RedeemForm
        isConnected={isConnected}
        stAztecBalance={stAztecBalance}
        allowance={allowance}
        amount={amount}
        setAmount={setAmount}
        requestRedeem={requestRedeem}
      />

      {/* Transaction Feedback */}
      <div className="space-y-2">
        {requestRedeem.hash && (
          <div className="text-xs text-muted-foreground break-all bg-muted p-2 rounded border border-border">
            <span className="font-semibold text-foreground">Tx Hash:</span>{" "}
            {requestRedeem.hash}
          </div>
        )}

        {requestRedeem.isConfirmed && (
          <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800 text-center font-medium">
            Transaction Successful!
          </div>
        )}

        {requestRedeem.error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
            Error:{" "}
            {(requestRedeem.error as Error & { shortMessage?: string })
              .shortMessage || requestRedeem.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
