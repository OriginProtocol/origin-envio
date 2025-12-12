# Origin Envio Indexers

Multi-indexer setup for Origin Protocol using [Envio](https://envio.dev) HyperIndex.

## Indexers

- **collector** - Token transfers and events
- **prices** - Price feed indexing
- **oToken** - oToken rebase and supply tracking

## Quick Start

### Prerequisites

- Node.js v20
- pnpm v9.7.1+
- Docker Desktop

### Local Development

```bash
# Install dependencies
pnpm install

# Generate code for all indexers
pnpm codegen

# Run a specific indexer
pnpm dev:collector
pnpm dev:prices
pnpm dev:oToken

# Or use Docker Compose (runs all indexers)
docker-compose up
```

Visit http://localhost:8080 (Hasura Console) - default password: `testing`

### Code Generation

After modifying `schema.graphql` or `config.yaml`:

```bash
# Generate for all indexers
pnpm codegen

# Generate for specific indexer
pnpm codegen:collector
pnpm codegen:prices
pnpm codegen:oToken
```

## Deployment

### Docker

Build and push Docker image via GitHub Actions on push to `main`:

```bash
# Image is built and pushed to GitHub Container Registry
ghcr.io/originprotocol/origin-envio:latest
```

## Project Structure

```
src/
├── indexers/
│   ├── collector/    # Token transfer indexer
│   ├── prices/      # Price feed indexer
│   └── oToken/      # oToken indexer
├── abis/            # Contract ABIs
├── constants/       # Shared constants
└── utils/           # Utility functions
```

## Documentation

- [Hasura Metadata Troubleshooting](./docs/RAILWAY_HASURA_METADATA.md)
- [Envio Documentation](https://docs.envio.dev)
