import { parseEther } from "viem";
import { Button } from "@/components/ui/Button";

interface ActionButtonsProps {
  isConnected: boolean;
  allowance: string;
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
  approve,
  deposit,
}: ActionButtonsProps) {
  const allowanceBn = parseEther(allowance || "0");
  const requiredAllowance = parseEther("0.1");
  const isApproved = allowanceBn >= requiredAllowance;

  return (
    <div className="flex flex-col gap-4">
      {/* Approve Step */}
      <Button
        onClick={() => approve.write("0.1")}
        disabled={!isConnected || isApproved}
        isLoading={approve.isPending || approve.isConfirming}
        className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
      >
        {approve.isPending
          ? "Approving..."
          : approve.isConfirming
            ? "Confirming..."
            : isApproved
              ? "Approved"
              : "1. Approve 0.1 AZT"}
      </Button>

      {/* Deposit Step */}
      <Button
        onClick={() => deposit.write("0.1")}
        disabled={!isConnected || !isApproved}
        isLoading={deposit.isPending || deposit.isConfirming}
        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
      >
        {deposit.isPending
          ? "Depositing..."
          : deposit.isConfirming
            ? "Confirming..."
            : "2. Deposit 0.1 AZT"}
      </Button>
    </div>
  );
}
