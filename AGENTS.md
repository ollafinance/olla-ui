# AGENTS.md - Olla UI

> Guidelines for AI coding agents working in this repository.

## Project Overview

This is a **Web3 frontend** for the Olla liquid staking protocol on Aztec. Built with React 19, TypeScript 5.9, Vite 7, and Tailwind CSS 4.

## Tech Stack & Versions

| Technology | Version | Notes |
|------------|---------|-------|
| React | 19.2.0 | With react-dom 19.2.0 |
| TypeScript | 5.9.3 | Strict mode enabled |
| Vite | 7.2.4 | Build tool with HMR |
| Tailwind CSS | 4.1.18 | v4 with `@tailwindcss/vite` plugin |
| wagmi | 3.3.4 | React hooks for Ethereum |
| viem | 2.44.4 | TypeScript Ethereum library |
| RainbowKit | 2.2.10 | Wallet connection UI |
| TanStack Query | 5.90.19 | Server state management |
| ESLint | 9.39.1 | Flat config format |
| Node.js | 18+ | Required runtime |
| Yarn | 4.12.0 | Package manager (Berry) |

## Commands

```bash
# Development
yarn dev              # Start dev server (Vite)

# Build
yarn build            # TypeScript check + production build

# Linting
yarn lint             # Run ESLint on all files

# Preview
yarn preview          # Preview production build locally
```

### Testing

**No test framework is currently configured.** If tests are added, they should use Vitest (compatible with Vite).

## Project Structure

```
src/
├── abis/              # Contract ABIs (JSON, gitignored - generated)
├── assets/            # Static assets (SVGs, images)
├── components/        # React components (PascalCase.tsx)
├── config/            # Configuration files (rainbowkit.ts)
├── constants/         # Constants and contract addresses
├── hooks/             # Custom React hooks (useSomething.ts)
├── App.tsx            # Main application component
├── main.tsx           # Entry point with providers
└── index.css          # Global styles (Tailwind imports)
```

## Code Style Guidelines

### TypeScript

- **Strict mode** is enabled - no implicit `any`, unused variables, or parameters
- Use `verbatimModuleSyntax` - explicit `type` imports required for type-only imports
- Use `interface` for component props, `type` for unions/utilities
- Prefer type inference where obvious; explicit types for function params/returns

```typescript
// Props interface pattern
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}
```

### Components

- Use **function declarations** (not arrow functions) for components
- Use **named exports** for components (except App which uses default)
- Keep components in `src/components/` with PascalCase filenames

```typescript
// Correct
export function MyComponent({ prop }: MyComponentProps) {
  return <div>{prop}</div>;
}

// Avoid
export const MyComponent = ({ prop }) => <div>{prop}</div>;
```

### Hooks

- Custom hooks go in `src/hooks/` with `use` prefix (camelCase)
- Return structured objects with data and actions
- Handle loading/error states internally

```typescript
export function useMyHook() {
  // logic...
  return {
    data: formattedData,
    action: { write: doAction, isPending, isConfirmed },
  };
}
```

### Imports

Order imports as follows:
1. CSS imports (`import "styles.css"`)
2. React imports
3. External libraries (wagmi, viem, etc.)
4. Local imports (components, hooks, constants)

```typescript
import "@rainbow-me/rainbowkit/styles.css";

import { useState } from "react";
import { useAccount } from "wagmi";

import { Header } from "./components/Header";
import { CONTRACTS } from "./constants/contracts";
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `StatusPanel.tsx` |
| Hooks | camelCase with `use` prefix | `useAztecToken.ts` |
| Functions | camelCase | `mintTokens`, `approveSpender` |
| Constants | SCREAMING_SNAKE_CASE | `CONTRACTS`, `MAX_AMOUNT` |
| Booleans | `is`/`has` prefix | `isConnected`, `isPending` |
| Files | PascalCase (components), camelCase (others) | |

### Styling

- Use **Tailwind CSS v4** utility classes directly in JSX
- Custom theme values in `index.css` using `@theme` directive
- No CSS modules or styled-components

```typescript
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
```

### Error Handling

- Use wagmi's built-in error states (`error`, `isPending`, `isError`)
- Guard clauses with early returns for missing data
- Display errors with proper styling

```typescript
const doAction = () => {
  if (!address) return; // Guard clause
  mutate({ ... });
};

// Error display
{error && (
  <div className="text-red-600 bg-red-50 p-2 rounded">
    {(error as any).shortMessage || error.message}
  </div>
)}
```

### Web3 Patterns

- Use `useReadContract` for reading blockchain state
- Use `useWriteContract` for transactions
- Use `useWaitForTransactionReceipt` for confirmation
- Addresses are typed as `` `0x${string}` ``
- Use `parseEther`/`formatEther` from viem for ETH values

```typescript
const { data, refetch } = useReadContract({
  address: CONTRACTS.TOKEN.address,
  abi: CONTRACTS.TOKEN.abi,
  functionName: "balanceOf",
  args: address ? [address] : undefined,
  query: { enabled: !!address },
});
```

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript root config (references app/node configs) |
| `tsconfig.app.json` | App TypeScript settings (ES2022, strict, react-jsx) |
| `eslint.config.js` | ESLint flat config with TS + React rules |
| `vite.config.ts` | Vite config with React, Tailwind, Node polyfills |
| `.yarnrc.yml` | Yarn 4 config (node-modules linker) |

## Environment Variables

Required in `.env` (see `env.example`):

```
VITE_RPC_URL=http://localhost:8545
WALLET_CONNECT_PROJECT_ID=your_project_id
```

## Related Repositories

- **olla-core**: Smart contracts (https://github.com/ollafinance/core)
- ABIs are generated from olla-core and placed in `src/abis/`

## Common Pitfalls

1. **Don't commit ABIs** - `src/abis/` is gitignored (generated files)
2. **Use Yarn 4** - Run `yarn` not `npm install`
3. **Tailwind v4 syntax** - Uses `@import "tailwindcss"` not `@tailwind` directives
4. **React 19** - Be aware of new features and potential breaking changes
5. **No Prettier** - Formatting relies on ESLint and editor settings
