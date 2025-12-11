/**
 * Indexer configuration
 * Defines all indexers and their metadata
 */

export const INDEXERS = [
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
] as const;

export type IndexerName = (typeof INDEXERS)[number];

export const INDEXER_PORTS: Record<IndexerName, number> = {
  oToken: 8080,
  strategies: 8081,
  governance: 8082,
  staking: 8083,
  arm: 8084,
  pools: 8085,
  erc20: 8086,
  bridges: 8087,
  'exchange-rates': 8088,
  'protocol-stats': 8089,
  'mainnet-misc': 8090,
  'sonic-misc': 8091,
} as const;

export const INDEXER_DEPENDENCIES: Record<IndexerName, readonly IndexerName[]> =
  {
    oToken: [],
    strategies: ['oToken'],
    governance: [],
    staking: [],
    arm: [],
    pools: [],
    erc20: [],
    bridges: [],
    'exchange-rates': [],
    'protocol-stats': [
      'oToken',
      'strategies',
      'governance',
      'staking',
      'arm',
      'pools',
    ],
    'mainnet-misc': [],
    'sonic-misc': [],
  } as const;

export function getIndexerPort(indexerName: IndexerName): number {
  return INDEXER_PORTS[indexerName];
}

export function getDependencies(
  indexerName: IndexerName,
): readonly IndexerName[] {
  return INDEXER_DEPENDENCIES[indexerName] || [];
}

export function getGraphQLEndpoint(indexerName: IndexerName): string {
  const port = getIndexerPort(indexerName);
  return `http://localhost:${port}/v1/graphql`;
}
