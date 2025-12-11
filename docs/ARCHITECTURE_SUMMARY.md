# Architecture Proposal Summary
## Product-Based with Multichain Support

## Executive Summary

After reconsidering the architecture and exploring all possible Envio setups, we propose a **product/feature-based architecture** that leverages Envio's multichain support. Instead of splitting by chain, we group similar products together across all chains, maximizing code reuse and providing a unified view of products.

## Key Decision: Product-Based vs Chain-Based

### ❌ Chain-Based (Original Proposal)
- Separate indexer per chain
- Code duplicated across chains
- Hard to maintain (fix bug N times)
- Doesn't leverage multichain support

### ✅ Product-Based (Revised Proposal)
- Separate indexer per product/feature
- Single codebase for all chains
- Easy to maintain (fix once, applies everywhere)
- Fully leverages Envio multichain support

## Proposed Indexers (10-12 Total)

1. **oToken** - All OTokens (OETH, OUSD, OS, superOETHb) across all chains
2. **strategies** - All strategy tracking across all chains
3. **governance** - All governance (OGV, OGN) on mainnet
4. **staking** - All staking (OGV, ES, Native, Legacy) on mainnet
5. **arm** - ARM pools on mainnet and sonic
6. **pools** - All pools (Curve, Aerodrome, Generic) across chains
7. **erc20** - All ERC20 tokens across all chains
8. **bridges** - Cross-chain bridges (mainnet, arbitrum)
9. **exchange-rates** - Price data across all chains (already exists)
10. **protocol-stats** - Protocol aggregations (queries other indexers)
11. **mainnet-misc** - Mainnet-specific features
12. **sonic-misc** - Sonic-specific features (optional)

## Core Benefits

### 1. Code Reuse: 70%+ vs 30%
- Single OToken handler for all OTokens (OETH, OUSD, OS, superOETHb)
- Shared modules reduce duplication
- Consistent implementations

### 2. Unified View
- Query all OTokens in one GraphQL endpoint
- Compare OETH (mainnet) vs OETHB (base) easily
- Cross-chain analytics simplified

### 3. Easy Maintenance
- Fix bug once, applies to all chains
- Add new chain: just update config.yaml
- Clear product boundaries

### 4. Leverages Envio
- Uses `networks` array properly
- `unordered_multichain_mode: true` for cross-chain
- Single indexer processes multiple chains

### 5. Better Scalability
- Add chain = config update (not new indexer)
- Constant complexity (not linear)
- Easy to extend

## Architecture Structure

```
envio/
├── src/
│   ├── indexers/          # 10-12 product-based indexers
│   │   ├── oToken/      # All OTokens (multichain)
│   │   ├── strategies/    # All strategies (multichain)
│   │   ├── governance/    # All governance
│   │   ├── staking/       # All staking
│   │   ├── arm/           # ARM pools (multichain)
│   │   ├── pools/         # All pools (multichain)
│   │   ├── erc20/         # All ERC20 (multichain)
│   │   ├── bridges/       # Cross-chain bridges
│   │   ├── exchange-rates/# Price data (multichain)
│   │   ├── protocol-stats/# Aggregations
│   │   ├── mainnet-misc/  # Mainnet-specific
│   │   └── sonic-misc/     # Sonic-specific
│   │
│   ├── shared/            # Shared across all indexers
│   │   ├── constants/     # Config data
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   ├── modules/       # Business logic modules
│   │   ├── effects/        # Envio effects
│   │   ├── abis/          # Contract ABIs
│   │   └── schemas/        # GraphQL fragments
│   │
│   └── tooling/           # Dev tools
│
└── docs/                  # Documentation
```

## Multichain Configuration Example

```yaml
# oToken/config.yaml
name: oToken
networks:
  - id: 1              # Mainnet
    contracts:
      - name: OETH
        address: '0x...'
      - name: OUSD
        address: '0x...'
  - id: 8453           # Base
    contracts:
      - name: OETHB
        address: '0x...'
  - id: 146             # Sonic
    contracts:
      - name: OS
        address: '0x...'
unordered_multichain_mode: true
preload_handlers: true
```

## Handler Pattern (Chain-Agnostic)

```typescript
OETH.Transfer.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const tokenAddress = event.srcAddress.toLowerCase();
  
  // Works for all OToken contracts across all chains
  const entityId = `${chainId}:${tokenAddress}:${event.params.from}`;
  
  context.OTokenAddress.set({
    id: entityId,
    chainId: chainId,
    otoken: tokenAddress,
    // ...
  });
});
```

## Entity ID Strategy

**Always include chain ID:**

```typescript
// ✅ CORRECT
const entityId = `${chainId}:${address}:${account}`;

// ❌ WRONG (collision risk)
const entityId = `${address}:${account}`;
```

## Comparison Summary

| Aspect | Chain-Based | Product-Based |
|--------|-------------|---------------|
| **Indexers** | 9+ | 10-12 |
| **Code Reuse** | ~30% | ~70%+ |
| **Adding Chain** | Create new indexer | Update config |
| **Bug Fixes** | Fix N times | Fix once |
| **Querying** | Multiple endpoints | Single endpoint |
| **Multichain** | Not leveraged | Fully leveraged |
| **Maintenance** | High | Low |

## Migration Strategy

### Phase 1: Reorganize (Week 1-2)
- Create product-based structure
- Move existing code
- Set up shared code

### Phase 2: Create Product Indexers (Week 3-8)
- **oToken**: Combine all OTokens
- **strategies**: Extract from OETH/OUSD
- **governance**: Combine OGV and OGN
- **staking**: Combine all staking
- **arm**: Combine mainnet and sonic
- **pools**: Combine all pools
- **erc20**: Extract from all
- **bridges**: Combine mainnet and arbitrum

### Phase 3: Complex Features (Week 9-12)
- **protocol-stats**: Aggregation indexer
- **mainnet-misc**: Extract miscellaneous
- Test each indexer

### Phase 4: Optimize (Week 13+)
- Performance tuning
- Effect optimization
- Documentation

## Success Criteria

- ✅ All products migrated to product-based indexers
- ✅ Multichain support fully leveraged
- ✅ Code reuse > 70%
- ✅ Single GraphQL endpoint per product (all chains)
- ✅ Easy to add new chains (config update)
- ✅ Performance matches or exceeds current system

## Key Principles

1. **Product-Based**: Group by product/feature, not chain
2. **Multichain**: Use `networks` array in config.yaml
3. **Chain ID in IDs**: Always include chain ID in entity IDs
4. **Shared Code**: Use shared modules/utils for common logic
5. **Chain-Agnostic**: Handlers work for all chains
6. **Effects for External**: Use effects for external calls

## Documentation

- **ARCHITECTURE_PROPOSAL.md**: Detailed proposal
- **ARCHITECTURE_COMPARISON.md**: Chain-based vs product-based comparison
- **ARCHITECTURE_QUICK_REFERENCE.md**: Quick reference guide
- **ARCHITECTURE_SUMMARY.md**: This document

## Recommendation

**Adopt Product-Based Architecture** because:

1. ✅ **70%+ code reuse** (vs 30% chain-based)
2. ✅ **Leverages Envio multichain** properly
3. ✅ **Unified view** of products across chains
4. ✅ **Easier maintenance** (fix once, applies everywhere)
5. ✅ **Better scalability** (add chain = config update)
6. ✅ **Better developer experience** (clear product boundaries)
7. ✅ **Simpler queries** (single endpoint per product)
8. ✅ **Easier cross-chain analytics** (same indexer)

The only trade-off is slightly more complex multichain configuration, but this is offset by massive code reuse and maintainability benefits.

## Next Steps

1. **Review and approve** this architecture proposal
2. **Create detailed migration plan** with timelines
3. **Set up folder structure** and move existing code
4. **Create shared modules** for common patterns
5. **Document shared code** with examples
6. **Create templates** for new indexers
7. **Set up tooling** scripts for common tasks
8. **Begin migration** with oToken indexer

## Conclusion

This product-based architecture with multichain support provides the best balance of:
- **Code reuse** (70%+)
- **Maintainability** (fix once, applies everywhere)
- **Scalability** (add chain = config update)
- **Developer experience** (clear product boundaries)
- **Performance** (leverages Envio multichain)

It properly leverages Envio's multichain capabilities while providing a clear, maintainable structure for a multi-chain, multi-product indexing system.

