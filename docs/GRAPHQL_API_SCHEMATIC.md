# Origin Protocol GraphQL API Feature Schematic

## Overview

This document provides a comprehensive schematic of all features exposed through the GraphQL API. The API is auto-generated from GraphQL schema files and provides query access to all indexed blockchain data.

## API Structure

The GraphQL API follows a standard entity-based query pattern where each entity type can be queried with filters, sorting, and pagination.

## Feature Categories

### 1. Token Management

#### 1.1 OToken (OETH, OUSD, OS, superOETHb)
**Purpose**: Track Origin Protocol yield-bearing tokens

**Key Queries**:
```graphql
# Get token state
otokens(where: { otoken: { eq: "0x..." } })

# Get holder balances
otokenAddresses(where: { otoken: { eq: "0x..." }, address: { eq: "0x..." } })

# Get transaction history
otokenHistories(where: { address: { id: { eq: "..." } } })

# Get rebase events
otokenRebases(where: { otoken: { eq: "0x..." } }, orderBy: timestamp_DESC)

# Get APY data
otokenAPYs(where: { otoken: { eq: "0x..." } }, orderBy: date_DESC)

# Get daily statistics
otokenDailyStats(where: { otoken: { eq: "0x..." } }, orderBy: date_DESC)

# Get withdrawal requests
otokenWithdrawalRequests(where: { otoken: { eq: "0x..." }, claimed: { eq: false } })

# Get activity events
otokenActivities(where: { otoken: { eq: "0x..." }, type: { eq: Transfer } })
```

**Key Features**:
- Real-time token supply (total, rebasing, non-rebasing)
- Per-address balances and credits
- Transaction history per address
- Rebase tracking with yield and fees
- APY calculations (daily, 7-day, 14-day, 30-day averages)
- Withdrawal queue tracking
- Activity event tracking (Transfer, Mint, Redeem, Stake, etc.)
- Wrapped token support (wOETH, wOUSD)

**Entities**:
- `OToken`: Token state snapshots
- `OTokenAddress`: Per-address balances and settings
- `OTokenHistory`: Transaction history
- `OTokenRebase`: Rebase events
- `OTokenAPY`: APY calculations
- `OTokenDailyStat`: Daily aggregated stats
- `OTokenActivity`: Activity events
- `OTokenWithdrawalRequest`: Withdrawal requests
- `OTokenVault`: Vault state
- `OTokenDripperState`: Dripper contract state
- `WOToken`: Wrapped token state

#### 1.2 ERC20 Tokens
**Purpose**: Track standard ERC20 tokens

**Key Queries**:
```graphql
# Get token metadata
erc20s(where: { address: { eq: "0x..." } })

# Get token state
erc20States(where: { address: { eq: "0x..." } }, orderBy: blockNumber_DESC)

# Get holder balances
erc20Balances(where: { address: { eq: "0x..." }, account: { eq: "0x..." } })

# Get transfer events
erc20Transfers(where: { address: { eq: "0x..." } }, orderBy: timestamp_DESC)

# Get holders
erc20Holders(where: { address: { eq: "0x..." } })
```

**Key Features**:
- Token metadata (name, symbol, decimals)
- Total supply tracking
- Holder count tracking
- Balance snapshots
- Transfer event history
- Daily state snapshots

**Entities**:
- `ERC20`: Token metadata
- `ERC20State`: Token state snapshots
- `ERC20StateByDay`: Daily state snapshots
- `ERC20Balance`: Balance snapshots
- `ERC20Transfer`: Transfer events
- `ERC20Holder`: Holder tracking

### 2. Strategy Management

**Purpose**: Track yield-generating strategies for OTokens

**Key Queries**:
```graphql
# Get strategy balances
strategyBalances(where: { otoken: { eq: "0x..." } }, orderBy: blockNumber_DESC)

# Get strategy yields
strategyYields(where: { otoken: { eq: "0x..." } }, orderBy: blockNumber_DESC)

# Get daily strategy yields
strategyDailyYields(where: { otoken: { eq: "0x..." } }, orderBy: timestamp_DESC)
```

**Key Features**:
- Strategy asset balances
- Strategy yield calculations
- Strategy allocation weights
- Daily yield aggregations with APR/APY
- Multi-asset strategy support

**Entities**:
- `StrategyBalance`: Strategy balance snapshots
- `StrategyYield`: Strategy yield calculations
- `StrategyDailyYield`: Daily yield aggregations

### 3. Governance

#### 3.1 OGV Governance
**Purpose**: Track OGV token governance

**Key Queries**:
```graphql
# Get proposals
ogvProposals(orderBy: timestamp_DESC)

# Get proposal details
ogvProposal(id: "...") {
  logs { event, timestamp }
  votes { voter, weight, type }
}

# Get votes
ogvProposalVotes(where: { proposal: { id: { eq: "..." } } })

# Get OGV addresses with voting power
ogvAddresses(where: { votingPower: { gt: "0" } })
```

**Key Features**:
- Proposal creation and lifecycle
- Voting tracking
- Vote weights based on veOGV
- Proposal status tracking
- Quorum and scoring

**Entities**:
- `OGVProposal`: Governance proposals
- `OGVProposalVote`: Individual votes
- `OGVProposalTxLog`: Proposal lifecycle events
- `OGVAddress`: OGV holder data with voting power

#### 3.2 General Governance
**Purpose**: Track general governance (OGN, etc.)

**Key Queries**:
```graphql
# Get proposals
governanceProposals(where: { chainId: { eq: 1 } }, orderBy: timestamp_DESC)

# Get proposal votes
governanceProposalVotes(where: { proposal: { id: { eq: "..." } } })
```

**Key Features**:
- Multi-chain governance support
- Proposal tracking
- Vote tracking
- Proposal execution tracking

**Entities**:
- `GovernanceProposal`: Governance proposals
- `GovernanceProposalVote`: Individual votes
- `GovernanceProposalEvent`: Proposal lifecycle events

### 4. Staking

#### 4.1 OGV Staking (veOGV)
**Purpose**: Track OGV staking and vote-escrow

**Key Queries**:
```graphql
# Get lockups
ogvLockups(where: { address: { id: { eq: "..." } } })

# Get lockup events
ogvLockupTxLogs(where: { ogvLockup: { id: { eq: "..." } } })

# Get OGV addresses
ogvAddresses(where: { staked: { gt: "0" } })
```

**Key Features**:
- Lockup tracking (stake/unstake/extend)
- Voting power calculation
- Delegation support
- Lockup duration tracking

**Entities**:
- `OGVLockup`: Staking lockups
- `OGVLockupTxLog`: Lockup events
- `OGVAddress`: OGV holder state

#### 4.2 Exponential Staking (xOGN)
**Purpose**: Track exponential staking for OGN

**Key Queries**:
```graphql
# Get ES token state
esTokens(orderBy: blockNumber_DESC)

# Get ES accounts
esAccounts(where: { address: { eq: "0x..." } })

# Get ES lockups
esLockups(where: { account: { eq: "0x..." } })

# Get ES yield
esYields(where: { address: { eq: "0x..." } }, orderBy: blockNumber_DESC)
```

**Key Features**:
- Staking and unstaking
- Lockup duration and points
- Yield calculations
- Delegation support
- Penalty tracking
- Reward tracking

**Entities**:
- `ESToken`: ES token state
- `ESAccount`: ES account state
- `ESLockup`: ES lockups
- `ESLockupEvent`: ES events
- `ESYield`: Yield calculations
- `ESDelegateChanged`: Delegation changes
- `ESDelegateVotesChanged`: Voting power changes
- `ESPenalty`: Penalty events
- `ESReward`: Reward events
- `ESStake`: Stake events
- `ESUnstake`: Unstake events

#### 4.3 Legacy Staking
**Purpose**: Track legacy staking contracts

**Key Queries**:
```graphql
legacyStakers(where: { id: { eq: "..." } })
```

**Entities**:
- `LegacyStaker`: Legacy staking data

#### 4.4 Native Staking
**Purpose**: Track native ETH staking

**Key Queries**:
```graphql
# Get beacon deposits
beaconDepositEvents(orderBy: timestamp_DESC)

# Get consensus rewards
accountingConsensusRewards(where: { address: { eq: "0x..." } })

# Get execution rewards
executionRewardsCollected(where: { address: { eq: "0x..." } })
```

**Key Features**:
- Beacon chain deposit tracking
- Consensus layer rewards
- Execution layer rewards
- Pubkey tracking

**Entities**:
- `BeaconDepositEvent`: Beacon deposits
- `BeaconDepositPubkey`: Deposit pubkeys
- `AccountingConsensusRewards`: Consensus rewards
- `ExecutionRewardsCollected`: Execution rewards

### 5. ARM

**Purpose**: Track ARM pools for automated liquidity management

**Key Queries**:
```graphql
# Get ARM pools
arms(where: { chainId: { eq: 1 } })

# Get ARM state
armStates(where: { address: { eq: "0x..." } }, orderBy: blockNumber_DESC)

# Get daily ARM stats
armDailyStats(where: { address: { eq: "0x..." } }, orderBy: date_DESC)

# Get withdrawal requests
armWithdrawalRequests(where: { address: { eq: "0x..." }, claimed: { eq: false } })

# Get swaps
armSwaps(where: { address: { eq: "0x..." } }, orderBy: timestamp_DESC)
```

**Key Features**:
- Pool state tracking (assets, supply, fees)
- Daily statistics (APR, APY, yield, fees)
- Withdrawal request tracking
- Swap event tracking
- Trade rate changes

**Entities**:
- `Arm`: ARM pool metadata
- `ArmState`: ARM pool state
- `ArmDailyStat`: Daily statistics
- `ArmWithdrawalRequest`: Withdrawal requests
- `ArmSwap`: Swap events
- `TraderateChanged`: Trade rate changes

### 6. Pool Management

#### 6.1 Generic Pools
**Purpose**: Track generic liquidity pools

**Key Queries**:
```graphql
pools(where: { chainId: { eq: 1 }, exchange: { eq: "..." } })
```

**Entities**:
- `Pool`: Pool metadata

#### 6.2 Curve Pools
**Purpose**: Track Curve protocol pools

**Key Queries**:
```graphql
# Get Curve pools
curvePools(where: { address: { eq: "0x..." } })

# Get pool balances
curvePoolBalances(where: { address: { eq: "0x..." } }, orderBy: blockNumber_DESC)

# Get pool rates
curvePoolRates(where: { address: { eq: "0x..." } }, orderBy: blockNumber_DESC)
```

**Entities**:
- `CurvePool`: Curve pool metadata
- `CurvePoolBalance`: Pool balance snapshots
- `CurvePoolRate`: Pool rate snapshots

#### 6.3 Aerodrome Pools
**Purpose**: Track Aerodrome DEX pools (Base chain)

**Key Queries**:
```graphql
# Get pool states
aeroPoolStates(where: { address: { eq: "0x..." } }, orderBy: blockNumber_DESC)

# Get CL pool states
aeroCLPoolStates(where: { address: { eq: "0x..." } }, orderBy: blockNumber_DESC)

# Get LP positions
aeroLPPositions(where: { account: { eq: "0x..." } })

# Get epoch states
aeroPoolEpochStates(where: { address: { eq: "0x..." } }, orderBy: epoch_DESC)
```

**Key Features**:
- Pool state tracking
- Concentrated liquidity (CL) pools
- LP position tracking
- Epoch-based rewards
- Gauge rewards
- Vote weights

**Entities**:
- `AeroPoolState`: Standard pool states
- `AeroCLPoolState`: CL pool states
- `AeroCLPoolTick`: CL pool tick data
- `AeroPoolEpochState`: Epoch-based states
- `AeroLP`: LP position snapshots
- `AeroLPPosition`: LP position tracking
- `AeroGaugeNotifyReward`: Gauge reward events
- `AeroCLGaugeNotifyReward`: CL gauge rewards
- `AeroPoolCreated`: Pool creation events
- `AeroCLPoolCreated`: CL pool creation
- `AeroVoterGaugeCreated`: Gauge creation

#### 6.4 Pool Booster
**Purpose**: Track pool boosting mechanism (Sonic)

**Key Queries**:
```graphql
poolBoosters(where: { chainId: { eq: 146 } })

poolBoosterBribeExecuteds(where: { address: { eq: "0x..." } })
```

**Entities**:
- `PoolBooster`: Pool booster data
- `PoolBoosterBribeExecuted`: Bribe execution events

### 7. Bridge and Cross-Chain

**Purpose**: Track cross-chain transfers

**Key Queries**:
```graphql
# Get bridge transfers
bridgeTransfers(where: { bridge: { eq: "ccip" } }, orderBy: timestamp_DESC)

# Get transfer states
bridgeTransferStates(where: { txHash: { eq: "0x..." } })
```

**Key Features**:
- Cross-chain transfer tracking
- Transfer state updates
- Multi-chain support
- CCIP integration

**Entities**:
- `BridgeTransfer`: Cross-chain transfers
- `BridgeTransferState`: Transfer state updates

### 8. Exchange Rates and Pricing

**Purpose**: Track token prices and exchange rates

**Key Queries**:
```graphql
# Get exchange rates
exchangeRates(
  where: { 
    chainId: { eq: 1 },
    pair: { eq: "ETH_USD" }
  },
  orderBy: blockNumber_DESC
)

# Get CoinGecko data
coinGeckoCoinDatas(
  where: { 
    product: { eq: "ogn" },
    vsCurrency: { eq: "usd" }
  },
  orderBy: date_DESC
)
```

**Key Features**:
- Multi-chain price tracking
- Multiple price pairs
- Historical price data
- External price integration (CoinGecko)

**Entities**:
- `ExchangeRate`: Token exchange rates (format: chainId:blockNumber:pair)
- `CoinGeckoCoinData`: External price data

### 9. Protocol Statistics

**Purpose**: Track protocol-level metrics

**Key Queries**:
```graphql
# Get protocol daily stats
protocolDailyStats(orderBy: date_DESC)

# Get protocol daily stat details
protocolDailyStatDetails(
  where: { product: { eq: "oeth" } },
  orderBy: date_DESC
)

# Get OGN daily stats
ognDailyStats(orderBy: date_DESC)

# Get OGV daily stats
ogvDailyStats(orderBy: date_DESC)
```

**Key Features**:
- Overall protocol TVL
- Per-product statistics
- Revenue and yield tracking
- APY calculations
- Inherited and bridged TVL tracking

**Entities**:
- `ProtocolDailyStat`: Overall protocol stats
- `ProtocolDailyStatDetail`: Per-product stats
- `OGNDailyStat`: OGN token stats
- `OGVDailyStat`: OGV token stats

### 10. Other Features

#### 10.1 OGN Buybacks
**Purpose**: Track OGN token buyback events

**Key Queries**:
```graphql
ognBuybacks(orderBy: timestamp_DESC)
```

**Entities**:
- `OGNBuyback`: Buyback events

#### 10.2 Morpho Markets
**Purpose**: Track Morpho lending markets (OUSD)

**Key Queries**:
```graphql
morphoMarketStates(
  where: { marketId: { eq: "..." } },
  orderBy: blockNumber_DESC
)
```

**Entities**:
- `MorphoMarketState`: Morpho market states

#### 10.3 Fixed Rate Rewards Source
**Purpose**: Track fixed rate rewards (xOGN)

**Key Queries**:
```graphql
frrsRewardCollecteds(where: { address: { eq: "0x..." } })

frrsRewardsPerSecondChangeds(where: { address: { eq: "0x..." } })
```

**Entities**:
- `FRRSRewardCollected`: Reward collection events
- `FRRSRewardsPerSecondChanged`: Rate change events
- `FRRSRewardsTargetChange`: Target change events
- `FRRSStrategistUpdated`: Strategist updates

#### 10.4 Transaction Details
**Purpose**: Track transaction metadata

**Key Queries**:
```graphql
transactionDetails(where: { txHash: { eq: "0x..." } })
```

**Entities**:
- `TransactionDetails`: Transaction metadata

#### 10.5 Wallet Labels
**Purpose**: Track address labels

**Key Queries**:
```graphql
walletLabels(where: { address: { eq: "0x..." } })
```

**Entities**:
- `WalletLabels`: Address labels

#### 10.6 Native Balances
**Purpose**: Track native token balances

**Key Queries**:
```graphql
nativeBalances(where: { account: { eq: "0x..." } }, orderBy: blockNumber_DESC)
```

**Entities**:
- `NativeBalance`: Native token balances

#### 10.7 Processing Status
**Purpose**: Track indexer processing status

**Key Queries**:
```graphql
processingStatuses(orderBy: blockNumber_DESC, limit: 1)
```

**Entities**:
- `ProcessingStatus`: Processing status

#### 10.8 Utility Cache
**Purpose**: General-purpose caching

**Key Queries**:
```graphql
utilCaches(where: { id: { eq: "..." } })
```

**Entities**:
- `UtilCache`: Cache data

## Query Patterns

### Common Filter Patterns

```graphql
# By chain
where: { chainId: { eq: 1 } }

# By address
where: { address: { eq: "0x..." } }

# By timestamp range
where: { 
  timestamp: { 
    gte: "2024-01-01T00:00:00Z",
    lte: "2024-12-31T23:59:59Z"
  }
}

# By block range
where: {
  blockNumber: {
    gte: 1000000,
    lte: 2000000
  }
}

# By date
where: { date: { eq: "2024-01-01" } }

# Multiple conditions
where: {
  chainId: { eq: 1 },
  otoken: { eq: "0x..." },
  timestamp: { gte: "2024-01-01T00:00:00Z" }
}
```

### Common Sorting Patterns

```graphql
# By timestamp (newest first)
orderBy: timestamp_DESC

# By timestamp (oldest first)
orderBy: timestamp_ASC

# By block number
orderBy: blockNumber_DESC

# By date
orderBy: date_DESC
```

### Pagination Patterns

```graphql
# Limit results
limit: 100

# Offset
offset: 0

# Combined
limit: 100, offset: 0
```

## Entity Relationships

### OToken Relationships
```
OToken
  ├── OTokenAddress (many)
  │     ├── OTokenHistory (many)
  │     └── OTokenRebaseOption (many)
  ├── OTokenRebase (many)
  ├── OTokenAPY (many)
  ├── OTokenDailyStat (many)
  ├── OTokenActivity (many)
  ├── OTokenWithdrawalRequest (many)
  ├── OTokenVault (many)
  ├── OTokenDripperState (many)
  ├── StrategyBalance (many)
  ├── StrategyYield (many)
  └── WOToken (many)
```

### Governance Relationships
```
OGVProposal
  ├── OGVProposalVote (many)
  └── OGVProposalTxLog (many)

GovernanceProposal
  ├── GovernanceProposalVote (many)
  └── GovernanceProposalEvent (many)
```

### Staking Relationships
```
OGVAddress
  ├── OGVLockup (many)
  └── OGVAddress (delegatee)

ESAccount
  ├── ESLockup (many)
  └── ESAccount (delegateTo, delegatesFrom)
```

### ARM Relationships
```
Arm
  ├── ArmState (many)
  ├── ArmDailyStat (many)
  ├── ArmWithdrawalRequest (many)
  └── ArmSwap (many)
```

## Multi-Chain Support

All entities support `chainId` field for multi-chain queries:

- **Chain ID 1**: Ethereum Mainnet
- **Chain ID 42161**: Arbitrum
- **Chain ID 8453**: Base
- **Chain ID 146**: Sonic

## Performance Considerations

1. **Indexing**: All frequently queried fields are indexed
2. **Pagination**: Use limit/offset for large result sets
3. **Filtering**: Apply filters early to reduce result set
4. **Sorting**: Sort by indexed fields when possible
5. **Relationships**: Use `@derivedFrom` for efficient reverse lookups

## API Versioning

The API follows the schema version. Schema changes require:
1. Migration generation
2. Database migration
3. API update
4. Version tagging

