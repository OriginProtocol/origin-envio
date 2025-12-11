# Architecture Quick Reference
## Product-Based with Multichain Support

## Indexer Overview

```
indexers/
├── oToken/         # All OTokens (OETH, OUSD, OS, superOETHb)
├── strategies/       # All strategies
├── governance/       # All governance (OGV, OGN)
├── staking/          # All staking (OGV, ES, Native, Legacy)
├── arm/              # ARM pools
├── pools/            # All pools (Curve, Aerodrome, Generic)
├── erc20/            # All ERC20 tokens
├── bridges/          # Cross-chain bridges
├── exchange-rates/   # Price data
├── protocol-stats/   # Aggregations
├── mainnet-misc/     # Mainnet-specific
└── sonic-misc/       # Sonic-specific
```

## Multichain Configuration Pattern

```yaml
# Example: oToken/config.yaml
name: oToken
networks:
  - id: 1  # Mainnet
    start_block: 11590995
    contracts:
      - name: OETH
        address: '0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3'
        handler: ./EventHandlers.ts
        events:
          - event: Transfer(...)
      - name: OUSD
        address: '0x2a8e1e676ec238d8a992307b495b45b3feaa5e86'
        handler: ./EventHandlers.ts
        events:
          - event: Transfer(...)
  
  - id: 8453  # Base
    start_block: 12000000
    contracts:
      - name: OETHB
        address: '0xdbfefd2e8460a6ee4955a68582f85708baea60a3'
        handler: ./EventHandlers.ts
        events:
          - event: Transfer(...)

unordered_multichain_mode: true
preload_handlers: true
```

## Handler Pattern (Chain-Agnostic)

```typescript
import { getToken } from '../../shared/utils/tokens';
import { generateOTokenId } from '../../shared/utils/ids';
import { calculateRebase } from '../../shared/modules/o-token';
import { OETH } from './generated';

OETH.Transfer.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const tokenAddress = event.srcAddress.toLowerCase();
  
  // Determine token from address (works for all chains)
  const token = getToken(tokenAddress, chainId);
  if (!token) return;
  
  // Generate chain-specific entity ID
  const entityId = generateOTokenId(chainId, tokenAddress, event.params.from);
  
  // Handler logic (same for all OTokens)
  context.OTokenAddress.set({
    id: entityId,
    chainId: chainId,
    otoken: tokenAddress,
    address: event.params.from,
    // ...
  });
});
```

## Entity ID Pattern

**Always include chain ID in entity IDs:**

```typescript
// ✅ CORRECT
const entityId = `${chainId}:${address}:${account}`;
const rebaseId = `${chainId}:${blockNumber}:${logIndex}`;

// ❌ WRONG (collision risk)
const entityId = `${address}:${account}`;
```

## Import Patterns

```typescript
// Shared constants
import { CHAINS, TOKENS, CONTRACT_ADDRESSES } from '../../shared/constants';

// Shared utilities
import { getToken, normalizeAmount } from '../../shared/utils';
import { calculateAPY } from '../../shared/utils/math';
import { generateOTokenId } from '../../shared/utils/ids';

// Shared modules
import { calculateRebase } from '../../shared/modules/o-token';
import { processTransfer } from '../../shared/modules/erc20';

// Shared effects
import { getTokenPrice } from '../../shared/effects/prices';

// Types
import type { Token, ChainId } from '../../shared/types';
```

## Adding a New Chain

### Step 1: Update config.yaml
```yaml
# oToken/config.yaml
networks:
  - id: NEW_CHAIN_ID
    start_block: 0
    contracts:
      - name: OTOKEN_NEW
        address: '0x...'
        handler: ./EventHandlers.ts
        events:
          - event: Transfer(...)
```

### Step 2: Add token to constants
```typescript
// shared/constants/tokens.ts
export const tokens = {
  // ...
  newChain: {
    OTOKEN_NEW: {
      id: 'NEW_CHAIN_ID:OTOKEN_NEW',
      address: '0x...',
      chainId: NEW_CHAIN_ID,
      // ...
    }
  }
};
```

### Step 3: Test
```bash
pnpm oToken:codegen
pnpm oToken:dev
```

**No code changes needed!** Same handlers work for all chains.

## Adding a New Product

### Step 1: Create indexer folder
```bash
mkdir src/indexers/new-product
```

### Step 2: Copy template
```bash
cp -r src/tooling/templates/indexer-template/* src/indexers/new-product/
```

### Step 3: Configure
```yaml
# new-product/config.yaml
name: new-product
networks:
  - id: 1
    start_block: 0
    contracts:
      - name: NewProduct
        address: '0x...'
        handler: ./EventHandlers.ts
        events:
          - event: EventName(...)
```

### Step 4: Define schema
```graphql
# new-product/schema.graphql
type NewProductEntity @entity {
  id: String!
  chainId: Int!
  # ...
}
```

### Step 5: Implement handlers
```typescript
// new-product/EventHandlers.ts
import { NewProduct } from './generated';

NewProduct.EventName.handler(async ({ event, context }) => {
  // Handler logic
});
```

## Common Patterns

### Pattern 1: Chain-Agnostic Handler
```typescript
Contract.Event.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const address = event.srcAddress.toLowerCase();
  
  // Use chain ID in entity ID
  const entityId = `${chainId}:${address}:${event.params.id}`;
  
  // Handler logic (same for all chains)
  context.Entity.set({
    id: entityId,
    chainId: chainId,
    // ...
  });
});
```

### Pattern 2: Token Detection
```typescript
import { getToken } from '../../shared/utils/tokens';

Contract.Transfer.handler(async ({ event, context }) => {
  const token = getToken(event.srcAddress, event.chainId);
  if (!token) return;
  
  // Use token info
  const entityId = `${event.chainId}:${token.id}:${event.params.from}`;
  // ...
});
```

### Pattern 3: Shared Module Usage
```typescript
import { calculateRebase } from '../../shared/modules/o-token';

Contract.Rebase.handler(async ({ event, context }) => {
  const rebaseData = calculateRebase({
    totalSupply: event.params.totalSupply,
    rebasingSupply: event.params.rebasingSupply,
    nonRebasingSupply: event.params.nonRebasingSupply,
  });
  
  // Use rebaseData
});
```

### Pattern 4: Effect for External Calls
```typescript
import { getTokenPrice } from '../../shared/effects/prices';

Contract.Event.handler(async ({ event, context }) => {
  const price = await context.effect(getTokenPrice, {
    address: event.srcAddress,
    chainId: event.chainId,
    blockNumber: event.block.number,
  });
  
  // Use price
});
```

## Development Workflow

### 1. Create/Modify Indexer
```bash
cd src/indexers/{indexer-name}

# Edit config.yaml (add networks/contracts)
# Edit schema.graphql
# Edit EventHandlers.ts

# Generate code
pnpm {indexer-name}:codegen

# Type check
pnpm tsc --noEmit

# Run indexer
TUI_OFF=true pnpm {indexer-name}:dev
```

### 2. Add Shared Utility
```typescript
// Add to src/shared/utils/{domain}/{feature}.ts
export function newUtility() {
  // ...
}

// Export from src/shared/utils/{domain}/index.ts
export * from './feature';

// Use in indexers
import { newUtility } from '../../shared/utils/{domain}';
```

### 3. Create Shared Module
```typescript
// Add to src/shared/modules/{domain}/{feature}.ts
export function newModuleFunction() {
  // ...
}

// Export from src/shared/modules/{domain}/index.ts
export * from './feature';

// Use in indexers
import { newModuleFunction } from '../../shared/modules/{domain}';
```

## Key Principles

1. **Product-Based**: Group by product/feature, not chain
2. **Multichain**: Use `networks` array in config.yaml
3. **Chain ID in IDs**: Always include chain ID in entity IDs
4. **Shared Code**: Use shared modules/utils for common logic
5. **Chain-Agnostic**: Handlers should work for all chains
6. **Effects for External**: Use effects for external calls

## Package.json Scripts

```json
{
  "scripts": {
    "oToken:codegen": "envio codegen -d src/indexers/oToken",
    "oToken:dev": "envio dev -d src/indexers/oToken",
    "strategies:codegen": "envio codegen -d src/indexers/strategies",
    "strategies:dev": "envio dev -d src/indexers/strategies",
    // ... similar for all indexers
    "codegen:all": "node src/tooling/scripts/codegen-all.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

## File Naming Conventions

- **Handlers**: `{feature}.ts` in `handlers/`
- **Modules**: `{feature}.ts` in `shared/modules/{domain}/`
- **Utils**: `{feature}.ts` in `shared/utils/{domain}/`
- **Constants**: `{domain}.ts` in `shared/constants/`
- **Effects**: `{purpose}.ts` in `shared/effects/`

## Testing Checklist

- [ ] Run `pnpm codegen` after schema/config changes
- [ ] Run `pnpm tsc --noEmit` after TypeScript changes
- [ ] Run `TUI_OFF=true pnpm dev` to test runtime
- [ ] Verify chain ID in entity IDs
- [ ] Test with events from multiple chains
- [ ] Check for linter errors

## Benefits Summary

- ✅ **Code Reuse**: 70%+ (vs 30% chain-based)
- ✅ **Unified View**: All products of same type together
- ✅ **Easy Maintenance**: Fix once, applies everywhere
- ✅ **Leverages Envio**: Uses multichain properly
- ✅ **Scalable**: Add chain = config update
- ✅ **Better DX**: Clear product boundaries

