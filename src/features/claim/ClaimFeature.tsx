import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useReadContracts } from "wagmi";
import { ClaimOverview } from "./components/ClaimOverview";
import { ClaimInfoPanel } from "./components/ClaimInfoPanel";
import { useOllaCore } from "@/hooks/protocol/useOllaCore";
import { CONTRACTS } from "@/constants/contracts";

interface WithdrawalRequestSummary {
  recipient: `0x${string}`;
  finalized: boolean;
  claimed: boolean;
  shares: bigint;
  assetsExpected: bigint;
  rate: bigint;
  id: bigint;
}

export function ClaimFeature() {
  const { activeRequestIds, claimRequest } = useOllaCore();

  const contracts = useMemo(
    () =>
      activeRequestIds.map((id) => ({
        address: CONTRACTS.WithdrawalQueue.address,
        abi: CONTRACTS.WithdrawalQueue.abi,
        functionName: "getRequest" as const,
        args: [id],
      })),
    [activeRequestIds],
  );

  const { data: requestsData, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      refetchInterval: 5000,
    },
  });

  const requests = useMemo<WithdrawalRequestSummary[]>(
    () =>
      activeRequestIds
        .map((id, index) => {
          const entry = requestsData?.[index];
          const result = entry?.result as
            | Omit<WithdrawalRequestSummary, "id">
            | undefined;
          if (!result) return undefined;
          return { ...result, id };
        })
        .filter((request): request is WithdrawalRequestSummary =>
          Boolean(request),
        ),
    [activeRequestIds, requestsData],
  );

  const claimableRequests = useMemo(
    () => requests.filter((request) => request.finalized && !request.claimed),
    [requests],
  );

  const pendingRequests = useMemo(
    () => requests.filter((request) => !request.finalized && !request.claimed),
    [requests],
  );

  const claimedRequests = useMemo(
    () => requests.filter((request) => request.claimed),
    [requests],
  );

  const totalClaimableAssets = useMemo(
    () =>
      claimableRequests.reduce<bigint>(
        (acc, request) => acc + (request.assetsExpected ?? 0n),
        0n,
      ),
    [claimableRequests],
  );

  const hasRequests = requests.length > 0;
  const sortedRequests = useMemo(
    () => (hasRequests ? [...requests].reverse() : []),
    [hasRequests, requests],
  );

  return (
    <div className="space-y-6">
      <ClaimInfoPanel
        totalRequests={activeRequestIds.length}
        claimableCount={claimableRequests.length}
        pendingCount={pendingRequests.length}
        claimedCount={claimedRequests.length}
        totalClaimableAssets={totalClaimableAssets}
      />

      {isLoading && !hasRequests ? (
        <div className="text-sm text-muted-foreground">
          Loading withdrawal requests…
        </div>
      ) : hasRequests ? (
        <ClaimOverview requests={sortedRequests} claimRequest={claimRequest} />
      ) : (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>You don&apos;t have any withdrawal requests yet.</p>
          <Link
            to="/redeem"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-background border border-border hover:bg-accent font-medium transition-colors"
          >
            Request a Withdrawal
          </Link>
        </div>
      )}
    </div>
  );
}
