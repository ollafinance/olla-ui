# Olla UI Prototypes

This repository contains two frontend prototypes for the Olla interface, built to compare the Developer Experience (DX) and performance of React vs. Svelte 5.

## Projects

1.  **`lsp-react-standard`**: Built with Vite + React + Wagmi + ConnectKit.
2.  **`lsp-svelte-minimal`**: Built with SvelteKit + Svelte 5 (Runes) + Wagmi Core.

## Prerequisites

-   **Bun**: [Install Bun](https://bun.sh/)
-   **Foundry**: [Install Foundry](https://book.getfoundry.sh/getting-started/installation) (for the local chain)

## Setup & Running

### 1. Start the Local Chain

Ensure you have a local Anvil chain running at `http://127.0.0.1:8545` and that the mock contracts (`MockAztec`, `OllaCore`) are deployed.

```bash
# Example if running from a contracts repo
yarn dev:chain
```

### 2. Run the React Prototype

Standard industry stack with "batteries-included" hooks.

```bash
cd lsp-react-standard
bun install
bun dev
```

Access at: `http://localhost:5173`

### 3. Run the Svelte Prototype

Reactive approach using Svelte 5 Runes and Wagmi Core (Framework-Agnostic).

```bash
cd lsp-svelte-minimal
bun install
bun dev
```

Access at: `http://localhost:5174` (or similar port)

## Comparison

For a detailed technical breakdown of bundle sizes, dependency counts, and architectural patterns, see [COMPARISON.md](./COMPARISON.md).
