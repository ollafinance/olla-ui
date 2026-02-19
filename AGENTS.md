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
| Zod | 4.3.6 | Schema validation & type inference |
| wagmi | 3.3.4 | React hooks for Ethereum |
| viem | 2.44.4 | TypeScript Ethereum library |
| RainbowKit | 2.2.10 | Wallet connection UI |
| TanStack Query | 5.90.19 | Server state management |
| ESLint | 9.39.1 | Flat config format |
| Prettier | 3.8.1 | Code formatter |
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

# Formatting
yarn pretty           # Format code with Prettier

# Preview
yarn preview          # Preview production build locally
```

### Testing

**No test framework is currently configured.** If tests are added, they should use Vitest (compatible with Vite).

## Project Structure

This project follows a **Feature-First Architecture** with a **Shared Kernel** for protocol logic.

### Directory Layout

```
src/
├── components/          # GLOBAL SHARED UI
│   ├── ui/              # Generic "Atoms" (Button, Card, Input) - No business logic
│   └── layout/          # Structural templates (LayoutShell, Header)
│
├── features/            # VERTICAL SLICES (Business Logic)
│   ├── staking/         # "Staking" feature
│   │   ├── components/  # Domain-specific UI (StatusPanel)
│   │   └── StakingFeature.tsx # Feature container
│   └── withdraw/        # Future "Withdraw" feature
│
├── hooks/               # SHARED KERNEL
│   ├── protocol/        # Global Protocol Hooks (wraps contracts)
│   └── useTheme.ts      # Theme management hook
│
├── providers/           # GLOBAL PROVIDERS
│   ├── theme-provider.tsx     # Theme context provider
│   ├── wagmi-provider.tsx     # Wagmi context provider
│   └── rainbowkit-provider.tsx # RainbowKit provider & config
│
├── routes/              # ROUTING (TanStack Router)
│   ├── __root.tsx       # Global layout wrapper
│   └── index.tsx        # Route definitions
│
├── lib/                 # UTILITIES
│   └── utils.ts         # cn() helper
│
└── ... (config, constants, generated)
```

### Architectural Principles

1.  **Feature Isolation:**
    *   Features (e.g., `src/features/staking`) should NOT import from other features.
    *   Shared logic must move to `src/hooks/protocol/` or `src/components/ui/`.

2.  **Protocol Layer (`src/hooks/protocol/`):**
    *   Contains "canonical" hooks for smart contract interaction.
    *   Hooks must be generic (e.g., accept `amount` as arg, not hardcoded).
    *   Accessible by ALL features.

3.  **UI Atoms (`src/components/ui/`):**
    *   "Dumb" components styled with Tailwind.
    *   Must NOT contain business logic or imports from `features/`.

4.  **Feature Hooks (`src/features/*/hooks/`):**
    *   Manage UI-specific state (forms, wizards, validation) for that feature.
    *   Private to the feature (not shared).
    *   Can compose Protocol Hooks to build complex interactions.

5.  **Routing:**
    *   Uses **TanStack Router**.
    *   Routes are code-based in `src/routes/` to preserve the folder structure.

### Code Style Guidelines

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

- Use `useConnection` for wallet address and connection status
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

### Zod Validation

Use **Zod v4** for runtime validation and type inference. Key patterns:

```typescript
import { z } from "zod";

// Define schema
const userSchema = z.object({
  address: z.string().startsWith("0x"),
  amount: z.string().min(1),
});

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>;

// Validate with safeParse (recommended)
const result = userSchema.safeParse(data);
if (!result.success) {
  // Access errors via result.error.issues (Zod v4)
  result.error.issues.forEach((issue) => {
    console.error(`${issue.path.join(".")}: ${issue.message}`);
  });
}
```

**Environment Variables:** Validated at startup via `src/config/environment.ts` using Zod schemas.

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript root config (references app/node configs) |
| `tsconfig.app.json` | App TypeScript settings (ES2022, strict, react-jsx) |
| `eslint.config.js` | ESLint flat config with TS + React rules |
| `.prettierrc` | Prettier config |
| `vite.config.ts` | Vite config with React, Tailwind, Node polyfills |
| `.yarnrc.yml` | Yarn 4 config (node-modules linker) |

## Environment Variables

Required in `.env` (see `env.example`):

```
VITE_RPC_URL_FOUNDRY=http://localhost:8545
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
```

## Related Repositories

- **olla-core**: Smart contracts (https://github.com/ollafinance/core)
- ABIs are generated from olla-core and placed in `src/abis/`

## Common Pitfalls

1. **Don't commit ABIs** - `src/abis/` is gitignored (generated files)
2. **Use Yarn 4** - Run `yarn` not `npm install`
3. **Tailwind v4 syntax** - Uses `@import "tailwindcss"` not `@tailwind` directives
4. **React 19** - Be aware of new features and potential breaking changes
