import type { ClaimStatus } from "../../constants";
import { Button } from "@/components/ui/Button";

interface ClaimItemProps {
  id: number;
  amount: string;
  status: ClaimStatus;
  usdValue: string;
  daysLeft?: number;
  claimedDate?: string;
  onClaim?: (id: number) => void;
}

function StatusDot({ color }: { color: string }) {
  return (
    <div
      className="w-[9px] h-[9px] rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

export function ClaimItem({
  id,
  amount,
  status,
  usdValue,
  daysLeft,
  claimedDate,
  onClaim,
}: ClaimItemProps) {
  const statusConfig = {
    ready: {
      bg: "bg-card",
      dotColor: "#17AAC0",
      statusTextColor: "text-secondary-accent",
      statusText: "Ready to claim",
      rightContent: (
        <Button
          variant="cyan"
          size="sm"
          onClick={() => onClaim?.(id)}
          className="h-[30px] px-[15px] py-2 rounded-full bg-secondary-accent text-card text-xs font-medium"
        >
          Claim
        </Button>
      ),
    },
    processing: {
      bg: "bg-card-claims-item",
      dotColor: "#FF9E5E",
      statusTextColor: "text-card-claims-foreground",
      statusText: "Processing",
      rightContent: (
        <span className="text-xs text-card-claims-foreground font-medium leading-[1.16]">
          {daysLeft} Days Left
        </span>
      ),
    },
    claimed: {
      bg: "bg-[#e1e1e1]",
      dotColor: "#9c9c9c",
      statusTextColor: "text-[#373737]",
      statusText: "Claimed",
      rightContent: (
        <span className="text-xs text-[#9c9c9c] font-medium leading-[1.16]">
          {claimedDate}
        </span>
      ),
    },
  };

  const config = statusConfig[status];
  const amountTextColor =
    status === "claimed"
      ? "text-[#373737]"
      : status === "processing"
        ? "text-card-claims-foreground"
        : "text-black";
  const usdTextColor =
    status === "claimed"
      ? "text-[#9c9c9c]"
      : status === "processing"
        ? "text-card-claims-foreground"
        : "text-black";

  return (
    <div className={`${config.bg} rounded-[16px] p-4 flex flex-col gap-3`}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <StatusDot color={config.dotColor} />
          <span
            className={`text-xs ${config.statusTextColor} font-medium leading-[1.16]`}
          >
            {config.statusText}
          </span>
        </div>
        {config.rightContent}
      </div>
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-base ${amountTextColor} font-medium leading-[1.16]`}
        >
          {amount} Aztec
        </span>
        {status === "ready" ? null : (
          <span
            className={`text-xs ${usdTextColor} font-medium leading-[1.16]`}
          >
            ~ $ {usdValue}
          </span>
        )}
      </div>
    </div>
  );
}

