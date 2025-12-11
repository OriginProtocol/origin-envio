# Architecture Comparison: Chain-Based vs Product-Based

## Overview

This document compares two architectural approaches for the Origin Protocol Envio indexer system:
1. **Chain-Based**: Separate indexer per chain (original proposal)
2. **Product-Based**: Product/feature-based indexers with multichain support (revised proposal)

## Side-by-Side Comparison

### Indexer Organization

#### Chain-Based Approach
```
indexers/
├── mainnet/          # All mainnet products
│   ├── OETH
│   ├── OUSD
│   ├── OGV
│   ├── Governance
│   ├── Staking
│   └── ...
├── base/             # All base products
│   ├── OETHB
│   └── ...
├── arbitrum/         # All arbitrum products
├── sonic/            # All sonic products
│   ├── OS
│   └── ...
```
**Total**: 9+ indexers (one per chain)

#### Product-Based Approach
```
indexers/
├── oToken/         # All OTokens (OETH, OUSD, OS, superOETHb)
│   └── Networks: Mainnet, Base, Sonic
├── strategies/       # All strategies
│   └── Networks: Mainnet, Base, Sonic
├── governance/       # All governance
│   └── Networks: Mainnet
├── staking/          # All staking
│   └── Networks: Mainnet
├── arm/              # ARM pools
│   └── Networks: Mainnet, Sonic
├── pools/            # All pools
│   └── Networks: Mainnet, Base, Sonic
├── erc20/            # All ERC20 tokens
│   └── Networks: All chains
├── bridges/          # Cross-chain bridges
│   └── Networks: Mainnet, Arbitrum
├── exchange-rates/   # Price data
│   └── Networks: All chains
├── protocol-stats/   # Aggregations
│   └── Networks: All chains (queries others)
├── mainnet-misc/     # Mainnet-specific
│   └── Networks: Mainnet
└── sonic-misc/       # Sonic-specific
    └── Networks: Sonic
```
**Total**: 10-12 indexers (one per product/feature)

## Detailed Comparison

### 1. Code Reuse

| Aspect | Chain-Based | Product-Based |
|--------|-------------|---------------|
| **OToken Logic** | Duplicated 4 times (OETH, OUSD, OS, superOETHb) | Single implementation, used for all OTokens |
| **ERC20 Logic** | Duplicated per chain | Single implementation |
| **Strategy Logic** | Duplicated per chain | Single implementation |
| **Governance Logic** | Duplicated (OGV, OGN) | Single implementation |
| **Code Reuse %** | ~30% | ~70%+ |

**Winner**: Product-Based (70%+ code reuse vs 30%)

### 2. Adding a New Chain

#### Chain-Based
```typescript
// Need to create new indexer
indexers/
└── new-chain/
    ├── config.yaml
    ├── schema.graphql
    ├── EventHandlers.ts
    └── handlers/
        ├── oToken.handlers.ts      // Copy from mainnet
        ├── strategies.handlers.ts   // Copy from mainnet
        └── ...                      // Copy everything
```
**Effort**: High - Create entire new indexer, copy all handlers

#### Product-Based
```yaml
# Just update config.yaml in existing indexers
# oToken/config.yaml
networks:
  - id: NEW_CHAIN_ID
    start_block: 0
    contracts:
      - name: OTOKEN_NEW
        address: '0x...'
        # ... same handler, same logic
```
**Effort**: Low - Just add network to config, no code changes

**Winner**: Product-Based (config update vs full indexer creation)

### 3. Bug Fixes

#### Chain-Based
```typescript
// Bug in OToken rebase calculation
// Need to fix in:
// - mainnet/indexers/oeth/handlers/rebase.ts
// - mainnet/indexers/ousd/handlers/rebase.ts
// - base/indexers/oethb/handlers/rebase.ts
// - sonic/indexers/os/handlers/rebase.ts
```
**Effort**: Fix 4 times, test 4 times

#### Product-Based
```typescript
// Bug in OToken rebase calculation
// Fix in:
// - shared/modules/o-token/rebase.ts
// OR
// - oToken/handlers/rebase.ts
```
**Effort**: Fix once, applies to all OTokens

**Winner**: Product-Based (fix once vs fix N times)

### 4. Querying Data

#### Chain-Based
```graphql
# Query OETH on mainnet
query {
  oethTokens(where: { chainId: { eq: 1 } }) {
    # ...
  }
}

# Query OETHB on base
query {
  oethbTokens(where: { chainId: { eq: 8453 } }) {
    # ...
  }
}

# Compare OETH vs OETHB - need to query 2 endpoints
```
**Complexity**: Multiple endpoints, manual joining

#### Product-Based
```graphql
# Query all OTokens
query {
  oTokens(where: { chainId: { eq: 1 } }) {  # Mainnet OETH
    # ...
  }
  oTokens(where: { chainId: { eq: 8453 } }) {  # Base OETHB
    # ...
  }
}

# Or query all at once
query {
  oTokens {
    chainId
    symbol
    # ... compare all OTokens
  }
}
```
**Complexity**: Single endpoint, easy comparison

**Winner**: Product-Based (unified querying)

### 5. Cross-Chain Analytics

#### Chain-Based
```typescript
// Compare OETH (mainnet) vs OETHB (base)
// Need to:
// 1. Query mainnet indexer
// 2. Query base indexer
// 3. Join results manually
// 4. Handle different schemas/endpoints
```
**Complexity**: High - Multiple queries, manual joining

#### Product-Based
```typescript
// Compare OETH (mainnet) vs OETHB (base)
// Single query:
query {
  oTokens(where: { 
    chainId: { in: [1, 8453] }
    symbol: { in: ["OETH", "OETHB"] }
  }) {
    chainId
    symbol
    totalSupply
    # ... compare directly
  }
}
```
**Complexity**: Low - Single query, direct comparison

**Winner**: Product-Based (single query vs multiple)

### 6. Multichain Support

#### Chain-Based
```yaml
# Each indexer handles one chain
# mainnet/config.yaml
networks:
  - id: 1
    # ...
```
**Usage**: Not leveraging multichain (one chain per indexer)

#### Product-Based
```yaml
# Each indexer handles multiple chains
# oToken/config.yaml
networks:
  - id: 1      # Mainnet
  - id: 8453   # Base
  - id: 146    # Sonic
unordered_multichain_mode: true
```
**Usage**: Fully leveraging multichain support

**Winner**: Product-Based (leverages Envio feature)

### 7. Maintenance Overhead

| Task | Chain-Based | Product-Based |
|------|-------------|---------------|
| **Update OToken logic** | Update 4 indexers | Update 1 indexer |
| **Add new OToken** | Create new indexer or add to chain | Add to networks array |
| **Fix bug** | Fix in N places | Fix once |
| **Test** | Test N indexers | Test 1 indexer |
| **Deploy** | Deploy N indexers | Deploy 1 indexer |

**Winner**: Product-Based (lower maintenance overhead)

### 8. Performance

| Aspect | Chain-Based | Product-Based |
|--------|-------------|---------------|
| **Indexer Count** | 9+ indexers | 10-12 indexers |
| **Code Duplication** | High | Low |
| **Bundle Size** | Larger (duplicated code) | Smaller (shared code) |
| **Processing** | Parallel (separate indexers) | Parallel (Envio multichain) |
| **Database** | Separate per indexer | Separate per indexer |

**Winner**: Tie (both support parallel processing)

### 9. Developer Experience

#### Chain-Based
- ❌ Hard to find related code (scattered across chains)
- ❌ Copy-paste when adding new chain
- ❌ Inconsistent implementations
- ✅ Clear chain boundaries

#### Product-Based
- ✅ Easy to find product code (all in one place)
- ✅ Add chain: just config update
- ✅ Consistent implementations (shared code)
- ✅ Clear product boundaries

**Winner**: Product-Based (better DX)

### 10. Scalability

#### Chain-Based
```
Adding new chain:
- Create new indexer
- Copy all handlers
- Duplicate all logic
- Test everything
- Deploy separately
```
**Scalability**: Poor - Linear growth in complexity

#### Product-Based
```
Adding new chain:
- Add network to config.yaml
- Update addresses
- Test (same logic, different chain)
- Deploy (same indexer)
```
**Scalability**: Excellent - Constant complexity

**Winner**: Product-Based (better scalability)

## Real-World Example: OToken Rebase Logic

### Chain-Based Implementation

```typescript
// mainnet/oeth/handlers/rebase.ts
export function handleRebase(event, context) {
  // OETH-specific rebase logic
  // 200 lines of code
}

// mainnet/ousd/handlers/rebase.ts
export function handleRebase(event, context) {
  // OUSD-specific rebase logic (mostly same)
  // 200 lines of code (duplicated)
}

// base/oethb/handlers/rebase.ts
export function handleRebase(event, context) {
  // OETHB-specific rebase logic (mostly same)
  // 200 lines of code (duplicated)
}

// sonic/os/handlers/rebase.ts
export function handleRebase(event, context) {
  // OS-specific rebase logic (mostly same)
  // 200 lines of code (duplicated)
}

```
**Total**: ~800 lines (4 × 200), mostly duplicated

### Product-Based Implementation

```typescript
// shared/modules/o-token/rebase.ts
export function calculateRebase(params) {
  // Shared rebase logic
  // 200 lines of code (once)
}

// oToken/handlers/rebase.ts
import { calculateRebase } from '../../shared/modules/o-token';

OETH.Rebase.handler(async ({ event, context }) => {
  // Works for all OToken contracts
  const rebaseData = calculateRebase({
    totalSupply: event.params.totalSupply,
    rebasingSupply: event.params.rebasingSupply,
    nonRebasingSupply: event.params.nonRebasingSupply,
    chainId: event.chainId,
    tokenAddress: event.srcAddress,
  });
  // ... create entity
});
```
**Total**: ~250 lines (200 shared + 50 handler), no duplication

**Code Reduction**: 69% (800 → 250 lines)

## Migration Complexity

### Chain-Based Migration
```
1. Create 9 indexers (one per chain)
2. Copy handlers to each
3. Adapt for each chain
4. Test each independently
5. Deploy each separately
```
**Complexity**: High - 9 separate migrations

### Product-Based Migration
```
1. Create 10-12 product indexers
2. Configure multichain in each
3. Use shared modules
4. Test each product (all chains)
5. Deploy each separately
```
**Complexity**: Medium - Fewer indexers, but multichain config

**Winner**: Product-Based (fewer migrations, better reuse)

## Recommendation

**Product-Based Architecture** is recommended because:

1. ✅ **70%+ code reuse** vs 30% in chain-based
2. ✅ **Leverages Envio multichain** properly
3. ✅ **Unified view** of products across chains
4. ✅ **Easier maintenance** (fix once, applies everywhere)
5. ✅ **Better scalability** (add chain = config update)
6. ✅ **Better developer experience** (clear product boundaries)
7. ✅ **Simpler queries** (single endpoint per product)
8. ✅ **Easier cross-chain analytics** (same indexer)

The only downside is slightly more complex multichain configuration, but this is offset by massive code reuse and maintainability benefits.

## Conclusion

While chain-based architecture provides clear chain boundaries, product-based architecture with multichain support provides:
- Better code reuse
- Easier maintenance
- Better scalability
- Unified product view
- Proper use of Envio features

**Recommendation**: Adopt **Product-Based Architecture** with multichain support.

