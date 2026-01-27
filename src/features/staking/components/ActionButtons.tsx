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
        variant="primary"
        className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
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
        className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
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
        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
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
