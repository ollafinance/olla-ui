# Frontend Project Comparison

## Overview

This document compares two "production-ready" frontend implementations of a dApp that connects to a local Foundry chain. The dApp manages a 3-step interaction flow (Mint Tokens -> Approve Contract -> Deposit Assets) using **OllaCore** and **MockAztec** contracts.

1.  **lsp-react-standard**: Vite + React + Wagmi + ConnectKit + Tailwind
2.  **lsp-svelte-minimal**: SvelteKit (SPA) + Viem + Tailwind + Svelte 5 Runes

## Architecture & Structure

Both projects have been refactored to follow industry best practices for separation of concerns, but they achieve this differently.

### 1. lsp-react-standard (Hooks & Components)

**Pattern:** Custom Hooks encapsulate logic; Components are purely presentational.

*   **`src/hooks/`**: Contains domain logic.
    *   `useAztecToken.ts`: Wraps `useReadContract`/`useWriteContract` for Token operations (Balance, Allowance, Mint, Approve).
    *   `useOllaCore.ts`: Wraps logic for the main protocol interactions (Deposit).
*   **`src/components/`**: Presentational components (`Header`, `StatusPanel`, `ActionButtons`).
*   **`src/constants/`**: centralized contract addresses and ABIs.
*   **Data Flow**: React Context (Wagmi) $\to$ Hooks $\to$ Components.

### 2. lsp-svelte-minimal (Stores & Modules)

**Pattern:** Global Reactive Stores (Svelte 5 Runes) separate state from UI.

*   **`src/lib/stores/`**: Contains singleton logic classes.
    *   `wallet.svelte.ts`: **Generic** wallet management (Connection, Client instantiation). Reusable across any dApp.
    *   `olla.svelte.ts`: **Domain-specific** protocol logic. It imports `wallet` directly and reacts to it. Handles data fetching and transactions.
*   **`src/lib/components/`**: Presentational components (`Header`, `StatusPanel`, `ActionButtons`).
*   **Data Flow**: Global Store Imports $\to$ Components. No context providers needed.

## Metrics

| Metric | lsp-react-standard | lsp-svelte-minimal |
| :--- | :--- | :--- |
| **Total Bundle Size (JS)** | ~1.3 MB (480 KB gzipped) | ~230 KB (80 KB gzipped) |
| **Dependencies** | 22 (High due to Wagmi/Query) | 11 (Minimal) |
| **Main Logic File Size** | ~75 lines (`useAztecToken.ts`) | ~95 lines (`olla.svelte.ts`) |
| **Boilerplate** | **High**: Providers, Hook wrappers, Dependency Arrays. | **Low**: Direct imports, Classes with `$state`. |
| **Reactivity Model** | `useEffect` / Hook re-renders. | Fine-grained signals (`$state`, `$effect`). |

## Key Differences

### Developer Experience (DX)
*   **React**: Relies heavily on the **Wagmi** ecosystem. This is great for "standard" flows but adds abstraction layers. You spend time managing hook dependencies and component re-renders.
*   **Svelte**: Relies on **Viem** + **Runes**. You write standard TypeScript classes. State updates are mutable and fine-grained. The logic feels more like "vanilla JS" with magic reactivity.

### Scalability
*   **React**: Scales by adding more Hooks. Can lead to "Wrapper Hell" if not careful.
*   **Svelte**: Scales by adding more Store classes. Stores can easily import and depend on other stores (e.g., `OllaStore` depends on `WalletStore`), creating a clean dependency graph.

## Conclusion

The **Svelte 5** implementation demonstrates a significant reduction in complexity for the same feature set. By leveraging Runes, we eliminated the need for complex context providers and hook management found in the React version.

However, the **React** version remains the industry standard, benefiting from the pre-built UI of libraries like ConnectKit, whereas the Svelte version required custom implementation of the "Connect Wallet" button state logic.
