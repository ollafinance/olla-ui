import { parseEther } from "viem";

interface ActionButtonsProps {
  isConnected: boolean;
  allowance: string;
  mint: {
    write: () => void;
    isPending: boolean;
    isConfirming: boolean;
  };
  approve: {
    write: () => void;
    isPending: boolean;
    isConfirming: boolean;
  };
  deposit: {
    write: () => void;
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
      <button
        onClick={mint.write}
        disabled={!isConnected || mint.isPending || mint.isConfirming}
        className="w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-all cursor-pointer"
      >
        {mint.isPending
          ? "Minting..."
          : mint.isConfirming
            ? "Confirming..."
            : "1. Mint 100 AZT"}
      </button>

      {/* Approve Step */}
      <button
        onClick={approve.write}
        disabled={
          !isConnected ||
          approve.isPending ||
          approve.isConfirming ||
          isApproved
        }
        className="w-full py-3 px-4 rounded-lg font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 transition-all cursor-pointer"
      >
        {approve.isPending
          ? "Approving..."
          : approve.isConfirming
            ? "Confirming..."
            : isApproved
              ? "Approved"
              : "2. Approve 0.1 AZT"}
      </button>

      {/* Deposit Step */}
      <button
        onClick={deposit.write}
        disabled={
          !isConnected ||
          deposit.isPending ||
          deposit.isConfirming ||
          !isApproved
        }
        className="w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-all cursor-pointer"
      >
        {deposit.isPending
          ? "Depositing..."
          : deposit.isConfirming
            ? "Confirming..."
            : "3. Deposit 0.1 AZT"}
      </button>
    </div>
  );
}
