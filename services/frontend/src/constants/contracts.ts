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
  AztecRollup: {
    address: (deployment.addresses.AztecRollup ?? deployment.addresses.MockAztecRollup) as `0x${string}`,
  },
} as const;

export const ST_AZTEC_CONFIG = {
  name: deployment.stAztecName,
  version: deployment.stAztecVersion,
} as const;
