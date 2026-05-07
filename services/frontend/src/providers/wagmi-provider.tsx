import {
  CONTRACTS_ENV,
  RPC_URL_FOUNDRY,
  RPC_URL_MAINNET,
  RPC_URL_SEPOLIA,
  WALLET_CONNECT_PROJECT_ID,
} from "@/constants/environment";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import type { Chain } from "viem";
import { foundry, mainnet, sepolia } from "viem/chains";
import {
  createConfig,
  http,
  WagmiProvider as WagmiProviderLib,
  type Connector,
  type CreateConnectorFn,
} from "wagmi";
import { disconnect as disconnectAction } from "wagmi/actions";
import { injected } from "wagmi/connectors";
import { isTermsAccepted } from "@/hooks/useTermsAcceptance";

const TERMS_ERROR =
  "Please accept the Terms of Use and Privacy Notice below to continue.";
const GATED_FLAG = "__ollaTermsGated";
const BLOCKED_EVENT = "olla:terms-gate-blocked";

type GatedConnector = Connector & { [GATED_FLAG]?: boolean };

function notifyBlocked() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BLOCKED_EVENT));
}

// Block all wallet calls that can trigger an extension prompt or session.
const BLOCKED_PROVIDER_METHODS = new Set([
  "eth_requestAccounts",
  "wallet_requestPermissions",
  "wallet_addEthereumChain",
  "wallet_switchEthereumChain",
  "personal_sign",
  "eth_sign",
  "eth_signTypedData",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
  "eth_sendTransaction",
]);

type GatedProvider = {
  request?: (args: { method: string; params?: unknown }) => Promise<unknown>;
  [GATED_FLAG]?: boolean;
};

function gateProvider(provider: GatedProvider | null | undefined) {
  if (!provider || provider[GATED_FLAG]) return provider;
  const originalRequest = provider.request?.bind(provider);
  if (!originalRequest) return provider;
  provider.request = async (args) => {
    if (
      !isTermsAccepted() &&
      typeof args?.method === "string" &&
      BLOCKED_PROVIDER_METHODS.has(args.method)
    ) {
      notifyBlocked();
      throw new Error(TERMS_ERROR);
    }
    return originalRequest(args);
  };
  provider[GATED_FLAG] = true;
  return provider;
}

function applyTermsGate(connector: GatedConnector) {
  if (connector[GATED_FLAG]) return;
  const originalConnect = connector.connect?.bind(connector);
  if (originalConnect) {
    connector.connect = async (params) => {
      if (!isTermsAccepted()) {
        notifyBlocked();
        throw new Error(TERMS_ERROR);
      }
      return originalConnect(params);
    };
  }
  // Provider-level gate: catches every code path that ends up calling the
  // wallet (including paths that bypass connector.connect, e.g. when wagmi
  // uses an EIP-6963 injected provider directly). gateProvider is idempotent
  // via its own flag so wrapping the same provider twice is a no-op.
  const c = connector as GatedConnector & {
    getProvider?: (params?: unknown) => Promise<GatedProvider | undefined>;
  };
  const originalGetProvider = c.getProvider?.bind(c);
  if (originalGetProvider) {
    c.getProvider = async (params) => {
      const provider = await originalGetProvider(params);
      gateProvider(provider);
      return provider;
    };
  }
  connector[GATED_FLAG] = true;
}

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
          wallets: [metaMaskWallet, walletConnectWallet, phantomWallet, rainbowWallet, coinbaseWallet],
        },
        {
          groupName: "More",
          wallets: [trustWallet, rabbyWallet, ledgerWallet, safeWallet],
        },
      ],
    })
  : createConfig({
      chains,
      transports,
      connectors: [injected()],
    });

// Three-layer terms gate. Connector-level wrappers (1, 2a, 2b) give the user a
// clean inline error in the modal when they click a wallet without ticking the
// box. The state subscription (3) is defense-in-depth: connectors can mark a
// session "connected" via emitter.on('connect', ...) without ever calling
// connector.connect (MetaMask "manually connect to current site", Safe iframe,
// pre-authorised injected wallets), which bypasses every connector wrapper.
type InternalConfig = Omit<typeof config, "_internal"> & {
  _internal: {
    connectors: {
      setup: (fn: CreateConnectorFn) => Connector;
      subscribe: (fn: (c: readonly Connector[]) => void) => void;
    };
  };
};
const internalConnectors = (config as InternalConfig)._internal.connectors;

for (const c of config.connectors) applyTermsGate(c as GatedConnector);

internalConnectors.subscribe((connectors) => {
  for (const c of connectors) applyTermsGate(c as GatedConnector);
});

const originalSetup = internalConnectors.setup.bind(internalConnectors);
internalConnectors.setup = (connectorFn: CreateConnectorFn) => {
  const connector = originalSetup(connectorFn);
  applyTermsGate(connector as GatedConnector);
  return connector;
};

config.subscribe(
  (state) => state.status,
  (status) => {
    if (status !== "connected") return;
    if (isTermsAccepted()) return;
    notifyBlocked();
    void disconnectAction(config).catch(() => {});
  },
);

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProviderLib config={config} reconnectOnMount={false}>
      {children}
    </WagmiProviderLib>
  );
}
