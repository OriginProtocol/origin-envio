/**
 * ID generation utilities for composite entity IDs
 * All IDs include chainId to prevent collisions across chains
 */

/**
 * Generate OToken entity ID
 * Format: chainId:address
 */
export function generateOTokenId(chainId: number, address: string): string {
  return `${chainId}:${address.toLowerCase()}`;
}

/**
 * Generate OTokenAddress entity ID
 * Format: chainId:otoken:address
 */
export function generateOTokenAddressId(
  chainId: number,
  otoken: string,
  address: string,
): string {
  return `${chainId}:${otoken.toLowerCase()}:${address.toLowerCase()}`;
}

/**
 * Generate OTokenRebase entity ID
 * Format: chainId:blockNumber:logIndex
 */
export function generateOTokenRebaseId(
  chainId: number,
  blockNumber: number,
  logIndex: number,
): string {
  return `${chainId}:${blockNumber}:${logIndex}`;
}

/**
 * Generate OTokenHistory entity ID
 * Format: chainId:transactionHash:logIndex
 */
export function generateOTokenHistoryId(
  chainId: number,
  transactionHash: string,
  logIndex: number,
): string {
  return `${chainId}:${transactionHash.toLowerCase()}:${logIndex}`;
}

/**
 * Generate OTokenAPY entity ID
 * Format: chainId:otoken:date
 */
export function generateOTokenAPYId(
  chainId: number,
  otoken: string,
  date: string,
): string {
  return `${chainId}:${otoken.toLowerCase()}:${date}`;
}

/**
 * Generate OTokenDailyStat entity ID
 * Format: chainId:otoken:date
 */
export function generateOTokenDailyStatId(
  chainId: number,
  otoken: string,
  date: string,
): string {
  return `${chainId}:${otoken.toLowerCase()}:${date}`;
}

/**
 * Generate OTokenActivity entity ID
 * Format: chainId:transactionHash:logIndex
 */
export function generateOTokenActivityId(
  chainId: number,
  transactionHash: string,
  logIndex: number,
): string {
  return `${chainId}:${transactionHash.toLowerCase()}:${logIndex}`;
}

/**
 * Generate OTokenWithdrawalRequest entity ID
 * Format: chainId:otoken:requestId
 */
export function generateOTokenWithdrawalRequestId(
  chainId: number,
  otoken: string,
  requestId: bigint,
): string {
  return `${chainId}:${otoken.toLowerCase()}:${requestId.toString()}`;
}

/**
 * Generate WOToken entity ID
 * Format: chainId:address
 */
export function generateWOTokenId(chainId: number, address: string): string {
  return `${chainId}:${address.toLowerCase()}`;
}

/**
 * Generate OTokenVault entity ID
 * Format: chainId:otoken:blockNumber
 */
export function generateOTokenVaultId(
  chainId: number,
  otoken: string,
  blockNumber: number,
): string {
  return `${chainId}:${otoken.toLowerCase()}:${blockNumber}`;
}

/**
 * Generate OTokenDripperState entity ID
 * Format: chainId:otoken:dripperAddress:blockNumber
 */
export function generateOTokenDripperStateId(
  chainId: number,
  otoken: string,
  dripperAddress: string,
  blockNumber: number,
): string {
  return `${chainId}:${otoken.toLowerCase()}:${dripperAddress.toLowerCase()}:${blockNumber}`;
}

