import OllaCoreABI from "../generated/abis/OllaCore.json";
import MockAztecABI from "../generated/abis/MockAztec.json";
import StAztecABI from "../generated/abis/StAztec.json";
import local from "../generated/deployments/local.json";

export const CONTRACTS = {
  Asset: {
    address: local.addresses.Asset as `0x${string}`,
    abi: MockAztecABI,
  },
  OllaCore: {
    address: local.addresses.OllaCoreProxy as `0x${string}`,
    abi: OllaCoreABI,
  },
  StAztec: {
    address: local.addresses.StAztec as `0x${string}`,
    abi: StAztecABI,
  },
} as const;
