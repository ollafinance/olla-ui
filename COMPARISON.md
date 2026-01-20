# Frontend Project Comparison

## Overview

This document compares two "production-ready" frontend implementations of a dApp that connects to a local Foundry chain. The dApp manages a 3-step interaction flow (Mint Tokens -> Approve Contract -> Deposit Assets) using **OllaCore** and **MockAztec** contracts.

1.  **lsp-react-standard**: Vite + React + Wagmi + ConnectKit + Tailwind
2.  **lsp-svelte-minimal**: SvelteKit (SPA) + Wagmi Core + Tailwind + Svelte 5 Runes

## Architecture & Structure

Both projects have been refactored to follow industry best practices for separation of concerns, but they achieve this differently.

### 1. lsp-react-standard (Hooks & Components)

**Pattern:** Custom Hooks encapsulate logic; Components are purely presentational.

*   **`src/hooks/`**: Contains domain logic.
    *   `useAztecToken.ts`: Wraps `useReadContract`/`useWriteContract` for Token operations.
    *   `useOllaCore.ts`: Wraps logic for the main protocol interactions.
*   **Data Flow**: React Context (Wagmi) $\to$ Hooks $\to$ Components.

### 2. lsp-svelte-minimal (Stores & Modules)

**Pattern:** Global Reactive Stores (Svelte 5 Runes) separate state from UI.

*   **`src/lib/stores/`**: Contains singleton logic classes.
    *   `wallet.svelte.ts`: **Generic** wallet management using **@wagmi/core**. Handles connections and tracks account state.
    *   `olla.svelte.ts`: **Domain-specific** protocol logic. It imports `wallet` directly and uses Wagmi Core actions (`writeContract`, `readContract`) to interact with the chain.
*   **Data Flow**: Global Store Imports $\to$ Components. No context providers needed.

## Metrics

| Metric | lsp-react-standard | lsp-svelte-minimal |
| :--- | :--- | :--- |
| **Total Bundle Size (JS)** | ~1.3 MB (480 KB gzipped) | ~350 KB (120 KB gzipped) |
| **Dependencies** | 22 (High) | 14 (Moderate) |
| **Main Logic File Size** | ~75 lines (`useAztecToken.ts`) | ~95 lines (`olla.svelte.ts`) |
| **Boilerplate** | **High**: Providers, Hook wrappers, Dependency Arrays. | **Low**: Direct imports, Classes with `$state`. |
| **Reactivity Model** | `useEffect` / Hook re-renders. | Fine-grained signals (`$state`, `$effect`). |

## Key Differences

### Developer Experience (DX)
*   **React**: Relies heavily on the **Wagmi** hooks ecosystem. Great for "standard" flows but adds abstraction layers. You spend time managing hook dependencies and component re-renders.
*   **Svelte**: Uses **@wagmi/core** + **Runes**. You write standard TypeScript classes. The logic is Framework-Agnostic (Wagmi Core) but State Management is native (Runes). This provides the robustness of Wagmi with the simplicity of Svelte's reactivity.

### Scalability
*   **React**: Scales by adding more Hooks. Can lead to "Wrapper Hell" if not careful.
*   **Svelte**: Scales by adding more Store classes. Stores can easily import and depend on other stores (e.g., `OllaStore` depends on `WalletStore`), creating a clean dependency graph.

## Conclusion

The **Svelte 5** implementation demonstrates a significant reduction in complexity while maintaining robustness by using **@wagmi/core**. By leveraging Runes, we eliminated the need for complex context providers and hook management found in the React version, while still benefiting from Wagmi's battle-tested connectors and logic.
