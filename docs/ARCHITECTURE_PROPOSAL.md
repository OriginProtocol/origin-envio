# Envio Indexer Architecture Proposal
## Product/Feature-Based with Multichain Support

## Executive Summary

This document proposes a **product/feature-based modular architecture** for the Origin Protocol Envio indexer system. Instead of splitting by chain, we leverage Envio's multichain support to group similar products and features together across all chains. This approach maximizes code reuse, simplifies maintenance, and provides a unified view of similar products across different networks.

## Core Design Principles

### 1. **Product/Feature-Based Grouping**
- Group by **product type** (OTokens, Governance, Staking) not by chain
- Each product indexer handles **all chains** where that product exists
- Example: OTokens indexer handles OETH (mainnet), OUSD (mainnet), OS (sonic), superOETHb (base)

### 2. **Multichain Support**
- Use Envio's `networks` array in `config.yaml` to support multiple chains
- Use `unordered_multichain_mode: true` for cross-chain dependencies
- Single indexer processes events from multiple chains
- Chain ID included in entity IDs to prevent collisions

### 3. **Shared Code Organization**
- Common utilities, constants, types, and ABIs shared across all indexers
- Organized by concern (not by indexer or chain)
- Clear import paths for discoverability

### 4. **Skill-Level Support**
- **Beginner-friendly**: Clear structure, examples, templates
- **Intermediate**: Reusable modules and utilities
- **Advanced**: Custom effects, optimizations, post-processing

## Architecture Comparison

### ❌ Previous Approach (Chain-Based)
```
indexers/
├── mainnet/     # All mainnet products
├── base/        # All base products
├── arbitrum/    # All arbitrum products
└── ...
```
**Problems**: Code duplication, harder to maintain, doesn't leverage multichain

### ✅ New Approach (Product-Based)
```
indexers/
├── oToken/    # All OTokens across all chains
├── governance/  # All governance across all chains
├── staking/     # All staking across all chains
└── ...
```
**Benefits**: Code reuse, unified view, leverages multichain properly

## Proposed Indexer Structure

Based on the requirements, we propose **10-12 logical indexers** instead of 9 chain-based ones:

### 1. **oToken** - All OToken Products
**Purpose**: Index all OToken products (OETH, OUSD, OS, superOETHb) across all chains

**Chains**: Mainnet (OETH, OUSD), Base (superOETHb), Sonic (OS)

**Entities**:
- `OToken`, `OTokenAddress`, `OTokenHistory`, `OTokenRebase`, `OTokenAPY`
- `OTokenDailyStat`, `OTokenVault`, `OTokenActivity`, `OTokenDripperState`
- `OTokenWithdrawalRequest`, `WOToken`

**Key Features**:
- Rebase tracking
- Supply calculations
- Holder balances
- Withdrawal queues
- APY calculations

**Why Together**: All OTokens share the same logic (rebase, supply, withdrawals)

### 2. **strategies** - All Strategy Tracking
**Purpose**: Index strategy balances and yields across all chains

**Chains**: Mainnet, Base, Sonic

**Entities**:
- `StrategyBalance`, `StrategyYield`, `StrategyDailyYield`

**Key Features**:
- Strategy asset balances
- Yield calculations
- Daily aggregations

**Why Together**: Strategy logic is identical across chains

### 3. **governance** - All Governance
**Purpose**: Index governance proposals and votes

**Chains**: Mainnet (OGV Governance, OGN Governance)

**Entities**:
- `GovernanceProposal`, `GovernanceProposalVote`, `GovernanceProposalEvent`
- `OGVProposal`, `OGVProposalVote`, `OGVProposalTxLog`
- `OGVAddress`

**Key Features**:
- Proposal tracking
- Vote tracking
- Voting power calculations

**Why Together**: Governance logic is similar, can share modules

### 4. **staking** - All Staking Products
**Purpose**: Index all staking mechanisms

**Chains**: Mainnet

**Entities**:
- `OGVLockup`, `OGVLockupTxLog`
- `ESLockup`, `ESLockupEvent`, `ESAccount`, `ESToken`, `ESYield`
- `ESDelegateChanged`, `ESDelegateVotesChanged`, `ESPenalty`, `ESReward`, `ESStake`, `ESUnstake`
- `LegacyStaker`
- `BeaconDepositEvent`, `BeaconDepositPubkey`
- `AccountingConsensusRewards`, `ExecutionRewardsCollected`

**Key Features**:
- Lockup tracking
- Voting power calculations
- Delegation
- Rewards and penalties

**Why Together**: Staking logic shares common patterns

### 5. **arm** - ARM Pools
**Purpose**: Index Automated Reserve Management pools

**Chains**: Mainnet, Sonic

**Entities**:
- `Arm`, `ArmState`, `ArmDailyStat`, `ArmWithdrawalRequest`, `ArmSwap`, `TraderateChanged`

**Key Features**:
- Pool state tracking
- Daily statistics
- Withdrawal requests
- Swap events

**Why Together**: ARM logic is identical across chains

### 6. **pools** - All Pool Types
**Purpose**: Index all pool types (Curve, Aerodrome, Generic)

**Chains**: Mainnet (Curve), Base (Aerodrome), Sonic (Generic, Pool Booster)

**Entities**:
- `Pool`, `CurvePool`, `CurvePoolBalance`, `CurvePoolRate`
- `AeroPoolState`, `AeroCLPoolState`, `AeroCLPoolTick`, `AeroPoolEpochState`
- `AeroLP`, `AeroLPPosition`, `AeroGaugeNotifyReward`, `AeroCLGaugeNotifyReward`
- `AeroPoolCreated`, `AeroCLPoolCreated`, `AeroVoterGaugeCreated`
- `PoolBooster`, `PoolBoosterBribeExecuted`

**Key Features**:
- Pool state tracking
- Balance tracking
- LP positions
- Gauge rewards

**Why Together**: Pool logic can share utilities, different pool types in same indexer

### 7. **erc20** - All ERC20 Tokens
**Purpose**: Index all ERC20 tokens across all chains

**Chains**: All chains

**Entities**:
- `ERC20`, `ERC20State`, `ERC20Balance`, `ERC20Transfer`, `ERC20Holder`

**Key Features**:
- Token metadata
- Transfer tracking
- Balance snapshots
- Holder tracking

**Why Together**: ERC20 logic is identical across all chains

### 8. **bridges** - Cross-Chain Bridges
**Purpose**: Index cross-chain bridge transfers

**Chains**: Mainnet, Arbitrum (CCIP)

**Entities**:
- `BridgeTransfer`, `BridgeTransferState`

**Key Features**:
- Transfer tracking
- State updates
- Cross-chain monitoring

**Why Together**: Bridge logic is identical across chains

### 9. **exchange-rates** - Price Data
**Purpose**: Index exchange rates and price data

**Chains**: All chains

**Entities**:
- `ExchangeRate`, `CoinGeckoCoinData`

**Key Features**:
- Price tracking
- External price integration
- Historical price data

**Why Together**: Price logic is identical, already implemented as multichain

### 10. **protocol-stats** - Protocol Aggregations
**Purpose**: Calculate protocol-level statistics and aggregations

**Chains**: All chains (aggregates from other indexers)

**Entities**:
- `ProtocolDailyStat`, `ProtocolDailyStatDetail`
- `OGNDailyStat`, `OGVDailyStat`
- `ProcessingStatus`

**Key Features**:
- Daily statistics aggregation
- Protocol TVL calculations
- Revenue and yield tracking

**Why Together**: Aggregation logic is unified

### 11. **mainnet-misc** - Mainnet Miscellaneous
**Purpose**: Index mainnet-specific miscellaneous features

**Chains**: Mainnet only

**Entities**:
- `OGNBuyback`
- `MorphoMarketState`
- `TransactionDetails`
- `WalletLabels`
- `NativeBalance`
- `FRRSRewardCollected`, `FRRSRewardsPerSecondChanged`, `FRRSRewardsTargetChange`, `FRRSStrategistUpdated`

**Key Features**:
- OGN buyback tracking
- Morpho market states
- Transaction metadata
- Address labeling

**Why Together**: Mainnet-specific features that don't fit other categories

### 12. **sonic-misc** - Sonic Miscellaneous (Optional)
**Purpose**: Index Sonic-specific features

**Chains**: Sonic only

**Entities**:
- `SFCWithdrawal`
- Other Sonic-specific entities

**Why Together**: Sonic-specific features

## Folder Structure

```
envio/
├── src/
│   ├── indexers/                    # Product/feature-based indexers
│   │   ├── oToken/                # All OTokens (OETH, OUSD, OS, superOETHb)
│   │   │   ├── config.yaml          # Multichain config (mainnet, base, sonic)
│   │   │   ├── schema.graphql       # OToken entities
│   │   │   ├── EventHandlers.ts     # Main entry point
│   │   │   ├── handlers/             # Organized handlers
│   │   │   │   ├── rebase.ts        # Rebase logic
│   │   │   │   ├── supply.ts        # Supply tracking
│   │   │   │   ├── withdrawals.ts   # Withdrawal queue
│   │   │   │   └── apy.ts           # APY calculations
│   │   │   └── README.md
│   │   │
│   │   ├── strategies/               # All strategies across chains
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   ├── governance/               # All governance (OGV, OGN)
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   ├── staking/                  # All staking (OGV, ES, Native, Legacy)
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   ├── arm/                      # ARM pools (mainnet, sonic)
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   ├── pools/                    # All pools (Curve, Aerodrome, Generic)
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   ├── erc20/                    # All ERC20 tokens
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   ├── bridges/                  # Cross-chain bridges
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   ├── exchange-rates/           # Price data (already exists)
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   ├── protocol-stats/           # Protocol aggregations
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   ├── mainnet-misc/             # Mainnet miscellaneous
│   │   │   ├── config.yaml
│   │   │   ├── schema.graphql
│   │   │   ├── EventHandlers.ts
│   │   │   └── handlers/
│   │   │
│   │   └── sonic-misc/               # Sonic miscellaneous (optional)
│   │       ├── config.yaml
│   │       ├── schema.graphql
│   │       ├── EventHandlers.ts
│   │       └── handlers/
│   │
│   ├── shared/                       # Shared code across all indexers
│   │   ├── constants/                # Shared constants
│   │   │   ├── chains.ts             # Chain configurations
│   │   │   ├── tokens.ts             # Token definitions (existing)
│   │   │   ├── addresses.ts          # Contract addresses by chain
│   │   │   ├── block-numbers.ts      # Start blocks, upgrade blocks
│   │   │   └── index.ts
│   │   │
│   │   ├── types/                    # Shared TypeScript types
│   │   │   ├── entities.ts           # Common entity types
│   │   │   ├── events.ts             # Event parameter types
│   │   │   ├── chains.ts             # Chain ID types
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                    # Shared utilities
│   │   │   ├── tokens/               # Token utilities
│   │   │   │   ├── getToken.ts       # (existing)
│   │   │   │   ├── normalize.ts      # Decimal normalization
│   │   │   │   └── index.ts
│   │   │   ├── math/                 # Math utilities
│   │   │   │   ├── apy.ts            # APY calculations
│   │   │   │   ├── apr.ts            # APR calculations
│   │   │   │   ├── bigint.ts         # BigInt helpers
│   │   │   │   └── index.ts
│   │   │   ├── time/                 # Time utilities
│   │   │   │   ├── dates.ts          # Date formatting, daily buckets
│   │   │   │   ├── timestamps.ts     # Timestamp conversions
│   │   │   │   └── index.ts
│   │   │   ├── ids/                  # ID generation utilities
│   │   │   │   ├── composite.ts      # Composite ID generation
│   │   │   │   └── index.ts
│   │   │   ├── validation/           # Validation utilities
│   │   │   │   ├── addresses.ts      # Address validation
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── effects/                  # Shared Envio effects
│   │   │   ├── prices.ts             # Price fetching effects
│   │   │   ├── external.ts           # External API calls
│   │   │   └── index.ts
│   │   │
│   │   ├── modules/                  # Reusable handler modules
│   │   │   ├── oToken/              # OToken common logic
│   │   │   │   ├── rebase.ts         # Rebase calculations
│   │   │   │   ├── supply.ts         # Supply tracking
│   │   │   │   ├── withdrawals.ts    # Withdrawal queue
│   │   │   │   └── index.ts
│   │   │   ├── erc20/                # ERC20 common logic
│   │   │   │   ├── transfers.ts      # Transfer handling
│   │   │   │   ├── balances.ts        # Balance tracking
│   │   │   │   └── index.ts
│   │   │   ├── governance/           # Governance common logic
│   │   │   │   ├── proposals.ts      # Proposal handling
│   │   │   │   ├── votes.ts           # Vote handling
│   │   │   │   └── index.ts
│   │   │   ├── staking/               # Staking common logic
│   │   │   │   ├── lockups.ts         # Lockup handling
│   │   │   │   ├── voting-power.ts   # Voting power calculations
│   │   │   │   └── index.ts
│   │   │   ├── strategies/           # Strategy common logic
│   │   │   │   ├── balances.ts       # Strategy balance tracking
│   │   │   │   ├── yields.ts         # Yield calculations
│   │   │   │   └── index.ts
│   │   │   └── pools/                # Pool common logic
│   │   │       ├── curve.ts          # Curve pool utilities
│   │   │       ├── aerodrome.ts      # Aerodrome utilities
│   │   │       └── index.ts
│   │   │
│   │   ├── abis/                     # Shared ABIs (existing)
│   │   │   ├── ERC20.json
│   │   │   ├── OCR2Aggregator.json
│   │   │   └── ...
│   │   │
│   │   └── schemas/                  # Shared schema fragments
│   │       ├── common.types.graphql   # Common GraphQL types
│   │       └── directives.graphql    # Custom directives (if any)
│   │
│   └── tooling/                      # Development tooling
│       ├── scripts/                  # Utility scripts
│       │   ├── codegen-all.ts        # Generate all indexers
│       │   ├── validate-config.ts    # Validate config.yaml files
│       │   ├── check-schemas.ts      # Validate schemas
│       │   └── migrate-data.ts       # Data migration utilities
│       ├── templates/                # Code templates
│       │   ├── indexer-template/     # New indexer template
│       │   │   ├── config.yaml
│       │   │   ├── schema.graphql
│       │   │   └── EventHandlers.ts
│       │   └── handler-template.ts   # Handler template
│       └── docs/                     # Documentation helpers
│           ├── api-examples.md       # GraphQL query examples
│           └── migration-guide.md    # Migration patterns
│
├── docs/                             # Project documentation
│   ├── ARCHITECTURE_PROPOSAL.md      # This file
│   ├── GETTING_STARTED.md             # Quick start guide
│   ├── DEVELOPER_GUIDE.md            # Developer workflow
│   ├── MODULE_GUIDE.md               # Module usage guide
│   └── DEPLOYMENT.md                 # Deployment guide
│
├── package.json
├── tsconfig.json                      # Root TypeScript config
├── tsconfig.base.json                 # Base config for indexers
└── README.md
```

## Multichain Configuration Example

### OTokens Indexer Config

```yaml
# yaml-language-server: $schema=../../node_modules/envio/evm.schema.json
name: oToken
networks:
  - id: 1  # Mainnet
    start_block: 11590995  # OUSD Reset
    contracts:
      - name: OETH
        address: '0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3'
        abi_file_path: ../../shared/abis/OETH.json
        handler: ./EventHandlers.ts
        events:
          - event: Transfer(address indexed from, address indexed to, uint256 value)
          - event: Rebase(uint256 indexed epoch, uint256 totalSupply, uint256 rebasingSupply, uint256 nonRebasingSupply)
      - name: OUSD
        address: '0x2a8e1e676ec238d8a992307b495b45b3feaa5e86'
        abi_file_path: ../../shared/abis/OUSD.json
        handler: ./EventHandlers.ts
        events:
          - event: Transfer(address indexed from, address indexed to, uint256 value)
          - event: Rebase(uint256 indexed epoch, uint256 totalSupply, uint256 rebasingSupply, uint256 nonRebasingSupply)
  
  - id: 8453  # Base
    start_block: 12000000
    contracts:
      - name: superOETHb
        address: '0xdbfefd2e8460a6ee4955a68582f85708baea60a3'
        abi_file_path: ../../shared/abis/OETH.json
        handler: ./EventHandlers.ts
        events:
          - event: Transfer(address indexed from, address indexed to, uint256 value)
          - event: Rebase(uint256 indexed epoch, uint256 totalSupply, uint256 rebasingSupply, uint256 nonRebasingSupply)
  
  - id: 146  # Sonic
    start_block: 12000000
    contracts:
      - name: OS
        address: '0xb1e25689d55734fd3fffc939c4c3eb52dff8a794'
        abi_file_path: ../../shared/abis/OETH.json
        handler: ./EventHandlers.ts
        events:
          - event: Transfer(address indexed from, address indexed to, uint256 value)
          - event: Rebase(uint256 indexed epoch, uint256 totalSupply, uint256 rebasingSupply, uint256 nonRebasingSupply)
  
unordered_multichain_mode: true
preload_handlers: true
```

### Handler Example (Chain-Agnostic)

```typescript
import { getToken } from '../../shared/utils/tokens';
import { generateOTokenId } from '../../shared/utils/ids';
import { calculateRebase } from '../../shared/modules/oToken';
import { OETH } from './generated';

// Handler works for all OToken contracts across all chains
OETH.Transfer.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const tokenAddress = event.srcAddress.toLowerCase();
  
  // Determine which OToken this is based on address
  const token = getToken(tokenAddress, chainId);
  if (!token || !['OETH', 'OUSD', 'OS', 'superOETHb'].includes(token.symbol)) {
    return;
  }

  // Generate chain-specific entity ID
  const entityId = generateOTokenId(chainId, tokenAddress, event.params.from);
  
  // Use shared module for OToken logic
  const oToken = await context.OToken.get(entityId);
  // ... handler logic using shared modules
});

OETH.Rebase.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const tokenAddress = event.srcAddress.toLowerCase();
  
  // Use shared rebase calculation module
  const rebaseData = calculateRebase(
    event.params.totalSupply,
    event.params.rebasingSupply,
    event.params.nonRebasingSupply
  );
  
  // Create entity with chain ID in ID
  const rebaseId = `${chainId}:${event.block.number}:${event.logIndex}`;
  context.OTokenRebase.set({
    id: rebaseId,
    chainId: chainId,
    otoken: tokenAddress,
    // ... other fields
  });
});
```

## Benefits of This Architecture

### 1. **Code Reuse**
- ✅ Single handler logic for all OTokens across all chains
- ✅ Shared modules reduce duplication by 70%+
- ✅ Consistent patterns across similar products

### 2. **Unified View**
- ✅ Query all OTokens in one GraphQL endpoint
- ✅ Compare OETH (mainnet) vs superOETHb (base) easily
- ✅ Cross-chain analytics simplified

### 3. **Maintainability**
- ✅ Fix bug once, applies to all chains
- ✅ Add new chain: just add to networks array
- ✅ Clear product boundaries

### 4. **Performance**
- ✅ Fewer indexers to manage (12 vs 9+)
- ✅ Shared code reduces bundle size
- ✅ Multichain processing optimized by Envio

### 5. **Developer Experience**
- ✅ Clear product-based structure
- ✅ Easy to find relevant code
- ✅ Add new chain: update config, not code

## Comparison: Chain-Based vs Product-Based

| Aspect | Chain-Based | Product-Based |
|--------|-------------|---------------|
| **Indexers** | 9+ (one per chain) | 10-12 (one per product) |
| **Code Reuse** | Low (duplicate per chain) | High (shared across chains) |
| **Maintenance** | Fix bug N times | Fix bug once |
| **Adding Chain** | Create new indexer | Add to networks array |
| **Querying** | Multiple endpoints | Single endpoint per product |
| **Cross-Chain Analytics** | Complex (join across indexers) | Simple (same indexer) |
| **Multichain Support** | Not leveraged | Fully leveraged |

## Migration Strategy

### Phase 1: Reorganize (Week 1-2)
1. Create new product-based folder structure
2. Move existing indexers (`prices/` → `exchange-rates/`)
3. Move shared code to `shared/`
4. Update imports

### Phase 2: Create Product Indexers (Week 3-8)
1. **oToken**: Combine OETH, OUSD, OS, superOETHb
2. **strategies**: Extract from OETH/OUSD indexers
3. **governance**: Combine OGV and OGN governance
4. **staking**: Combine all staking mechanisms
5. **arm**: Combine mainnet and sonic ARM
6. **pools**: Combine Curve, Aerodrome, Generic pools
7. **erc20**: Extract from all indexers
8. **bridges**: Combine mainnet and arbitrum bridges

### Phase 3: Migrate Complex Features (Week 9-12)
1. **protocol-stats**: Create aggregation indexer
2. **mainnet-misc**: Extract miscellaneous features
3. Test each indexer independently

### Phase 4: Optimize (Week 13+)
1. Performance tuning
2. Effect optimization
3. Documentation improvements

## Entity ID Strategy

### Chain ID in Entity IDs

All entities must include chain ID to prevent collisions:

```typescript
// ✅ CORRECT - Chain ID in entity ID
const entityId = `${chainId}:${address}:${account}`;
const rebaseId = `${chainId}:${blockNumber}:${logIndex}`;

// ❌ WRONG - No chain ID (collision risk)
const entityId = `${address}:${account}`;
```

### ID Generation Utilities

```typescript
// shared/utils/ids/composite.ts
export function generateOTokenId(
  chainId: number,
  tokenAddress: string,
  account: string
): string {
  return `${chainId}:${tokenAddress.toLowerCase()}:${account.toLowerCase()}`;
}

export function generateRebaseId(
  chainId: number,
  blockNumber: number,
  logIndex: number
): string {
  return `${chainId}:${blockNumber}:${logIndex}`;
}
```

## Cross-Indexer Communication

### Using Effects to Query Other Indexers

```typescript
// shared/effects/prices.ts
export const getOTokenPrice = createEffect(
  {
    name: 'getOTokenPrice',
    input: {
      chainId: S.number,
      tokenAddress: S.string,
      blockNumber: S.number,
    },
    output: S.union([S.number, null]),
    cache: true,
  },
  async ({ input }) => {
    // Query exchange-rates indexer via GraphQL
    const response = await fetch('http://localhost:8080/v1/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetPrice($chainId: Int!, $tokenAddress: String!, $blockNumber: Int!) {
            ExchangeRate(
              where: { chainId: { eq: $chainId }, token: { eq: $tokenAddress } }
              orderBy: blockNumber_DESC
              limit: 1
            ) {
              price
            }
          }
        `,
        variables: input,
      }),
    });
    // ... parse and return
  }
);
```

## Post-Processing Strategy

### Option 1: Separate Post-Processor Indexers (Recommended)
- **protocol-stats**: Aggregates data from other indexers
- Uses effects to query primary indexers
- Calculates daily stats, protocol TVL, etc.

### Option 2: In-Indexer Post-Processing
- Use effects to query own data
- Run aggregations in handlers
- Use `!context.isPreload` to avoid double-processing

**Recommendation**: Option 1 for clarity and separation

## Package.json Scripts

```json
{
  "scripts": {
    // Product indexer commands
    "oToken:codegen": "envio codegen -d src/indexers/oToken",
    "oToken:dev": "envio dev -d src/indexers/oToken",
    "oToken:start": "envio start -d src/indexers/oToken",
    
    "strategies:codegen": "envio codegen -d src/indexers/strategies",
    "strategies:dev": "envio dev -d src/indexers/strategies",
    
    // ... similar for all indexers
    
    // Batch operations
    "codegen:all": "node src/tooling/scripts/codegen-all.ts",
    "validate:all": "node src/tooling/scripts/validate-config.ts",
    
    // Type checking
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch"
  }
}
```

## Success Criteria

- ✅ All products migrated to product-based indexers
- ✅ Multichain support fully leveraged
- ✅ Code reuse > 70% (vs chain-based approach)
- ✅ Single GraphQL endpoint per product (all chains)
- ✅ Clear product boundaries
- ✅ Easy to add new chains (just config update)
- ✅ Performance matches or exceeds current system

## Open Questions

1. **Post-processing**: Separate indexer or in-indexer?
   - **Recommendation**: Separate `protocol-stats` indexer

2. **ERC20 indexer**: Separate or part of each product?
   - **Recommendation**: Separate `erc20` indexer for all tokens

3. **Miscellaneous features**: One indexer or split?
   - **Recommendation**: `mainnet-misc` and `sonic-misc` for chain-specific features

4. **Deployment**: One deployment or separate per indexer?
   - **Recommendation**: Separate deployments for flexibility

## Conclusion

This product-based architecture with multichain support provides:
- **Better code reuse**: Single logic for all chains
- **Unified view**: All products of same type in one place
- **Easier maintenance**: Fix once, applies everywhere
- **Leverages Envio**: Uses multichain support properly
- **Clear structure**: Product-based organization
- **Scalable**: Easy to add new chains or products

This approach is more aligned with Envio's multichain capabilities and provides a better foundation for a multi-chain, multi-product indexing system.

