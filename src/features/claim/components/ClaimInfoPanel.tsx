import { formatEther } from "viem";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useOllaCore } from "@/hooks/protocol/useOllaCore";
import { useReadContracts } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { Link } from "@tanstack/react-router";

interface WithdrawalRequestSummary {
  recipient: `0x${string}`;
  finalized: boolean;
  claimed: boolean;
  shares: bigint;
  assetsExpected: bigint;
  rate: bigint;
}

export function ClaimInfoPanel() {
  const { activeRequestIds } = useOllaCore();

  const contracts = activeRequestIds.map((id) => ({
    address: CONTRACTS.WithdrawalQueue.address,
    abi: CONTRACTS.WithdrawalQueue.abi,
    functionName: "getRequest" as const,
    args: [id],
  }));

  const { data: requestsData } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      refetchInterval: 5000,
    },
  });

  const requests: WithdrawalRequestSummary[] = (requestsData ?? [])
    .map((entry) => entry.result as WithdrawalRequestSummary | undefined)
    .filter((entry): entry is WithdrawalRequestSummary => Boolean(entry));

  const totalRequests = activeRequestIds.length;
  const claimableRequests = requests.filter((request) => request.finalized && !request.claimed);
  const pendingRequests = requests.filter((request) => !request.finalized && !request.claimed);
  const claimedRequests = requests.filter((request) => request.claimed);

  const totalClaimableAssets = claimableRequests.reduce<bigint>(
    (acc, request) => acc + request.assetsExpected,
    0n,
  );

  return (
    <Card className="bg-muted border-border/50">
      <CardHeader className="pb-2 border-border/10">
        <CardTitle className="text-m font-semibold text-primary uppercase tracking-wide">
          Your Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalRequests === 0 ? (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>You don&apos;t have any withdrawal requests yet.</p>
            <Link
              to="/redeem"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-background border border-border hover:bg-accent text-sm font-medium transition-colors"
            >
              Request a Withdrawal
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InfoStat label="Total" value={totalRequests.toString()} />
              <InfoStat label="Claimable" value={claimableRequests.length.toString()} />
              <InfoStat label="Pending" value={pendingRequests.length.toString()} />
            </div>

            <div className="text-sm text-muted-foreground flex justify-between">
              <span>Claimable Assets:</span>
              <span className="font-mono text-foreground">
                {formatEther(totalClaimableAssets)} AZT
              </span>
            </div>

            {claimedRequests.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {claimedRequests.length} request{claimedRequests.length === 1 ? "" : "s"} already claimed.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InfoStatProps {
  label: string;
  value: string;
}

function InfoStat({ label, value }: InfoStatProps) {
  return (
    <div className="rounded-lg bg-background/60 border border-border/60 p-3 text-center">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
