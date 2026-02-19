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
    <div className="h-[9px] w-[9px] shrink-0 rounded-full" style={{ backgroundColor: color }} />
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
          className="bg-secondary-accent text-card h-[30px] rounded-full px-[15px] py-2 text-xs font-medium"
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
        <span className="text-card-claims-foreground text-xs leading-[1.16] font-medium">
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
        <span className="text-xs leading-[1.16] font-medium text-[#9c9c9c]">{claimedDate}</span>
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
    <div className={`${config.bg} flex flex-col gap-3 rounded-[16px] p-4`}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot color={config.dotColor} />
          <span className={`text-xs ${config.statusTextColor} leading-[1.16] font-medium`}>
            {config.statusText}
          </span>
        </div>
        {config.rightContent}
      </div>
      <div className="flex w-full items-center justify-between">
        <span className={`text-base ${amountTextColor} leading-[1.16] font-medium`}>
          {amount} Aztec
        </span>
        {status === "ready" ? null : (
          <span className={`text-xs ${usdTextColor} leading-[1.16] font-medium`}>
            ~ $ {usdValue}
          </span>
        )}
      </div>
    </div>
  );
}
