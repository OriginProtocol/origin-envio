# Quick Start Guide
## Running Multiple Envio Indexers

## Prerequisites

- Node.js v20
- pnpm v8+
- Docker Desktop

## Setup

```bash
# Install dependencies
pnpm install

# Start databases
docker-compose -f docker-compose.dev.yml up -d

# Generate code for all indexers
pnpm codegen:all

# Type check
pnpm typecheck
```

## Running Indexers

### Option 1: Run All Indexers (Recommended)

```bash
# Install concurrently if not already installed
pnpm add -D concurrently

# Run all indexers
pnpm dev:all
```

### Option 2: Run Individual Indexers

```bash
# Terminal 1
pnpm oToken:dev

# Terminal 2
pnpm strategies:dev

# Terminal 3
pnpm exchange-rates:dev
```

## Accessing GraphQL Endpoints

| Indexer | Port | GraphQL Endpoint |
|---------|------|-----------------|
| oToken | 8080 | http://localhost:8080/v1/graphql |
| strategies | 8081 | http://localhost:8081/v1/graphql |
| governance | 8082 | http://localhost:8082/v1/graphql |
| exchange-rates | 8088 | http://localhost:8088/v1/graphql |

## Common Commands

```bash
# Generate code for all indexers
pnpm codegen:all

# Validate all configs
pnpm validate:all

# Type check
pnpm typecheck

# Start databases
docker-compose -f docker-compose.dev.yml up -d

# Stop databases
docker-compose -f docker-compose.dev.yml down
```

## Next Steps

- Read [MULTI_INDEXER_MANAGEMENT.md](./MULTI_INDEXER_MANAGEMENT.md) for detailed information
- Read [ARCHITECTURE_PROPOSAL.md](./ARCHITECTURE_PROPOSAL.md) for architecture details
- Read [ARCHITECTURE_QUICK_REFERENCE.md](./ARCHITECTURE_QUICK_REFERENCE.md) for development patterns

