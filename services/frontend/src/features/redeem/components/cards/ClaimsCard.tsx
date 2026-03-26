import type { ClaimItemData } from "../../hooks/useClaims";
import { ClaimItem } from "./ClaimItem";
import { Button } from "@/components/ui/Button";

interface ClaimsCardProps {
  claims: ClaimItemData[];
  onClaim: (id: number) => void;
  isLoading?: boolean;
  hasInitiallyLoaded?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  claimingRequestId?: number | null;
  claimHash?: `0x${string}` | undefined;
}

export function ClaimsCard({
  claims,
  onClaim,
  isLoading = false,
  hasInitiallyLoaded = false,
  error = null,
  hasMore = false,
  onLoadMore,
  claimingRequestId,
  claimHash,
}: ClaimsCardProps) {
  return (
    <div className="bg-card-claims rounded-card flex min-h-[348px] w-full flex-1 flex-col px-4 pt-[28px] pb-4 lg:min-h-0 lg:flex-1">
      <p className="text-card-claims-foreground mb-4 shrink-0 text-[21.33px] leading-[1.16] font-medium">
        Claims
      </p>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {/* Loading state - only show during initial load */}
        {!hasInitiallyLoaded && isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="border-primary-accent h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              <p className="text-muted-foreground text-sm">Loading claims...</p>
            </div>
          </div>
        )}

        {/* Error state - only show if initial load failed */}
        {!hasInitiallyLoaded && error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <p className="text-destructive text-sm">Failed to load claims</p>
            <p className="text-muted-foreground text-xs">{error}</p>
          </div>
        )}

        {/* Claims list */}
        {claims.map((claim) => (
          <ClaimItem
            key={claim.id}
            id={claim.id}
            amount={claim.amount}
            status={claim.status}
            usdValue={claim.usdValue}
            daysLeft={claim.daysLeft}
            requestedAt={claim.requestedAt}
            claimedDate={claim.claimedDate}
            onClaim={onClaim}
            isClaiming={claimingRequestId === claim.id}
            claimHash={claimingRequestId === claim.id ? claimHash : undefined}
          />
        ))}

        {/* Empty state - show after initial load completes */}
        {hasInitiallyLoaded && claims.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">Currently no claims</p>
          </div>
        )}

        {/* Load more button */}
        {hasMore && onLoadMore && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground h-8 rounded-full px-4 text-xs"
            >
              {isLoading ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
