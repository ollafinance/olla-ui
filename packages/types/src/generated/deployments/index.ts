// Deployment addresses
import localDeployment from "./local.json";
import mainnetDeployment from "./mainnet.json";
import sepoliaDeployment from "./sepolia.json";

// Named exports for each environment
export const local = localDeployment;
export const mainnet = mainnetDeployment;
export const sepolia = sepoliaDeployment;

// Combined object for iteration
export const addresses = {
  local: localDeployment,
  mainnet: mainnetDeployment,
  sepolia: sepoliaDeployment,
};

export type Deployment = typeof localDeployment;
