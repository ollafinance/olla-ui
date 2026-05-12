// Contract ABIs
import OllaCoreABI from "./OllaCore.json";
import OllaVaultABI from "./OllaVault.json";
import StAztecABI from "./StAztec.json";
import MockAztecABI from "./MockAztec.json";
import MockStakingManagerABI from "./MockStakingManager.json";

export {
  OllaCoreABI,
  OllaVaultABI,
  StAztecABI,
  MockAztecABI,
  MockStakingManagerABI,
};

// Type exports
export type OllaCore = typeof OllaCoreABI;
export type OllaVault = typeof OllaVaultABI;
export type StAztec = typeof StAztecABI;
export type MockAztec = typeof MockAztecABI;
export type MockStakingManager = typeof MockStakingManagerABI;
