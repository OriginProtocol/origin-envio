# Managing Multiple Envio Indexers
## Local Development, Composability, and Deployment

## Overview

This guide covers how to manage multiple Envio indexers in a product-based architecture, ensuring they work together (composability) and can be deployed effectively.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Running Multiple Indexers](#running-multiple-indexers)
3. [Port Management](#port-management)
4. [Database Management](#database-management)
5. [Composability](#composability)
6. [Deployment Strategies](#deployment-strategies)
7. [Tooling and Scripts](#tooling-and-scripts)
8. [Best Practices](#best-practices)

## Local Development Setup

### Prerequisites

- Node.js v20
- pnpm v8+
- Docker Desktop (for local databases)
- Multiple terminal windows/tabs or process manager

### Project Structure

```
envio/
├── src/
│   ├── indexers/          # Multiple indexers
│   │   ├── oToken/
│   │   ├── strategies/
│   │   ├── governance/
│   │   └── ...
│   └── shared/            # Shared code
├── package.json
└── docker-compose.yml     # Local database setup
```

### Initial Setup

```bash
# Install dependencies
pnpm install

# Generate code for all indexers
pnpm codegen:all

# Type check
pnpm typecheck
```

## Running Multiple Indexers

### Option 1: Separate Terminal Windows (Recommended for Development)

Each indexer runs in its own terminal with its own database and GraphQL endpoint:

```bash
# Terminal 1: OTokens indexer
pnpm oToken:dev

# Terminal 2: Strategies indexer
pnpm strategies:dev

# Terminal 3: Governance indexer
pnpm governance:dev

# Terminal 4: Exchange rates indexer
pnpm exchange-rates:dev
```

**Benefits**:
- Easy to see logs per indexer
- Can stop/restart individual indexers
- Clear separation

**Drawbacks**:
- Need multiple terminals
- Manual management

### Option 2: Process Manager (Recommended for Production-like Testing)

Use a process manager like `concurrently` or `pm2`:

#### Using concurrently

```bash
# Install concurrently
pnpm add -D concurrently

# Add to package.json
{
  "scripts": {
    "dev:all": "concurrently -n oToken,strategies,governance,exchange-rates \"pnpm oToken:dev\" \"pnpm strategies:dev\" \"pnpm governance:dev\" \"pnpm exchange-rates:dev\"",
    "dev:core": "concurrently -n oToken,strategies \"pnpm oToken:dev\" \"pnpm strategies:dev\""
  }
}
```

```bash
# Run all indexers
pnpm dev:all

# Run core indexers only
pnpm dev:core
```

#### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file: ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'oToken',
      script: 'pnpm',
      args: 'oToken:dev',
      cwd: process.cwd(),
    },
    {
      name: 'strategies',
      script: 'pnpm',
      args: 'strategies:dev',
      cwd: process.cwd(),
    },
    {
      name: 'governance',
      script: 'pnpm',
      args: 'governance:dev',
      cwd: process.cwd(),
    },
    // ... more indexers
  ],
};

# Start all
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Stop all
pm2 stop all

# Restart specific indexer
pm2 restart oToken
```

### Option 3: Docker Compose (Recommended for Production-like Environment)

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Databases for each indexer
  db-oToken:
    image: postgres:15
    environment:
      POSTGRES_DB: o_token
      POSTGRES_USER: envio
      POSTGRES_PASSWORD: envio
    ports:
      - "5432:5432"
    volumes:
      - oToken-data:/var/lib/postgresql/data

  db-strategies:
    image: postgres:15
    environment:
      POSTGRES_DB: strategies
      POSTGRES_USER: envio
      POSTGRES_PASSWORD: envio
    ports:
      - "5433:5432"
    volumes:
      - strategies-data:/var/lib/postgresql/data

  db-governance:
    image: postgres:15
    environment:
      POSTGRES_DB: governance
      POSTGRES_USER: envio
      POSTGRES_PASSWORD: envio
    ports:
      - "5434:5432"
    volumes:
      - governance-data:/var/lib/postgresql/data

  # Indexers (run locally, connect to Docker databases)
  # Note: Envio indexers run on host, not in Docker

volumes:
  oToken-data:
  strategies-data:
  governance-data:
```

```bash
# Start databases
docker-compose -f docker-compose.dev.yml up -d

# Run indexers locally (they connect to Docker databases)
pnpm dev:all
```

## Port Management

Each Envio indexer runs its own GraphQL server. You need to configure different ports for each.

### Port Configuration

Envio uses port `8080` by default. For multiple indexers, configure different ports:

#### Option 1: Environment Variables

```bash
# .env files per indexer
# .env.oToken
ENVIO_PORT=8080

# .env.strategies
ENVIO_PORT=8081

# .env.governance
ENVIO_PORT=8082
```

Update package.json scripts:

```json
{
  "scripts": {
    "oToken:dev": "envio dev -d src/indexers/oToken --port 8080",
    "strategies:dev": "envio dev -d src/indexers/strategies --port 8081",
    "governance:dev": "envio dev -d src/indexers/governance --port 8082",
    "exchange-rates:dev": "envio dev -d src/indexers/exchange-rates --port 8083"
  }
}
```

#### Option 2: Port Mapping Script

Create a port mapping configuration:

```typescript
// src/tooling/config/ports.ts
export const INDEXER_PORTS = {
  'oToken': 8080,
  'strategies': 8081,
  'governance': 8082,
  'staking': 8083,
  'arm': 8084,
  'pools': 8085,
  'erc20': 8086,
  'bridges': 8087,
  'exchange-rates': 8088,
  'protocol-stats': 8089,
  'mainnet-misc': 8090,
  'sonic-misc': 8091,
} as const;

export function getIndexerPort(indexerName: string): number {
  return INDEXER_PORTS[indexerName as keyof typeof INDEXER_PORTS] || 8080;
}
```

### Port Reference Table

| Indexer | Port | GraphQL Endpoint |
|---------|------|-----------------|
| oToken | 8080 | http://localhost:8080/v1/graphql |
| strategies | 8081 | http://localhost:8081/v1/graphql |
| governance | 8082 | http://localhost:8082/v1/graphql |
| staking | 8083 | http://localhost:8083/v1/graphql |
| arm | 8084 | http://localhost:8084/v1/graphql |
| pools | 8085 | http://localhost:8085/v1/graphql |
| erc20 | 8086 | http://localhost:8086/v1/graphql |
| bridges | 8087 | http://localhost:8087/v1/graphql |
| exchange-rates | 8088 | http://localhost:8088/v1/graphql |
| protocol-stats | 8089 | http://localhost:8089/v1/graphql |
| mainnet-misc | 8090 | http://localhost:8090/v1/graphql |
| sonic-misc | 8091 | http://localhost:8091/v1/graphql |

## Database Management

### Separate Databases per Indexer

Each indexer should have its own database to ensure isolation:

```yaml
# Each indexer's config.yaml
# oToken/config.yaml
name: oToken
database:
  host: localhost
  port: 5432
  database: o_tokens
  user: envio
  password: envio

# strategies/config.yaml
name: strategies
database:
  host: localhost
  port: 5432
  database: strategies
  user: envio
  password: envio
```

### Database Setup Script

```typescript
// src/tooling/scripts/setup-databases.ts
import { execSync } from 'child_process';

const INDEXERS = [
  'oToken',
  'strategies',
  'governance',
  'staking',
  'arm',
  'pools',
  'erc20',
  'bridges',
  'exchange-rates',
  'protocol-stats',
  'mainnet-misc',
  'sonic-misc',
];

const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'envio',
  password: 'envio',
};

function createDatabase(dbName: string) {
  const command = `psql -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -c "CREATE DATABASE ${dbName};"`;
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Created database: ${dbName}`);
  } catch (error) {
    console.log(`⚠️  Database ${dbName} may already exist`);
  }
}

function setupDatabases() {
  console.log('Setting up databases for all indexers...');
  INDEXERS.forEach(createDatabase);
  console.log('✅ Database setup complete');
}

setupDatabases();
```

```bash
# Add to package.json
{
  "scripts": {
    "db:setup": "tsx src/tooling/scripts/setup-databases.ts"
  }
}
```

## Composability

Composability means indexers can work together - one indexer can query another's data.

### Cross-Indexer Communication

Indexers communicate via GraphQL API using Envio effects:

```typescript
// shared/effects/prices.ts
import { createEffect, S } from 'envio';
import { INDEXER_PORTS } from '../config/ports';

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
    // Query exchange-rates indexer
    const port = INDEXER_PORTS['exchange-rates'];
    const response = await fetch(`http://localhost:${port}/v1/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetPrice($chainId: Int!, $tokenAddress: String!, $blockNumber: Int!) {
            ExchangeRate(
              where: { 
                chainId: { eq: $chainId }
                token: { eq: $tokenAddress }
              }
              orderBy: blockNumber_DESC
              limit: 1
            ) {
              price
              blockNumber
            }
          }
        `,
        variables: input,
      }),
    });

    const data = await response.json();
    return data.data?.ExchangeRate?.[0]?.price || null;
  }
);
```

### Using Effects in Handlers

```typescript
// oToken/EventHandlers.ts
import { getOTokenPrice } from '../../shared/effects/prices';
import { OETH } from './generated';

OETH.Transfer.handler(async ({ event, context }) => {
  // Query exchange-rates indexer for price
  const price = await context.effect(getOTokenPrice, {
    chainId: event.chainId,
    tokenAddress: event.srcAddress,
    blockNumber: event.block.number,
  });

  // Use price in entity
  context.Transfer.set({
    id: `${event.chainId}:${event.block.number}:${event.logIndex}`,
    price: price || 0,
    // ...
  });
});
```

### Dependency Management

Define indexer dependencies:

```typescript
// src/tooling/config/dependencies.ts
export const INDEXER_DEPENDENCIES = {
  'oToken': [], // No dependencies
  'strategies': ['oToken'], // Needs OToken data
  'protocol-stats': [
    'oToken',
    'strategies',
    'governance',
    'staking',
    'arm',
    'pools',
  ], // Aggregates from multiple indexers
  'exchange-rates': [], // No dependencies
} as const;

export function getDependencies(indexerName: string): string[] {
  return INDEXER_DEPENDENCIES[indexerName as keyof typeof INDEXER_DEPENDENCIES] || [];
}
```

### Startup Order Script

```typescript
// src/tooling/scripts/start-indexers.ts
import { getDependencies } from '../config/dependencies';
import { execSync } from 'child_process';

const INDEXERS = [
  'exchange-rates',    // No dependencies
  'oToken',          // No dependencies
  'erc20',             // No dependencies
  'governance',        // No dependencies
  'staking',           // No dependencies
  'arm',               // No dependencies
  'pools',             // No dependencies
  'bridges',           // No dependencies
  'strategies',        // Depends on oToken
  'protocol-stats',    // Depends on many
  'mainnet-misc',      // No dependencies
  'sonic-misc',        // No dependencies
];

function startIndexer(indexerName: string) {
  console.log(`Starting ${indexerName}...`);
  execSync(`pnpm ${indexerName}:dev`, { stdio: 'inherit' });
}

function startWithDependencies() {
  const started = new Set<string>();

  function canStart(indexerName: string): boolean {
    const deps = getDependencies(indexerName);
    return deps.every(dep => started.has(dep));
  }

  for (const indexer of INDEXERS) {
    if (canStart(indexer)) {
      startIndexer(indexer);
      started.add(indexer);
    }
  }
}

startWithDependencies();
```

## Deployment Strategies

### Strategy 1: Separate Deployments (Recommended)

Each indexer is deployed independently:

**Benefits**:
- Independent scaling
- Isolated failures
- Clear ownership
- Easy rollback

**Deployment**:

```bash
# Deploy each indexer separately
envio deploy -d src/indexers/oToken
envio deploy -d src/indexers/strategies
envio deploy -d src/indexers/governance
```

### Strategy 2: Monorepo Deployment

Deploy all indexers from monorepo:

```bash
# Deploy script
#!/bin/bash
for indexer in src/indexers/*/; do
  indexer_name=$(basename "$indexer")
  echo "Deploying $indexer_name..."
  envio deploy -d "$indexer"
done
```

### Strategy 3: CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Indexers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        indexer:
          - oToken
          - strategies
          - governance
          - staking
          - arm
          - pools
          - erc20
          - bridges
          - exchange-rates
          - protocol-stats
          - mainnet-misc
          - sonic-misc
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm ${{ matrix.indexer }}:codegen
      - run: pnpm typecheck
      - run: envio deploy -d src/indexers/${{ matrix.indexer }}
```

### Environment Configuration

```typescript
// src/tooling/config/environments.ts
export const ENVIRONMENTS = {
  development: {
    database: {
      host: 'localhost',
      port: 5432,
    },
    graphql: {
      port: 8080,
    },
  },
  staging: {
    database: {
      host: process.env.DB_HOST,
      port: 5432,
    },
    graphql: {
      port: 8080,
    },
  },
  production: {
    database: {
      host: process.env.DB_HOST,
      port: 5432,
    },
    graphql: {
      port: 8080,
    },
  },
} as const;
```

## Tooling and Scripts

### Complete package.json Scripts

```json
{
  "scripts": {
    // Individual indexer commands
    "oToken:codegen": "envio codegen -d src/indexers/oToken",
    "oToken:dev": "envio dev -d src/indexers/oToken --port 8080",
    "oToken:start": "envio start -d src/indexers/oToken",
    "oToken:deploy": "envio deploy -d src/indexers/oToken",
    
    "strategies:codegen": "envio codegen -d src/indexers/strategies",
    "strategies:dev": "envio dev -d src/indexers/strategies --port 8081",
    "strategies:start": "envio start -d src/indexers/strategies",
    "strategies:deploy": "envio deploy -d src/indexers/strategies",
    
    // ... similar for all indexers
    
    // Batch operations
    "codegen:all": "node src/tooling/scripts/codegen-all.ts",
    "dev:all": "concurrently -n oToken,strategies,governance,exchange-rates \"pnpm oToken:dev\" \"pnpm strategies:dev\" \"pnpm governance:dev\" \"pnpm exchange-rates:dev\"",
    "dev:core": "concurrently -n oToken,strategies \"pnpm oToken:dev\" \"pnpm strategies:dev\"",
    "start:all": "node src/tooling/scripts/start-all.ts",
    "deploy:all": "node src/tooling/scripts/deploy-all.ts",
    
    // Database
    "db:setup": "tsx src/tooling/scripts/setup-databases.ts",
    "db:reset": "tsx src/tooling/scripts/reset-databases.ts",
    
    // Validation
    "validate:all": "node src/tooling/scripts/validate-config.ts",
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    
    // Testing
    "test": "mocha",
    "test:watch": "mocha --watch"
  }
}
```

### Codegen All Script

```typescript
// src/tooling/scripts/codegen-all.ts
import { execSync } from 'child_process';
import { INDEXERS } from '../config/indexers';

const INDEXERS = [
  'oToken',
  'strategies',
  'governance',
  'staking',
  'arm',
  'pools',
  'erc20',
  'bridges',
  'exchange-rates',
  'protocol-stats',
  'mainnet-misc',
  'sonic-misc',
];

function codegenAll() {
  console.log('Generating code for all indexers...');
  
  for (const indexer of INDEXERS) {
    try {
      console.log(`Generating ${indexer}...`);
      execSync(`pnpm envio codegen -d src/indexers/${indexer}`, {
        stdio: 'inherit',
      });
      console.log(`✅ ${indexer} generated`);
    } catch (error) {
      console.error(`❌ Failed to generate ${indexer}:`, error);
      process.exit(1);
    }
  }
  
  console.log('✅ All indexers generated');
}

codegenAll();
```

### Validation Script

```typescript
// src/tooling/scripts/validate-config.ts
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { INDEXERS } from '../config/indexers';

function validateConfig(indexerName: string): boolean {
  const configPath = `src/indexers/${indexerName}/config.yaml`;
  
  try {
    const config = parse(readFileSync(configPath, 'utf-8'));
    
    // Validate required fields
    if (!config.name) {
      console.error(`❌ ${indexerName}: Missing 'name' field`);
      return false;
    }
    
    if (!config.networks || !Array.isArray(config.networks)) {
      console.error(`❌ ${indexerName}: Missing or invalid 'networks' field`);
      return false;
    }
    
    // Validate networks
    for (const network of config.networks) {
      if (!network.id) {
        console.error(`❌ ${indexerName}: Network missing 'id'`);
        return false;
      }
    }
    
    console.log(`✅ ${indexerName}: Config valid`);
    return true;
  } catch (error) {
    console.error(`❌ ${indexerName}: Error reading config:`, error);
    return false;
  }
}

function validateAll() {
  console.log('Validating all indexer configs...');
  const results = INDEXERS.map(validateConfig);
  const allValid = results.every(r => r);
  
  if (!allValid) {
    console.error('❌ Some configs are invalid');
    process.exit(1);
  }
  
  console.log('✅ All configs valid');
}

validateAll();
```

## Best Practices

### 1. Port Management
- ✅ Use consistent port mapping
- ✅ Document ports in README
- ✅ Use environment variables for production

### 2. Database Isolation
- ✅ Separate database per indexer
- ✅ Use connection pooling
- ✅ Monitor database size

### 3. Dependency Management
- ✅ Document indexer dependencies
- ✅ Start dependencies first
- ✅ Handle dependency failures gracefully

### 4. Error Handling
- ✅ Handle cross-indexer query failures
- ✅ Implement retries for effects
- ✅ Log errors with context

### 5. Monitoring
- ✅ Monitor each indexer separately
- ✅ Track cross-indexer query performance
- ✅ Alert on indexer failures

### 6. Development Workflow
- ✅ Start with core indexers (oToken, exchange-rates)
- ✅ Add dependent indexers incrementally
- ✅ Test cross-indexer communication

## Quick Reference

### Start All Indexers
```bash
pnpm dev:all
```

### Start Core Indexers Only
```bash
pnpm dev:core
```

### Generate Code for All
```bash
pnpm codegen:all
```

### Validate All Configs
```bash
pnpm validate:all
```

### Setup Databases
```bash
pnpm db:setup
```

### Deploy All
```bash
pnpm deploy:all
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check database is running
docker ps

# Check database logs
docker logs <container-name>
```

### Cross-Indexer Query Fails
- Ensure target indexer is running
- Check port configuration
- Verify GraphQL endpoint is accessible
- Check effect caching settings

## Conclusion

Managing multiple Envio indexers requires:
1. **Port management** - Each indexer needs unique port
2. **Database isolation** - Separate database per indexer
3. **Dependency management** - Start dependencies first
4. **Composability** - Use effects for cross-indexer queries
5. **Tooling** - Scripts for common operations

This setup enables scalable, maintainable multi-indexer architecture while ensuring indexers can work together effectively.

