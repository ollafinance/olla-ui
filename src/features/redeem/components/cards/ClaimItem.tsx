import type { ClaimStatus } from "../../hooks/useClaims";
import { Button } from "@/components/ui/Button";

interface ClaimItemProps {
  id: number;
  amount: string;
  status: ClaimStatus;
  usdValue: string;
  daysLeft?: number;
  claimedDate?: string;
  onClaim?: (id: number) => void;
  isClaiming?: boolean;
  claimHash?: `0x${string}`;
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
  isClaiming = false,
  claimHash,
}: ClaimItemProps) {
  const statusConfig = {
    ready: {
      bg: "bg-card",
      dotColor: "#17AAC0",
      statusTextColor: "text-secondary-accent",
      statusText: "Ready to claim",
      rightContent: isClaiming ? (
        <div className="flex items-center gap-2">
          <div className="border-secondary-accent h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-secondary-accent text-xs">Claiming...</span>
        </div>
      ) : (
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
          {daysLeft} {daysLeft === 1 ? "Day" : "Days"} Left
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
    instant: {
      bg: "bg-[#e1e1e1]",
      dotColor: "#9c9c9c",
      statusTextColor: "text-[#373737]",
      statusText: "⚡ Instant redemption",
      rightContent: (
        <span className="text-xs leading-[1.16] font-medium text-[#9c9c9c]">{claimedDate}</span>
      ),
    },
  };

  const config = statusConfig[status];
  const amountTextColor =
    status === "claimed" || status === "instant"
      ? "text-[#373737]"
      : status === "processing"
        ? "text-card-claims-foreground"
        : "text-black";
  const usdTextColor =
    status === "claimed" || status === "instant"
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
          {Number(amount).toFixed(4)} Aztec
        </span>
        {status === "ready" ? null : (
          <span className={`text-xs ${usdTextColor} leading-[1.16] font-medium`}>
            ~ $ {usdValue}
          </span>
        )}
      </div>
      {/* Transaction hash link for claiming */}
      {isClaiming && claimHash && (
        <div className="mt-1 flex items-center gap-1 text-xs">
          <span className="text-muted-foreground">Tx:</span>
          <a
            href={`https://etherscan.io/tx/${claimHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-accent max-w-[200px] truncate hover:underline"
          >
            {claimHash.slice(0, 6)}...{claimHash.slice(-4)}
          </a>
        </div>
      )}
    </div>
  );
}
