/**
 * Rebase calculation utilities for OTokens
 */

/**
 * Calculate credits per token from rebase parameters
 */
export function calculateCreditsPerToken(
  totalSupply: bigint,
  rebasingSupply: bigint,
  nonRebasingSupply: bigint,
): bigint {
  if (totalSupply === 0n) {
    return 0n;
  }

  // Credits per token is typically calculated as:
  // creditsPerToken = (totalSupply * 1e18) / rebasingSupply
  // For simplicity, we'll use a 1:1 ratio initially
  // This should be updated based on actual OToken contract logic
  return rebasingSupply > 0n
    ? (totalSupply * 1000000000000000000n) / rebasingSupply
    : 0n;
}

/**
 * Calculate yield from rebase
 * Yield = new totalSupply - previous totalSupply
 */
export function calculateRebaseYield(
  newTotalSupply: bigint,
  previousTotalSupply: bigint,
): bigint {
  if (newTotalSupply > previousTotalSupply) {
    return newTotalSupply - previousTotalSupply;
  }
  return 0n;
}

/**
 * Calculate fees from rebase
 * This is typically a percentage of the yield
 * Fee calculation should match the actual OToken contract logic
 */
export function calculateRebaseFees(
  rebaseYield: bigint,
  feePercentage: bigint = 0n,
): bigint {
  if (feePercentage === 0n) {
    return 0n;
  }
  // Fee percentage is typically in basis points (e.g., 100 = 1%)
  return (rebaseYield * feePercentage) / 10000n;
}

/**
 * Rebase data structure
 */
export interface RebaseData {
  totalSupply: bigint;
  rebasingSupply: bigint;
  nonRebasingSupply: bigint;
  creditsPerToken: bigint;
  rebaseYield: bigint;
  fees: bigint;
}

/**
 * Calculate rebase data from event parameters
 */
export function calculateRebase(
  totalSupply: bigint,
  rebasingSupply: bigint,
  nonRebasingSupply: bigint,
  previousTotalSupply: bigint = 0n,
  feePercentage: bigint = 0n,
): RebaseData {
  const creditsPerToken = calculateCreditsPerToken(
    totalSupply,
    rebasingSupply,
    nonRebasingSupply,
  );
  const rebaseYield = calculateRebaseYield(totalSupply, previousTotalSupply);
  const fees = calculateRebaseFees(rebaseYield, feePercentage);

  return {
    totalSupply,
    rebasingSupply,
    nonRebasingSupply,
    creditsPerToken,
    rebaseYield,
    fees,
  };
}

