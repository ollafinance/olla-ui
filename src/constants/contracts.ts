import OllaCoreABI from "../generated/abis/OllaCore.json";
import MockAztecABI from "../generated/abis/MockAztec.json";
import addresses from "../generated/deployments/addresses.json";

export const CONTRACTS = {
  Asset: {
    address: addresses.Asset as `0x${string}`,
    abi: MockAztecABI,
  },
  OllaCore: {
    address: addresses.OllaCoreProxy as `0x${string}`,
    abi: OllaCoreABI,
  },
} as const;
