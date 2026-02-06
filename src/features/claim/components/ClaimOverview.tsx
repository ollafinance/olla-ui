import { ClaimRequestRow } from "./ClaimRequestRow";

interface ClaimOverviewProps {
  requests: Array<{
    id: bigint;
    assetsExpected: bigint;
    shares: bigint;
    rate: bigint;
    finalized: boolean;
    claimed: boolean;
  }>;
  claimRequest: {
    write: (requestId: bigint) => void;
    isPending: boolean;
    isConfirming: boolean;
  };
}

export function ClaimOverview({ requests, claimRequest }: ClaimOverviewProps) {
  return (
    <div className="flex flex-col gap-4">
      {requests.map((request) => (
        <ClaimRequestRow
          key={request.id.toString()}
          request={request}
          claimRequest={claimRequest}
        />
      ))}
    </div>
  );
}
