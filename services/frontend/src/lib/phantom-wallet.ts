/**
 * Custom Phantom wallet connector for RainbowKit.
 *
 * The built-in `phantomWallet` from @rainbow-me/rainbowkit only supports the
 * browser extension and has no mobile deep-link or QR code flow, so it is
 * hidden by RainbowKit on mobile devices. This connector adds WalletConnect
 * support so Phantom shows up (and works) on mobile.
 */

import type { RainbowKitWalletConnectParameters, Wallet } from "@rainbow-me/rainbowkit";
import { getWalletConnectConnector } from "@rainbow-me/rainbowkit";
import { createConnector } from "wagmi";
import { injected } from "wagmi/connectors";

export interface PhantomWalletOptions {
  projectId: string;
  walletConnectParameters?: RainbowKitWalletConnectParameters;
}

// Phantom's WalletConnect deep-link URI scheme for mobile
const getPhantomMobileUri = (uri: string) =>
  `https://phantom.app/ul/wc?uri=${encodeURIComponent(uri)}`;

function getPhantomInjectedProvider() {
  if (typeof window === "undefined") return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)?.phantom?.ethereum;
}

// Inline injected connector using the phantom.ethereum namespace,
// mirroring what RainbowKit's getInjectedConnector does internally.
function getPhantomInjectedConnector() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (walletDetails: any) =>
    createConnector((config) => ({
      ...injected({
        target: () => ({
          id: "phantom",
          name: "Phantom",
          provider: getPhantomInjectedProvider(),
        }),
      })(config),
      ...walletDetails,
    }));
}

export function customPhantomWallet({
  projectId,
  walletConnectParameters,
}: PhantomWalletOptions): Wallet {
  const isPhantomInjected = !!getPhantomInjectedProvider();
  const shouldUseWalletConnect = !isPhantomInjected;

  return {
    id: "phantom",
    name: "Phantom",
    rdns: "app.phantom",
    iconUrl:
      "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2228%22%20fill%3D%22none%22%3E%3Cg%20clip-path%3D%22url(%23a)%22%3E%3Cpath%20fill%3D%22%23AB9FF2%22%20d%3D%22M28%200H0v28h28V0Z%22%2F%3E%3Cpath%20fill%3D%22%23FFFDF8%22%20fill-rule%3D%22evenodd%22%20d%3D%22M12.063%2018.128c-1.173%201.796-3.137%204.07-5.75%204.07-1.236%200-2.424-.51-2.424-2.719%200-5.627%207.682-14.337%2014.81-14.337%204.056%200%205.671%202.813%205.671%206.008%200%204.101-2.66%208.79-5.306%208.79-.84%200-1.252-.46-1.252-1.192%200-.19.032-.397.095-.62-.902%201.542-2.645%202.973-4.276%202.973-1.188%200-1.79-.747-1.79-1.797%200-.381.079-.778.222-1.176Zm9.63-7.089c0%20.931-.549%201.397-1.163%201.397-.624%200-1.164-.466-1.164-1.397%200-.93.54-1.396%201.164-1.396.614%200%201.164.465%201.164%201.396Zm-3.49%200c0%20.931-.55%201.397-1.164%201.397-.624%200-1.164-.466-1.164-1.397%200-.93.54-1.396%201.164-1.396.614%200%201.164.465%201.164%201.396Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fg%3E%3Cdefs%3E%3CclipPath%20id%3D%22a%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M0%200h28v28H0z%22%2F%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3C%2Fsvg%3E",
    iconBackground: "#9A8AEE",
    // Don't resolve to `false` — undefined means "unknown/show anyway"
    installed: isPhantomInjected || undefined,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=app.phantom",
      ios: "https://apps.apple.com/app/phantom-solana-wallet/1598432977",
      mobile: "https://phantom.app/download",
      qrCode: "https://phantom.app/download",
      chrome:
        "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
      firefox: "https://addons.mozilla.org/firefox/addon/phantom-app/",
      browserExtension: "https://phantom.app/download",
    },
    mobile: {
      getUri: shouldUseWalletConnect ? getPhantomMobileUri : undefined,
    },
    qrCode: shouldUseWalletConnect
      ? {
          getUri: (uri: string) => uri,
          instructions: {
            learnMoreUrl: "https://help.phantom.app",
            steps: [
              {
                description: "Download Phantom from the App Store or Google Play.",
                step: "install" as const,
                title: "Install Phantom",
              },
              {
                description: "Create or import a wallet inside Phantom.",
                step: "create" as const,
                title: "Create or import a wallet",
              },
              {
                description:
                  "Tap the scan icon in Phantom and scan this QR code to connect.",
                step: "scan" as const,
                title: "Scan the QR code",
              },
            ],
          },
        }
      : undefined,
    extension: {
      instructions: {
        learnMoreUrl: "https://help.phantom.app",
        steps: [
          {
            description: "Install the Phantom browser extension.",
            step: "install" as const,
            title: "Install Phantom",
          },
          {
            description: "Create or import a wallet inside Phantom.",
            step: "create" as const,
            title: "Create or import a wallet",
          },
          {
            description: "Refresh this page and connect.",
            step: "refresh" as const,
            title: "Refresh the page",
          },
        ],
      },
    },
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({ projectId, walletConnectParameters })
      : getPhantomInjectedConnector(),
  };
}
