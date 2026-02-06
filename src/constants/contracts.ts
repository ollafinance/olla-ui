import OllaCoreABI from "../generated/abis/OllaCore.json";
import MockAztecABI from "../generated/abis/MockAztec.json";
import StAztecABI from "../generated/abis/StAztec.json";
import deployment from "../generated/deployments/local.json";

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
  StAztec: {
    address: deployment.addresses.StAztec as `0x${string}`,
    abi: StAztecABI,
  },
  WithdrawalQueue: {
    address: deployment.addresses.WithdrawalQueueProxy as `0x${string}`,
    abi: WithdrawalQueueABI,
  },
} as const;

export const ST_AZTEC_CONFIG = {
  name: deployment.stAztecName,
  version: deployment.stAztecVersion,
} as const;
