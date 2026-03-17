import {
  CONTRACTS_ENV,
  RPC_URL_FOUNDRY,
  RPC_URL_MAINNET,
  RPC_URL_SEPOLIA,
  WALLET_CONNECT_PROJECT_ID,
} from "@olla-ui/types";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  ledgerWallet,
  metaMaskWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import type { Chain } from "viem";
import { foundry, mainnet, sepolia } from "viem/chains";
import { createConfig, http, WagmiProvider as WagmiProviderLib } from "wagmi";
import { injected } from "wagmi/connectors";

const transports: Record<number, ReturnType<typeof http>> = {};

if (RPC_URL_FOUNDRY) {
  transports[foundry.id] = http(RPC_URL_FOUNDRY);
}
if (RPC_URL_MAINNET) {
  transports[mainnet.id] = http(RPC_URL_MAINNET);
}
if (RPC_URL_SEPOLIA) {
  transports[sepolia.id] = http(RPC_URL_SEPOLIA);
}

const chains: readonly [Chain, ...Chain[]] = (() => {
  switch (CONTRACTS_ENV) {
    case "mainnet":
      return [mainnet];
    case "sepolia":
      return [sepolia];
    case "local":
    default:
      return [foundry];
  }
})();

const config = WALLET_CONNECT_PROJECT_ID
  ? getDefaultConfig({
      appName: "Olla Finance",
      appDescription: "Liquid Staking Protocol",
      appUrl: "https://olla.finance",
      appIcon: "https://olla.finance/logo.png",
      projectId: WALLET_CONNECT_PROJECT_ID,
      chains,
      transports,
      wallets: [
        {
          groupName: "Popular",
          wallets: [metaMaskWallet, walletConnectWallet],
        },
        {
          groupName: "More",
          wallets: [trustWallet, ledgerWallet, safeWallet],
        },
      ],
    })
  : createConfig({
      chains,
      transports,
      connectors: [injected()],
    });

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProviderLib config={config}>{children}</WagmiProviderLib>;
}
