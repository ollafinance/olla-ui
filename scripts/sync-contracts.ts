#!/usr/bin/env npx tsx

/**
 * Sync contracts from the core repo
 *
 * Extracts ABIs from Forge build output and copies deployment addresses.
 *
 * Usage:
 *   npx tsx scripts/sync-contracts.ts [environment]
 *
 * Examples:
 *   npx tsx scripts/sync-contracts.ts         # defaults to "local"
 *   npx tsx scripts/sync-contracts.ts local
 *   npx tsx scripts/sync-contracts.ts testnet
 */

import * as fs from "fs";
import * as path from "path";

// Types
interface Config {
  source: {
    corePath: string;
  };
  output: {
    dir: string;
  };
  contracts: string[];
}

interface ForgeArtifact {
  abi?: unknown[];
}

interface DeploymentJson {
  network: string;
  chainId: number;
  deployer: string;
  addresses: Record<string, string>;
}

// Colors for console output
const colors = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
};

function loadConfig(): Config {
  const configPath = path.join(process.cwd(), "contracts.config.json");

  if (!fs.existsSync(configPath)) {
    console.error(colors.red("Error: contracts.config.json not found."));
    console.error(
      colors.gray("Create a contracts.config.json file in the project root."),
    );
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(configPath, "utf8")) as Config;
}

function validateCorePath(corePath: string): string {
  const resolvedPath = path.resolve(process.cwd(), corePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(
      colors.red(`Error: Core repo not found at "${resolvedPath}".`),
    );
    console.error(colors.gray("Check the corePath in contracts.config.json."));
    process.exit(1);
  }

  return resolvedPath;
}

function validateContractsBuilt(corePath: string): void {
  const outDir = path.join(corePath, "contracts", "out");

  if (!fs.existsSync(outDir)) {
    console.error(colors.red("Error: Contracts not built."));
    console.error(colors.gray('Run "yarn dev:build" in the core repo first.'));
    process.exit(1);
  }
}

function validateDeployment(corePath: string, env: string): string {
  const deploymentPath = path.join(
    corePath,
    "contracts",
    "deployments",
    `${env}.json`,
  );

  if (!fs.existsSync(deploymentPath)) {
    console.error(colors.red(`Error: Deployment for "${env}" not found.`));
    console.error(
      colors.gray(`Run "yarn deploy:${env}" in the core repo first.`),
    );
    process.exit(1);
  }

  return deploymentPath;
}

function extractAbis(
  corePath: string,
  contracts: string[],
  outputDir: string,
): void {
  const abisDir = path.join(outputDir, "abis");
  fs.mkdirSync(abisDir, { recursive: true });

  console.log(colors.blue("\nExtracting ABIs..."));

  for (const contractName of contracts) {
    const artifactPath = path.join(
      corePath,
      "contracts",
      "out",
      `${contractName}.sol`,
      `${contractName}.json`,
    );

    if (!fs.existsSync(artifactPath)) {
      console.log(
        colors.yellow(`  [SKIP] ${contractName} - artifact not found`),
      );
      continue;
    }

    try {
      const artifact: ForgeArtifact = JSON.parse(
        fs.readFileSync(artifactPath, "utf8"),
      );

      if (!artifact.abi) {
        console.log(colors.yellow(`  [SKIP] ${contractName} - no ABI found`));
        continue;
      }

      const outputPath = path.join(abisDir, `${contractName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(artifact.abi, null, 2));
      console.log(colors.green(`  [OK] ${contractName}`));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(colors.red(`  [ERROR] ${contractName}: ${message}`));
    }
  }
}

function copyDeployment(
  deploymentPath: string,
  outputDir: string,
  env: string,
): void {
  const deploymentsDir = path.join(outputDir, "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });

  console.log(colors.blue("\nCopying deployment..."));

  // Read deployment JSON
  const deployment: DeploymentJson = JSON.parse(
    fs.readFileSync(deploymentPath, "utf8"),
  );

  // Copy full deployment file
  const fullDeploymentPath = path.join(deploymentsDir, `${env}.json`);
  fs.writeFileSync(fullDeploymentPath, JSON.stringify(deployment, null, 2));
  console.log(colors.green(`  [OK] ${env}.json`));
}

function main(): void {
  // Parse environment argument (default to "local")
  const env = process.argv[2] || "local";
  const validEnvs = ["local", "testnet"];

  if (!validEnvs.includes(env)) {
    console.error(colors.red(`Error: Invalid environment "${env}".`));
    console.error(colors.gray(`Valid environments: ${validEnvs.join(", ")}`));
    process.exit(1);
  }

  console.log(colors.blue(`\nSyncing contracts for environment: ${env}`));
  console.log(colors.gray("─".repeat(50)));

  // Load config
  const config = loadConfig();

  // Validate paths
  const corePath = validateCorePath(config.source.corePath);
  validateContractsBuilt(corePath);
  const deploymentPath = validateDeployment(corePath, env);

  // Resolve output directory
  const outputDir = path.resolve(process.cwd(), config.output.dir);

  // Extract ABIs
  extractAbis(corePath, config.contracts, outputDir);

  // Copy deployment
  copyDeployment(deploymentPath, outputDir, env);

  console.log(colors.gray("\n" + "─".repeat(50)));
  console.log(colors.green("Sync complete!"));
  console.log(colors.gray(`Output: ${config.output.dir}/`));
}

main();
