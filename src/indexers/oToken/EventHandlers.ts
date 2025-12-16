import { ZERO_ADDRESS } from '../../constants/addresses';
import {
  generateOTokenActivityId,
  generateOTokenAddressId,
  generateOTokenHistoryId,
  generateOTokenId,
  generateOTokenRebaseId,
  generateOTokenWithdrawalRequestId,
} from '../../utils/compositeIds';
import { getTokenByAddress } from '../../utils/getToken';
import { OToken, OTokenVault } from './generated';
import { calculateRebase } from './oTokenRebase';

OToken.Transfer.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const tokenAddress = event.srcAddress.toLowerCase();
  const from = event.params.from.toLowerCase();
  const to = event.params.to.toLowerCase();
  const value = event.params.value;

  // Get token info
  const token = getTokenByAddress(tokenAddress, chainId);
  if (!token) {
    return;
  }

  // Skip zero transfers
  if (value === 0n) {
    return;
  }

  const timestamp = BigInt(event.block.timestamp);

  // Get or create OToken entity
  const otokenId = generateOTokenId(chainId, tokenAddress);
  let otoken = await context.OToken.get(otokenId);

  if (!otoken) {
    otoken = {
      id: otokenId,
      chainId,
      address: tokenAddress,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      totalSupply: 0n,
      rebasingSupply: 0n,
      nonRebasingSupply: 0n,
      creditsPerToken: 0n,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  // Update OToken total supply if needed (mint/burn)
  if (from === ZERO_ADDRESS) {
    // Mint
    const updatedOToken = {
      ...otoken,
      totalSupply: otoken.totalSupply + value,
      updatedAt: timestamp,
    };
    context.OToken.set(updatedOToken);
  } else if (to === ZERO_ADDRESS) {
    // Burn
    const updatedOToken = {
      ...otoken,
      totalSupply: otoken.totalSupply - value,
      updatedAt: timestamp,
    };
    context.OToken.set(updatedOToken);
  }

  // Update from address balance
  if (from !== ZERO_ADDRESS) {
    const fromAddressId = generateOTokenAddressId(chainId, tokenAddress, from);
    const fromAddress = await context.OTokenAddress.get(fromAddressId);

    if (fromAddress) {
      const updatedFromAddress = {
        ...fromAddress,
        balance: fromAddress.balance - value,
        updatedAt: timestamp,
      };
      context.OTokenAddress.set(updatedFromAddress);
    }
  }

  // Update to address balance
  if (to !== ZERO_ADDRESS) {
    const toAddressId = generateOTokenAddressId(chainId, tokenAddress, to);
    let toAddress = await context.OTokenAddress.get(toAddressId);

    if (!toAddress) {
      toAddress = {
        id: toAddressId,
        chainId,
        otoken: tokenAddress,
        address: to,
        balance: 0n,
        credits: 0n,
        rebasingCreditsPerToken: otoken.creditsPerToken,
        nonRebasingCreditsPerToken: otoken.creditsPerToken,
        rebasingOption: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }

    const updatedToAddress = {
      ...toAddress,
      balance: toAddress.balance + value,
      updatedAt: timestamp,
    };
    context.OTokenAddress.set(updatedToAddress);
  }

  // Create history record for from address
  if (from !== ZERO_ADDRESS) {
    const fromHistoryId = generateOTokenHistoryId(
      chainId,
      event.transaction.hash,
      event.logIndex,
    );
    const fromAddress = await context.OTokenAddress.get(
      generateOTokenAddressId(chainId, tokenAddress, from),
    );

    context.History.set({
      id: fromHistoryId,
      chainId,
      otoken: tokenAddress,
      address: from,
      transactionHash: event.transaction.hash,
      blockNumber: BigInt(event.block.number),
      timestamp,
      eventType: 'Transfer',
      amount: -value,
      balance: fromAddress?.balance || 0n,
      credits: fromAddress?.credits || 0n,
      logIndex: event.logIndex,
    });
  }

  // Create history record for to address
  if (to !== ZERO_ADDRESS) {
    const toHistoryId = generateOTokenHistoryId(
      chainId,
      event.transaction.hash,
      event.logIndex,
    );
    const toAddress = await context.OTokenAddress.get(
      generateOTokenAddressId(chainId, tokenAddress, to),
    );

    context.History.set({
      id: toHistoryId,
      chainId,
      otoken: tokenAddress,
      address: to,
      transactionHash: event.transaction.hash,
      blockNumber: BigInt(event.block.number),
      timestamp,
      eventType: 'Transfer',
      amount: value,
      balance: toAddress?.balance || 0n,
      credits: toAddress?.credits || 0n,
      logIndex: event.logIndex,
    });
  }

  // Create activity record
  const activityId = generateOTokenActivityId(
    chainId,
    event.transaction.hash,
    event.logIndex,
  );

  context.Activity.set({
    id: activityId,
    chainId,
    otoken: tokenAddress,
    transactionHash: event.transaction.hash,
    blockNumber: BigInt(event.block.number),
    timestamp,
    activityType: 'Transfer',
    from: from === ZERO_ADDRESS ? undefined : from,
    to: to === ZERO_ADDRESS ? undefined : to,
    amount: value,
    logIndex: event.logIndex,
  });
});

OToken.Rebase.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const tokenAddress = event.srcAddress.toLowerCase();
  const epoch = event.params.epoch;
  const totalSupply = event.params.totalSupply;
  const rebasingSupply = event.params.rebasingSupply;
  const nonRebasingSupply = event.params.nonRebasingSupply;

  // Get token info
  const token = getTokenByAddress(tokenAddress, chainId);
  if (!token) {
    return;
  }

  const timestamp = BigInt(event.block.timestamp);

  // Get current OToken state
  const otokenId = generateOTokenId(chainId, tokenAddress);
  const otoken = await context.OToken.get(otokenId);

  const previousTotalSupply = otoken?.totalSupply || 0n;

  // Calculate rebase data
  const rebaseData = calculateRebase(
    totalSupply,
    rebasingSupply,
    nonRebasingSupply,
    previousTotalSupply,
    0n, // Fee percentage - should be fetched from contract if available
  );

  // Update or create OToken entity
  const updatedOToken = {
    id: otokenId,
    chainId,
    address: tokenAddress,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    totalSupply: rebaseData.totalSupply,
    rebasingSupply: rebaseData.rebasingSupply,
    nonRebasingSupply: rebaseData.nonRebasingSupply,
    creditsPerToken: rebaseData.creditsPerToken,
    createdAt: otoken?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  context.OToken.set(updatedOToken);

  // Create rebase record
  const rebaseId = generateOTokenRebaseId(
    chainId,
    event.block.number,
    event.logIndex,
  );

  context.Rebase.set({
    id: rebaseId,
    chainId,
    otoken: tokenAddress,
    epoch,
    blockNumber: BigInt(event.block.number),
    timestamp,
    totalSupply: rebaseData.totalSupply,
    rebasingSupply: rebaseData.rebasingSupply,
    nonRebasingSupply: rebaseData.nonRebasingSupply,
    creditsPerToken: rebaseData.creditsPerToken,
    rebaseYield: rebaseData.rebaseYield,
    fees: rebaseData.fees,
    transactionHash: event.transaction.hash,
    logIndex: event.logIndex,
  });
});

OTokenVault.WithdrawalRequested.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const otoken = event.srcAddress.toLowerCase();
  const withdrawer = event.params.withdrawer.toLowerCase();
  const requestId = BigInt(event.params.requestId);
  const amount = BigInt(event.params.amount);
  const queued = BigInt(event.params.queued);
  const timestamp = BigInt(event.block.timestamp);
  const hash = event.transaction.hash;

  const extraBytes = event.transaction.input.slice(74);
  let queueWait: bigint | undefined;
  if (extraBytes.length > 0) {
    queueWait = BigInt('0x' + extraBytes);
  }

  context.WithdrawalRequest.set({
    id: generateOTokenWithdrawalRequestId(chainId, otoken, requestId),
    chainId,
    otoken,
    withdrawer,
    requestId,
    amount,
    queued,
    claimed: false,
    queueWait,
    createdAt: timestamp,
    updatedAt: timestamp,
    hash,
  });
});

OTokenVault.WithdrawalClaimed.handler(async ({ event, context }) => {
  const chainId = event.chainId;
  const otoken = event.srcAddress.toLowerCase();
  const requestId = BigInt(event.params.requestId);

  const request = await context.WithdrawalRequest.get(
    generateOTokenWithdrawalRequestId(chainId, otoken, requestId),
  );
  if (!request) {
    return;
  }

  context.WithdrawalRequest.set({
    ...request,
    claimed: true,
    updatedAt: BigInt(event.block.timestamp),
  });
});
