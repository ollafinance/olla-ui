import OllaCoreABI from "../generated/abis/OllaCore.json";
import MockAztecABI from "../generated/abis/MockAztec.json";
import StAztecABI from "../generated/abis/StAztec.json";
import deployment from "../generated/deployments/local.json";

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
} as const;

export const ST_AZTEC_CONFIG = {
  name: deployment.stAztecName,
  version: deployment.stAztecVersion,
} as const;
