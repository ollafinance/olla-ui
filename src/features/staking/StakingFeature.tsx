import { useConnection } from "wagmi";
import { StatusPanel } from "./components/StatusPanel";
import { ActionButtons } from "./components/ActionButtons";
import { useAztecToken } from "@/hooks/protocol/useAztecToken";
import { useOllaCore } from "@/hooks/protocol/useOllaCore";
import { useStAztec } from "@/hooks/protocol/useStAztec";

export function StakingFeature() {
  const { isConnected } = useConnection();

  // Custom Hooks
  const {
    balance,
    allowance,
    mint,
    approve,
    refetchBalance,
    refetchAllowance,
  } = useAztecToken();

  const { balance: stAztecBalance } = useStAztec();

  // Pass refetch callback to handle post-deposit updates
  const { deposit } = useOllaCore({
    onDepositSuccess: () => {
      refetchBalance();
      refetchAllowance();
    },
  });

  return (
    <div className="space-y-6">
      <StatusPanel
        stAztecBalance={stAztecBalance}
        balance={balance}
        allowance={allowance}
      />

      <ActionButtons
        isConnected={isConnected}
        allowance={allowance}
        mint={mint}
        approve={approve}
        deposit={deposit}
      />

      {/* Transaction Feedback */}
      <div className="space-y-2">
        {(mint.hash || approve.hash || deposit.hash) && (
          <div className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded border border-gray-200">
            <span className="font-semibold">Tx Hash:</span>{" "}
            {mint.hash || approve.hash || deposit.hash}
          </div>
        )}

        {(mint.isConfirmed ||
          approve.isConfirmed ||
          deposit.isConfirmed) && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200 text-center font-medium">
            Transaction Successful!
          </div>
        )}

        {deposit.error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            Error:{" "}
            {(deposit.error as Error & { shortMessage?: string })
              .shortMessage || deposit.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
