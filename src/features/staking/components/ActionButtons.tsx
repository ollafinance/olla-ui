import { parseEther } from "viem";
import { Button } from "@/components/ui/Button";

interface ActionButtonsProps {
  isConnected: boolean;
  allowance: string;
  mint: {
    write: (amount: string) => void;
    isPending: boolean;
    isConfirming: boolean;
  };
  approve: {
    write: (amount: string) => void;
    isPending: boolean;
    isConfirming: boolean;
  };
  deposit: {
    write: (amount: string) => void;
    isPending: boolean;
    isConfirming: boolean;
  };
}

export function ActionButtons({
  isConnected,
  allowance,
  mint,
  approve,
  deposit,
}: ActionButtonsProps) {
  const allowanceBn = parseEther(allowance || "0");
  const requiredAllowance = parseEther("0.1");
  const isApproved = allowanceBn >= requiredAllowance;

  return (
    <div className="flex flex-col gap-4">
      {/* Mint Step */}
      <Button
        onClick={() => mint.write("100")}
        disabled={!isConnected}
        isLoading={mint.isPending || mint.isConfirming}
        variant="primary" // Replaced custom green with primary for now, or add specific variant
        className="w-full bg-green-600 hover:bg-green-700 text-white" // Custom override if needed
      >
        {mint.isPending
          ? "Minting..."
          : mint.isConfirming
            ? "Confirming..."
            : "1. Mint 100 AZT"}
      </Button>

      {/* Approve Step */}
      <Button
        onClick={() => approve.write("0.1")}
        disabled={!isConnected || isApproved}
        isLoading={approve.isPending || approve.isConfirming}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
      >
        {approve.isPending
          ? "Approving..."
          : approve.isConfirming
            ? "Confirming..."
            : isApproved
              ? "Approved"
              : "2. Approve 0.1 AZT"}
      </Button>

      {/* Deposit Step */}
      <Button
        onClick={() => deposit.write("0.1")}
        disabled={!isConnected || !isApproved}
        isLoading={deposit.isPending || deposit.isConfirming}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {deposit.isPending
          ? "Depositing..."
          : deposit.isConfirming
            ? "Confirming..."
            : "3. Deposit 0.1 AZT"}
      </Button>
    </div>
  );
}
