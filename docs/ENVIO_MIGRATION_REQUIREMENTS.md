# Origin Protocol Squid → Envio Migration Requirements

## Executive Summary

This document outlines the requirements for migrating the Origin Protocol Squid indexing system from Subsquid to Envio. The current system indexes blockchain data across 5 chains (Ethereum Mainnet, Arbitrum, Base, Sonic, and OS) for multiple Origin Protocol products (OETH, OUSD, OGV, OS, superOETHb).

## Current Architecture Overview

### Technology Stack
- **Framework**: Subsquid (EVM Batch Processor)
- **Database**: PostgreSQL with TypeORM
- **GraphQL API**: Auto-generated from GraphQL schema files
- **Language**: TypeScript
- **Deployment**: Subsquid Cloud

### Processing Architecture
- **9 Separate Processors**: Each chain/product combination has its own processor
- **State Schemas**: Separate database schemas per processor
- **Post-Processors**: Calculate derived metrics (exchange rates, daily stats, protocol stats)
- **Batch Processing**: Processes blocks in batches for efficiency

## Processors Breakdown

### 1. Mainnet Processor (`mainnet-processor`)
**Purpose**: Indexes Ethereum mainnet data for various Origin Protocol features

**Components**:
- **Exchange Rates**: Tracks token prices (ETH/USD, OGN/USD, etc.)
- **OGN Buybacks**: Tracks OGN token buyback events
- **Native Staking**: Tracks native ETH staking deposits and rewards
- **Legacy Staking**: Tracks legacy staking contracts
- **Curve Pools**: Monitors Curve pool states and balances
- **CCIP**: Cross-chain bridge transfers
- **ERC20 Tokens**: Tracks multiple ERC20 tokens (OGN, OGV, WETH, stETH, wstETH, rETH, frxETH, sfrxETH, primeETH, etc.)
- **Governance**: 
  - OGV Governance (from block 15491391)
  - OGN Governance (from block 20117923)
- **Exponential Staking (xOGN)**: Tracks staking, unstaking, delegation, rewards, penalties
- **Fixed Rate Rewards Source**: Tracks reward collection and rate changes
- **CoinGecko**: External price data integration
- **Origin ARM**: Automated Reserve Management pools
- **Transaction Processor**: Tracks specific transactions (e.g., Defender Relayer)
- **Pools**: Generic pool tracking
- **Notion**: External data integration

**Post-Processors**:
- Exchange rates calculation
- Daily stats aggregation
- Protocol statistics
- Processing status tracking

**Key Entities**:
- `OGNDailyStat`, `OGVDailyStat`
- `ProtocolDailyStat`, `ProtocolDailyStatDetail`
- `OGNBuyback`
- `BeaconDepositEvent`, `BeaconDepositPubkey`
- `AccountingConsensusRewards`, `ExecutionRewardsCollected`
- `CurvePool`, `CurvePoolBalance`, `CurvePoolRate`
- `LegacyStaker`
- `NativeBalance`
- `WalletLabels`
- `ExchangeRate`
- `GovernanceProposal`, `GovernanceProposalVote`, `GovernanceProposalEvent`
- `ESToken`, `ESAccount`, `ESLockup`, `ESLockupEvent`
- `ESDelegateChanged`, `ESDelegateVotesChanged`, `ESPenalty`, `ESReward`, `ESStake`, `ESUnstake`
- `FRRSRewardCollected`, `FRRSRewardsPerSecondChanged`, `FRRSRewardsTargetChange`, `FRRSStrategistUpdated`
- `Arm`, `ArmState`, `ArmDailyStat`, `ArmWithdrawalRequest`, `ArmSwap`, `TraderateChanged`
- `CoinGeckoCoinData`
- `BridgeTransfer`, `BridgeTransferState`
- `TransactionDetails`

### 2. OETH Processor (`oeth-processor`)
**Purpose**: Indexes OETH (Origin Ether) token data on Ethereum mainnet

**Components**:
- **OETH Token**: Main token processor tracking supply, rebases, holder balances
- **Strategies**: Tracks yield strategies and their balances
- **Exchange Rates**: Token price tracking
- **Withdrawals**: Withdrawal request tracking

**Key Features**:
- Tracks rebasing and non-rebasing supply
- Monitors wrapped OETH (wOETH)
- Tracks dripper contracts (multiple versions)
- Monitors vault buffer and total value
- Tracks strategy balances and yields
- Records withdrawal requests and claims

**Key Entities**:
- `OToken`, `OTokenAddress`, `OTokenHistory`, `OTokenRebase`, `OTokenAPY`
- `OTokenDailyStat`, `OTokenVault`, `OTokenActivity`, `OTokenDripperState`
- `OTokenWithdrawalRequest`, `OTokenHarvesterYieldSent`, `OTokenRewardTokenCollected`, `OTokenYieldForwarded`
- `WOToken`
- `StrategyBalance`, `StrategyYield`, `StrategyDailyYield`

**Start Block**: 17076206 (OETH contract initialize)

### 3. OUSD Processor (`ousd-processor`)
**Purpose**: Indexes OUSD (Origin Dollar) stablecoin data on Ethereum mainnet

**Components**:
- **OUSD Token**: Main token processor
- **Strategies**: Yield strategy tracking
- **Curve Pool**: OUSD/3CRV pool monitoring
- **Morpho Markets**: Morpho lending market states
- **ERC20s**: Related token tracking

**Key Features**:
- Similar to OETH but for stablecoin
- Tracks rebasing supply
- Monitors strategy allocations
- Tracks Curve pool interactions

**Key Entities**: Same as OETH plus:
- `MorphoMarketState`

**Start Block**: 11590995 (OUSD Reset)

### 4. OGV Processor (`ogv-processor`)
**Purpose**: Indexes OGV (Origin Governance Token) and veOGV (vote-escrowed OGV) data

**Components**:
- **OGV Supply**: Token supply tracking
- **OGV Token**: Transfer and balance tracking
- **veOGV**: Staking, unstaking, delegation, voting power

**Key Features**:
- Tracks lockups (stake/unstake/extend)
- Monitors voting power and delegation
- Tracks governance proposals and votes
- Calculates daily statistics

**Key Entities**:
- `OGV`, `OGVAddress`
- `OGVLockup`, `OGVLockupTxLog`
- `OGVProposal`, `OGVProposalVote`, `OGVProposalTxLog`
- `OGVDailyStat`

**Start Blocks**:
- OGV: 14439231
- veOGV: 15089597

**Post-Processors**:
- Governance proposal processing
- Daily stats calculation

### 5. Base Processor (`base-processor`)
**Purpose**: Indexes Base chain data

**Components**:
- **ERC20s**: OGN, wsupersuperOETHb, bridgedWOETH, AERO, WETH
- **Strategies**: Base-specific strategy tracking
- **Aerodrome**: DEX pool and liquidity tracking
- **Bridged wOETH Strategy**: Cross-chain strategy tracking
- **Exchange Rates**: Price tracking
- **Pools**: Generic pool tracking

**Key Entities**:
- `AeroPoolState`, `AeroCLPoolState`, `AeroCLPoolTick`
- `AeroPoolEpochState`, `AeroLP`, `AeroLPPosition`
- `AeroGaugeNotifyReward`, `AeroCLGaugeNotifyReward`
- `AeroPoolCreated`, `AeroCLPoolCreated`, `AeroVoterGaugeCreated`
- `EventWOETHPriceUpdated`

### 6. Arbitrum Processor (`arbitrum-processor`)
**Purpose**: Indexes Arbitrum chain data

**Components**:
- **ERC20s**: Token tracking
- **CCIP**: Cross-chain bridge transfers

**Key Entities**:
- Standard ERC20 entities
- `BridgeTransfer`, `BridgeTransferState`

### 7. Sonic Processor (`sonic-processor`)
**Purpose**: Indexes Sonic chain data

**Components**:
- **ERC20s**: Token tracking
- **Strategies**: Strategy tracking
- **SFC (Sonic Finance Contract)**: Staking and withdrawal tracking
- **Pool Booster**: Pool boosting mechanism
- **Pools**: Generic pool tracking
- **Origin ARM**: ARM pools on Sonic

**Key Entities**:
- `SFCWithdrawal`
- `PoolBooster`, `PoolBoosterBribeExecuted`
- Standard OToken and ARM entities

### 8. OS Processor (`os-processor`)
**Purpose**: Indexes OS (Origin Sonic) token on Sonic chain

**Components**:
- **OS Token**: Similar to OETH/OUSD but on Sonic
- **Exchange Rates**: Price tracking

**Key Entities**: Similar to OToken entities

### 9. superOETHb Processor (`superOETHb-processor`)
**Purpose**: Indexes Super superOETHb on Base chain

**Components**:
- **Super superOETHb**: Token tracking
- **Exchange Rates**: Price tracking

**Key Entities**: Similar to OToken entities

## GraphQL API Features

### Core Entity Categories

#### 1. Token Entities (OToken, ERC20)
- **OToken**: Main token state (supply, rebasing supply, credits per token)
- **OTokenAddress**: Per-address balances, credits, rebasing options
- **OTokenHistory**: Transaction history per address
- **OTokenRebase**: Rebase events with yield and fees
- **OTokenAPY**: APY calculations (daily, 7-day, 14-day, 30-day averages)
- **OTokenDailyStat**: Daily aggregated statistics
- **OTokenActivity**: Activity events (Transfer, Mint, Redeem, Stake, etc.)
- **OTokenWithdrawalRequest**: Withdrawal queue tracking
- **WOToken**: Wrapped token state
- **ERC20**: Token metadata
- **ERC20Holder**: Holder tracking
- **ERC20State**: Token state snapshots
- **ERC20Balance**: Balance snapshots
- **ERC20Transfer**: Transfer events

#### 2. Strategy Entities
- **StrategyBalance**: Strategy asset balances
- **StrategyYield**: Strategy yield calculations
- **StrategyDailyYield**: Daily yield aggregations

#### 3. Governance Entities
- **GovernanceProposal**: Proposal details and status
- **GovernanceProposalVote**: Individual votes
- **GovernanceProposalEvent**: Proposal lifecycle events
- **OGVProposal**: OGV-specific proposals
- **OGVProposalVote**: OGV votes
- **OGVAddress**: OGV holder data with voting power

#### 4. Staking Entities
- **OGVLockup**: OGV staking lockups
- **OGVLockupTxLog**: Lockup events
- **ESLockup**: Exponential staking lockups
- **ESLockupEvent**: ES events
- **ESAccount**: ES account state
- **ESToken**: ES token state
- **ESYield**: ES yield calculations
- **LegacyStaker**: Legacy staking data

#### 5. ARM (Automated Reserve Management) Entities
- **Arm**: ARM pool metadata
- **ArmState**: ARM pool state
- **ArmDailyStat**: Daily ARM statistics
- **ArmWithdrawalRequest**: ARM withdrawal requests
- **ArmSwap**: ARM swap events
- **TraderateChanged**: Trade rate changes

#### 6. Pool Entities
- **Pool**: Generic pool metadata
- **CurvePool**: Curve pool data
- **CurvePoolBalance**: Curve pool balances
- **CurvePoolRate**: Curve pool rates
- **AeroPoolState**: Aerodrome pool states
- **AeroCLPoolState**: Aerodrome CL pool states
- **AeroLP**: Aerodrome LP positions
- **PoolBooster**: Pool booster data

#### 7. Bridge Entities
- **BridgeTransfer**: Cross-chain transfers
- **BridgeTransferState**: Transfer state updates

#### 8. Exchange Rate Entities
- **ExchangeRate**: Token price data (chainId:blockNumber:pair format)

#### 9. Protocol Statistics
- **ProtocolDailyStat**: Overall protocol daily stats
- **ProtocolDailyStatDetail**: Per-product daily stats
- **OGNDailyStat**: OGN daily statistics
- **OGVDailyStat**: OGV daily statistics

#### 10. Native Staking
- **BeaconDepositEvent**: Beacon chain deposits
- **BeaconDepositPubkey**: Deposit pubkey tracking
- **AccountingConsensusRewards**: Consensus layer rewards
- **ExecutionRewardsCollected**: Execution layer rewards

#### 11. Other Entities
- **OGNBuyback**: OGN buyback events
- **MorphoMarketState**: Morpho lending market states
- **TransactionDetails**: Transaction metadata
- **ProcessingStatus**: Indexer processing status
- **CoinGeckoCoinData**: External price data
- **WalletLabels**: Address labeling
- **NativeBalance**: Native token balances

## Migration Requirements

### 1. Data Model Migration

#### 1.1 Entity Schema Translation
- **Requirement**: Translate all GraphQL entity definitions to Envio schema format
- **Priority**: Critical
- **Details**:
  - Map `@entity` directives to Envio table definitions
  - Convert `@index` directives to Envio index definitions
  - Map `@derivedFrom` relationships to Envio foreign keys
  - Convert scalar types (BigInt, DateTime, JSON, Bytes)
  - Handle enum types

#### 1.2 ID Format Preservation
- **Requirement**: Maintain existing ID formats (e.g., `chainId:logId`, `chainId:address:account`)
- **Priority**: Critical
- **Details**: Many entities use composite IDs that must be preserved for API compatibility

#### 1.3 Relationship Mapping
- **Requirement**: Map all `@derivedFrom` relationships
- **Priority**: High
- **Details**: Ensure bidirectional relationships work correctly

### 2. Event Processing Migration

#### 2.1 Event Filter Translation
- **Requirement**: Convert Subsquid event filters to Envio event handlers
- **Priority**: Critical
- **Details**:
  - Map `processor.addLog()` calls to Envio event handlers
  - Preserve address filters
  - Preserve topic filters
  - Preserve block range filters

#### 2.2 ABI Handling
- **Requirement**: Convert ABI-based event decoding
- **Priority**: Critical
- **Details**:
  - Map `@subsquid/evm-abi` usage to Envio ABI handling
  - Ensure all event parameters are decoded correctly
  - Handle event versioning and upgrades

#### 2.3 Batch Processing
- **Requirement**: Implement efficient batch processing
- **Priority**: High
- **Details**:
  - Current system processes blocks in batches
  - Envio should maintain similar batch efficiency
  - Consider block range processing for historical data

### 3. State Management Migration

#### 3.1 State Schema Separation
- **Requirement**: Maintain separate state schemas per processor
- **Priority**: High
- **Details**:
  - Current: 9 separate database schemas
  - Envio: May need separate indexers or namespace separation

#### 3.2 Entity Batching
- **Requirement**: Implement entity batching for database operations
- **Priority**: High
- **Details**:
  - Current system batches entity saves (maps → upsert at end)
  - Envio should maintain similar pattern to avoid N+1 queries

#### 3.3 Upsert Logic
- **Requirement**: Preserve upsert logic for entity updates
- **Priority**: Critical
- **Details**: Many entities are updated in-place rather than creating new records

### 4. Post-Processor Migration

#### 4.1 Exchange Rate Calculation
- **Requirement**: Migrate exchange rate post-processor
- **Priority**: Critical
- **Details**:
  - Calculates token prices from multiple sources
  - Updates `ExchangeRate` entities
  - Runs after each batch

#### 4.2 Daily Stats Aggregation
- **Requirement**: Migrate daily statistics calculation
- **Priority**: High
- **Details**:
  - Aggregates data into daily buckets
  - Calculates APY, APR, yields, fees
  - Creates `*DailyStat` entities

#### 4.3 Protocol Statistics
- **Requirement**: Migrate protocol-level statistics
- **Priority**: High
- **Details**:
  - Calculates TVL, revenue, yield across products
  - Handles inherited and bridged TVL
  - Creates `ProtocolDailyStat` entities

#### 4.4 Processing Status
- **Requirement**: Track processing status
- **Priority**: Medium
- **Details**: Records current block and processing state

### 5. Multi-Chain Support

#### 5.1 Chain Configuration
- **Requirement**: Support 5 chains (Mainnet, Arbitrum, Base, Sonic, OS)
- **Priority**: Critical
- **Details**:
  - Each chain may need separate indexer deployment
  - Or single indexer with chain routing
  - Chain IDs must be preserved in entities

#### 5.2 RPC Configuration
- **Requirement**: Support multiple RPC endpoints per chain
- **Priority**: High
- **Details**:
  - Current system uses archive nodes and regular RPC
  - Envio should support similar RPC configuration
  - Handle RPC failures and fallbacks

### 6. Historical Data Migration

#### 6.1 Data Export
- **Requirement**: Export existing data from current system
- **Priority**: Critical
- **Details**:
  - Export all entities from PostgreSQL
  - Preserve relationships
  - Maintain data integrity

#### 6.2 Data Import
- **Requirement**: Import historical data into Envio
- **Priority**: Critical
- **Details**:
  - Bulk import mechanism
  - Verify data integrity
  - Handle ID conflicts

#### 6.3 Backfill Strategy
- **Requirement**: Strategy for backfilling missing data
- **Priority**: Medium
- **Details**:
  - Re-process historical blocks if needed
  - Handle contract upgrades and changes

### 7. API Compatibility

#### 7.1 GraphQL Schema Compatibility
- **Requirement**: Maintain GraphQL API compatibility
- **Priority**: Critical
- **Details**:
  - Same entity names
  - Same field names and types
  - Same relationships
  - Same query structure

#### 7.2 Query Performance
- **Requirement**: Maintain or improve query performance
- **Priority**: High
- **Details**:
  - Index optimization
  - Query caching if applicable
  - Pagination support

### 8. Monitoring and Observability

#### 8.1 Processing Metrics
- **Requirement**: Track processing performance
- **Priority**: Medium
- **Details**:
  - Blocks processed per second
  - Processing lag
  - Error rates

#### 8.2 Data Validation
- **Requirement**: Implement data validation
- **Priority**: High
- **Details**:
  - Current system has validation queries
  - Envio should have similar validation
  - Alert on data inconsistencies

### 9. Deployment and Operations

#### 9.1 Deployment Strategy
- **Requirement**: Plan deployment approach
- **Priority**: High
- **Details**:
  - Phased migration (chain by chain)
  - Parallel running period
  - Cutover strategy

#### 9.2 Rollback Plan
- **Requirement**: Ability to rollback if issues occur
- **Priority**: High
- **Details**:
  - Keep current system running during migration
  - Data sync verification
  - Quick rollback procedure

### 10. Testing Requirements

#### 10.1 Unit Tests
- **Requirement**: Test individual processors
- **Priority**: High
- **Details**: Test event handlers, entity creation, calculations

#### 10.2 Integration Tests
- **Requirement**: Test full processing pipeline
- **Priority**: High
- **Details**: End-to-end processing tests

#### 10.3 Data Validation Tests
- **Requirement**: Compare Envio output with current system
- **Priority**: Critical
- **Details**: Side-by-side comparison of entity data

#### 10.4 Performance Tests
- **Requirement**: Verify processing speed
- **Priority**: Medium
- **Details**: Ensure Envio meets or exceeds current performance

## Migration Phases

### Phase 1: Setup and Infrastructure
- Set up Envio development environment
- Configure multi-chain support
- Set up database schemas
- Create initial entity mappings

### Phase 2: Core Processor Migration
- Migrate OETH processor (simplest)
- Migrate OUSD processor
- Migrate OGV processor
- Test and validate each

### Phase 3: Mainnet Processor Migration
- Migrate mainnet processor components
- Handle complex post-processors
- Test governance, staking, ARM features

### Phase 4: L2 Chain Migration
- Migrate Base processor
- Migrate Arbitrum processor
- Migrate Sonic processor
- Migrate OS processor
- Migrate superOETHb processor

### Phase 5: Post-Processors and Aggregations
- Migrate exchange rate calculation
- Migrate daily stats aggregation
- Migrate protocol statistics
- Test all aggregations

### Phase 6: API and Testing
- Set up GraphQL API
- Verify API compatibility
- Run validation tests
- Performance testing

### Phase 7: Data Migration
- Export historical data
- Import into Envio
- Verify data integrity
- Backfill any gaps

### Phase 8: Deployment
- Deploy to staging
- Run parallel with current system
- Verify data sync
- Deploy to production
- Monitor and validate

## Risk Assessment

### High Risk Areas
1. **Data Loss**: Risk of losing historical data during migration
2. **API Breaking Changes**: Risk of breaking existing API consumers
3. **Performance Degradation**: Risk of slower processing
4. **Multi-Chain Complexity**: Risk of issues with chain-specific features

### Mitigation Strategies
1. **Data Backup**: Full backup before migration
2. **Parallel Running**: Run both systems in parallel
3. **Gradual Migration**: Migrate one processor at a time
4. **Comprehensive Testing**: Extensive testing before production
5. **Rollback Plan**: Ability to revert quickly

## Success Criteria

1. ✅ All entities migrated and queryable
2. ✅ All processors functioning correctly
3. ✅ GraphQL API fully compatible
4. ✅ Historical data preserved
5. ✅ Processing performance maintained or improved
6. ✅ Zero data loss
7. ✅ All post-processors working
8. ✅ Multi-chain support verified

## Open Questions

1. Does Envio support separate database schemas per indexer?
2. How does Envio handle post-processors/aggregations?
3. What is Envio's approach to multi-chain indexing?
4. How does Envio handle entity relationships and derived fields?
5. What is Envio's batch processing model?
6. How does Envio handle RPC failures and retries?
7. What is Envio's deployment model for multiple indexers?

