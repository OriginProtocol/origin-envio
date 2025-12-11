/**
 * Supply tracking utilities for OTokens
 */

/**
 * Update OToken supply from rebase event
 */
export function updateSupplyFromRebase(
  currentTotalSupply: bigint,
  currentRebasingSupply: bigint,
  currentNonRebasingSupply: bigint,
  newTotalSupply: bigint,
  newRebasingSupply: bigint,
  newNonRebasingSupply: bigint,
): {
  totalSupply: bigint;
  rebasingSupply: bigint;
  nonRebasingSupply: bigint;
} {
  return {
    totalSupply: newTotalSupply,
    rebasingSupply: newRebasingSupply,
    nonRebasingSupply: newNonRebasingSupply,
  };
}

/**
 * Calculate balance from credits and credits per token
 */
export function calculateBalanceFromCredits(
  credits: bigint,
  creditsPerToken: bigint,
): bigint {
  if (creditsPerToken === 0n) {
    return 0n;
  }
  return (credits * creditsPerToken) / 1000000000000000000n;
}

/**
 * Calculate credits from balance and credits per token
 */
export function calculateCreditsFromBalance(
  balance: bigint,
  creditsPerToken: bigint,
): bigint {
  if (creditsPerToken === 0n) {
    return 0n;
  }
  return (balance * 1000000000000000000n) / creditsPerToken;
}

