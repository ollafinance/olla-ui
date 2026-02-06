import { useOllaCore } from "@/hooks/protocol/useOllaCore";
import { ClaimRequestRow } from "./ClaimRequestRow";

export function ClaimOverview() {
  const { activeRequestIds } = useOllaCore();

  if (!activeRequestIds || activeRequestIds.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No withdrawal requests found.
      </div>
    );
  }

  // Reverse to show newest first? Or just list them.
  // Usually users want to see the latest one or maybe all of them.
  // The contract returns them in order of creation/pushing to the array.
  // Let's copy and reverse for display.
  const sortedIds = [...activeRequestIds].reverse();

  return (
    <div className="flex flex-col gap-4">
      {sortedIds.map((id) => (
        <ClaimRequestRow key={id.toString()} requestId={id} />
      ))}
    </div>
  );
}
