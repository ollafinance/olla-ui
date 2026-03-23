import { OllaCoreABI, OllaVaultABI, MockAztecABI, StAztecABI } from "@olla-ui/types";
import { local, sepolia } from "@olla-ui/types/deployments";
import { CONTRACTS_ENV } from "./environment";

interface DeploymentJson {
  addresses: Record<string, string>;
  stAztecName: string;
  stAztecVersion: string;
}

const deployments: Record<string, DeploymentJson> = {
  local,
  sepolia,
};

const deployment = deployments[CONTRACTS_ENV];

if (!deployment) {
  throw new Error(
    `Missing deployment for environment "${CONTRACTS_ENV}". Run \`yarn sync:contracts:${CONTRACTS_ENV}\` first.`
  );
}

const WithdrawalQueueABI = [
  {
    type: "function",
    name: "getRequest",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "recipient", type: "address" },
          { name: "finalized", type: "bool" },
          { name: "claimed", type: "bool" },
          { name: "shares", type: "uint256" },
          { name: "assetsExpected", type: "uint256" },
          { name: "rate", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

export const CONTRACTS = {
  Asset: {
    address: deployment.addresses.Asset as `0x${string}`,
    abi: MockAztecABI,
  },
  OllaCore: {
    address: deployment.addresses.OllaCoreProxy as `0x${string}`,
    abi: OllaCoreABI,
  },
  OllaVault: {
    address: deployment.addresses.OllaVaultProxy as `0x${string}`,
    abi: OllaVaultABI,
  },
  StAztec: {
    address: deployment.addresses.StAztec as `0x${string}`,
    abi: StAztecABI,
  },
  WithdrawalQueue: {
    address: deployment.addresses.WithdrawalQueueProxy as `0x${string}`,
    abi: WithdrawalQueueABI,
  },
  AztecRollup: {
    address: (deployment.addresses.AztecRollup ?? deployment.addresses.MockAztecRollup) as `0x${string}`,
  },
} as const;

export const ST_AZTEC_CONFIG = {
  name: deployment.stAztecName,
  version: deployment.stAztecVersion,
} as const;
