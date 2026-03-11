import OllaCoreABI from "../generated/abis/OllaCore.json";
import OllaVaultABI from "../generated/abis/OllaVault.json";
import MockAztecABI from "../generated/abis/MockAztec.json";
import StAztecABI from "../generated/abis/StAztec.json";
import { CONTRACTS_ENV } from "./environment";

interface DeploymentJson {
  addresses: Record<string, string>;
  stAztecName: string;
  stAztecVersion: string;
}

const deploymentModules = import.meta.glob<{ default: DeploymentJson }>(
  "../generated/deployments/*.json",
  { eager: true }
);

const localDeployment = deploymentModules["../generated/deployments/local.json"]?.default;

if (!localDeployment) {
  throw new Error(
    "Missing src/generated/deployments/local.json. Run `yarn sync:contracts:local` first."
  );
}

const selectedDeployment =
  deploymentModules[`../generated/deployments/${CONTRACTS_ENV}.json`]?.default;

if (!selectedDeployment) {
  throw new Error(
    `Missing src/generated/deployments/${CONTRACTS_ENV}.json. Run \`yarn sync:contracts:${CONTRACTS_ENV}\` first.`
  );
}

const deployment = selectedDeployment;

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
    address: deployment.addresses.MockAztecRollup as `0x${string}`,
  },
} as const;

export const ST_AZTEC_CONFIG = {
  name: deployment.stAztecName,
  version: deployment.stAztecVersion,
} as const;
