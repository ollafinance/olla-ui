import type { ClaimItem as ClaimItemType } from "../../constants";
import { ClaimItem } from "./ClaimItem";

interface ClaimsCardProps {
  claims: ClaimItemType[];
  onClaim: (id: number) => void;
}

export function ClaimsCard({ claims, onClaim }: ClaimsCardProps) {
  return (
    <div className="bg-card-claims rounded-card pt-[28px] pb-4 px-4 w-full min-h-[348px] flex-1 lg:flex-1 lg:min-h-0 flex flex-col">
      <p className="text-[21.33px] text-card-claims-foreground font-medium leading-[1.16] mb-4 shrink-0">
        Claims
      </p>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">
        {claims.map((claim) => (
          <ClaimItem key={claim.id} {...claim} onClaim={onClaim} />
        ))}
        {claims.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No claims available</p>
          </div>
        )}
      </div>
    </div>
  );
}

