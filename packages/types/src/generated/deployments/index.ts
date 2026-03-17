// Deployment addresses
import localDeployment from "./local.json";
import sepoliaDeployment from "./sepolia.json";

// Named exports for each environment
export const local = localDeployment;
export const sepolia = sepoliaDeployment;

// Combined object for iteration
export const addresses = {
  local: localDeployment,
  sepolia: sepoliaDeployment,
};

export type Deployment = typeof localDeployment;
