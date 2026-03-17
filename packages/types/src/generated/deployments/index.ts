// Deployment addresses
import localDeployment from "./local.json";
import sepoliaDeployment from "./sepolia.json";

export const addresses = {
  local: localDeployment,
  sepolia: sepoliaDeployment,
};

export type Deployment = typeof localDeployment;
