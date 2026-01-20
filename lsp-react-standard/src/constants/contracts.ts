import OllaCoreABI from "../abis/OllaCore.json";
import MockAztecABI from "../abis/MockAztec.json";
import addresses from "../abis/addresses.json";

export const CONTRACTS = {
  ASSET: {
    address: addresses.Asset as `0x${string}`,
    abi: MockAztecABI,
  },
  OLLA_CORE: {
    address: addresses.OllaCore as `0x${string}`,
    abi: OllaCoreABI,
  },
} as const;
