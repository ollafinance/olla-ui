import { useMemo } from "react";
import type { ClaimStatus } from "../../hooks/useClaims";
import { Button } from "@/components/ui/Button";
import { PROTOCOL_CONSTANTS } from "@/constants/protocol";

interface ClaimItemProps {
  id: number;
  amount: string;
  status: ClaimStatus;
  usdValue: string;
  daysLeft?: number;
  requestedAt?: number;
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
  requestedAt,
  claimedDate,
  onClaim,
  isClaiming = false,
  claimHash,
}: ClaimItemProps) {
  const computedDaysLeft = useMemo(() => {
    if (daysLeft !== undefined) return daysLeft;
    if (!requestedAt) return undefined;
    const now = Math.floor(Date.now() / 1000);
    const unlockTime = requestedAt + PROTOCOL_CONSTANTS.WITHDRAWAL_DELAY_DAYS * 24 * 60 * 60;
    const secondsLeft = Math.max(0, unlockTime - now);
    const days = Math.ceil(secondsLeft / 86400);
    return days > 0 ? days : undefined;
  }, [daysLeft, requestedAt]);

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
          {computedDaysLeft !== undefined
            ? `${computedDaysLeft} ${computedDaysLeft === 1 ? "Day" : "Days"} Left`
            : "Pending"}
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
    <div className={`${config.bg} flex w-full items-start justify-between rounded-[16px] p-4`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <StatusDot color={config.dotColor} />
          <span className={`text-xs ${config.statusTextColor} leading-[1.16]`}>
            {config.statusText}
          </span>
        </div>
        <span className={`text-base ${amountTextColor} leading-[1.16] font-medium`}>
          {Number(amount).toFixed(2)} Aztec
        </span>
      </div>

      <div className="flex flex-col items-end gap-1">
        {config.rightContent}
        {usdValue && (
          <span className={`text-xs ${usdTextColor} leading-[1.16] font-medium`}>
            ~ $ {usdValue}
          </span>
        )}
        {/* Transaction hash link for claiming */}
        {isClaiming && claimHash && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">Tx:</span>
            <a
              href={`https://etherscan.io/tx/${claimHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-accent max-w-[100px] truncate hover:underline"
            >
              {claimHash.slice(0, 6)}...
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
