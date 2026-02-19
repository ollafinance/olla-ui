import type { ClaimItem as ClaimItemType } from "../../constants";
import { ClaimItem } from "./ClaimItem";

interface ClaimsCardProps {
  claims: ClaimItemType[];
  onClaim: (id: number) => void;
}

export function ClaimsCard({ claims, onClaim }: ClaimsCardProps) {
  return (
    <div className="bg-card-claims rounded-card flex min-h-[348px] w-full flex-1 flex-col px-4 pt-[28px] pb-4 lg:min-h-0 lg:flex-1">
      <p className="text-card-claims-foreground mb-4 shrink-0 text-[21.33px] leading-[1.16] font-medium">
        Claims
      </p>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {claims.map((claim) => (
          <ClaimItem key={claim.id} {...claim} onClaim={onClaim} />
        ))}
        {claims.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground text-sm">No claims available</p>
          </div>
        )}
      </div>
    </div>
  );
}
