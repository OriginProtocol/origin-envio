import { mainnet } from 'viem/chains';

import { tokenList } from '../constants/tokens';

import type { Token } from '../constants/tokens';

export const getTokenByAddress = (
  address: string,
  chainId: number,
): Token | undefined => {
  return tokenList.find(
    (t) =>
      t.address.toLowerCase() === address.toLowerCase() &&
      t.chainId.toString() === chainId.toString(),
  );
};

export const getToken = (
  symbol: string,
  chainId?: number | string,
): Token | undefined => {
  if (symbol === undefined || symbol === null || symbol === '') {
    return undefined;
  }

  let filtered = [];
  let chainFiltered = [];

  if (symbol.match(/^[0-9]+:[-_a-zA-Z]+$/)) {
    const [chainIdStr, symbolStr] = symbol.split(':');

    return getToken(symbolStr, chainIdStr);
  }

  if (chainId === undefined) {
    filtered = tokenList.filter(
      (t) => t.symbol.toLowerCase() === symbol.toLowerCase(),
    );

    if (filtered.length === 0) {
      return undefined;
    }

    if (filtered.length === 1) {
      return filtered[0];
    }

    chainFiltered = filtered.filter(
      (t) => t.chainId.toString() === mainnet.id.toString(),
    );

    if (chainFiltered.length === 0) {
      return undefined;
    }

    if (chainFiltered.length === 1) {
      return chainFiltered[0];
    }
  } else {
    filtered = tokenList.filter(
      (t) =>
        t.symbol.toLowerCase() === symbol.toLowerCase() &&
        t.chainId.toString() === chainId.toString(),
    );

    if (filtered.length === 0) {
      return undefined;
    }

    if (filtered.length === 1) {
      return filtered[0];
    }
  }

  return undefined;
};
