// Historical summaries from the archived Chicmoz incident log:
// https://github.com/aztec-scan/chicmoz/blob/7cae55a77a2a3ec41caf67692ff5fa739c0c4b3c/services/explorer-ui-v2/src/pages/staking/incidents.ts
// January's year was corrected to 2026 by the operator. Commitments are
// historical, not assertions of current payout status.

interface Incident {
  id: string;
  title: string;
  date: string;
  startedAt: string;
  resolvedAt: string;
  duration: string;
  summary: string;
  affected: string;
  slashed: string;
  addresses: string[];
  timeline: { time: string; label: string; text: string }[];
  sections: { heading: string; body: string }[];
}

export const INCIDENTS: Incident[] = [
  {
    id: "2026-06-20-postgres-ha-misconfiguration",
    title: "Postgres HA misconfiguration",
    date: "June 20–22, 2026",
    startedAt: "June 20, 21:30 CEST",
    resolvedAt: "June 22, 12:11 CEST",
    duration: "1d 14h 41m",
    summary:
      "A Postgres high-availability misconfiguration broke the database writer path and temporarily stopped our sequencers from posting attestations. Two sequencers were slashed 2,000 AZTEC each.",
    affected: "2 sequencers",
    slashed: "4,000 AZTEC",
    addresses: [
      "0x901933e29e4be91125965282b0a25c08efb3541a",
      "0x9b91b873e775884b00c6906d2e8af3b3a141fec0",
    ],
    timeline: [
      {
        time: "June 20 · 21:30",
        label: "Detected",
        text: "Dashtec showed missed blocks while the Aztec nodes remained synced. The HA writer path was failing.",
      },
      {
        time: "June 21 · 02:34",
        label: "Mitigated",
        text: "HA was disabled and a reduced validator setup kept online while the misconfiguration was investigated.",
      },
      {
        time: "June 21 · 21:10",
        label: "Fixed",
        text: "Postgres HA access rules were hardened to restrict management and database access to intended infrastructure.",
      },
      {
        time: "June 22 · 12:11",
        label: "Monitoring expanded",
        text: "Direct monitoring and alerts were added for no-primary, writer-backend, etcd quorum, and HAProxy failures.",
      },
    ],
    sections: [
      {
        heading: "What happened",
        body: "Internal management ports were more exposed than intended: etcd client/peer ports 2379/2380, Patroni REST API port 8008, and direct Postgres port 5432. Patroni state changed unexpectedly, demoting the real primary and breaking HA writer availability.",
      },
      {
        heading: "Impact",
        body: "Aztec nodes remained up and synced, so existing node-diff alerts did not fire. However, they could not post transactions or attestations through the broken writer path. Two sequencer addresses were slashed 2,000 AZTEC each.",
      },
      {
        heading: "Fixes and countermeasures",
        body: "Legacy open firewall rules were removed. Internal HA management ports were allowlisted to HA nodes, and HAProxy access was limited to intended Aztec nodes. Native etcd and HAProxy metrics and direct alerts were added for no-primary, no-active-writer, quorum, leader-change, and writer-error conditions.",
      },
      {
        heading: "Commitments recorded in the report",
        body: "Keep HA management ports private by default, route Postgres HA and etcd alerts directly, rotate affected credentials, and review payout/slash handling through the actual payout flow. We pledged to pay the slashed amount to affected delegators.",
      },
    ],
  },
  {
    id: "2026-01-03-sequencer-downtime",
    title: "Signing-service misconfiguration",
    date: "January 3–4, 2026",
    startedAt: "January 3, 12:30 UTC",
    resolvedAt: "January 4, 21:00 UTC",
    duration: "32h 30m",
    summary:
      "A server misconfiguration took our Web3Signer signing service and monitoring stack offline. Nodes could not sign attestations or block proposals, and one attester address was slashed 2,000 AZTEC.",
    affected: "1 attester slashed",
    slashed: "2,000 AZTEC",
    addresses: ["0x8d28ee3293d02a7be59b06549185e8a4835df5e5"],
    timeline: [
      {
        time: "January 3 · 12:30",
        label: "Outage began",
        text: "Web3Signer and the monitoring stack went offline due to server misconfiguration. Alerts were not appropriately sent.",
      },
      {
        time: "January 4 · 21:00",
        label: "Attestations resumed",
        text: "Attestations resumed. One attester address was confirmed slashed for 2,000 AZTEC.",
      },
    ],
    sections: [
      {
        heading: "What happened",
        body: "A misconfiguration in our cloud servers took the signing service and monitoring stack offline. Nodes were unable to sign attestations and block proposals. Because monitoring was also affected, warnings were not appropriately sent out.",
      },
      {
        heading: "Impact",
        body: "We failed to perform our sequencer duties and lost trust from delegators. One attester key was slashed 2,000 AZTEC.",
      },
      {
        heading: "Fixes and countermeasures",
        body: "Recent infrastructure changes made it possible to add two new VPSes and restore monitoring and signing quickly.",
      },
      {
        heading: "Commitments recorded in the report",
        body: "We pledged to repay the slashed AZTEC to the affected address once tokens unlocked. The report also recorded plans for external monitoring and distributing the signing service.",
      },
    ],
  },
];
