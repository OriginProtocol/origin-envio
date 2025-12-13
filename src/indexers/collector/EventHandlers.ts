import { getTokenByAddress } from '../../utils/getToken';
import { ERC20 } from './generated';

const COLLECTOR_ADDRESS = '0x67ce815d91de0f843472fe9c171acb036994cd05';

ERC20.Transfer.handler(
  async ({ event, context }) => {
    const token = getTokenByAddress(event.srcAddress, event.chainId);

    if (token === undefined) {
      return;
    }

    const tokenEntity = await context.Token.get(token.id);
    if (tokenEntity === undefined) {
      context.Token.set({
        id: token.id,
        address: event.srcAddress,
        symbol: token.symbol,
        decimals: token.decimals,
      });
    }

    try {
      context.Transfer.set({
        id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
        from: event.params.from,
        to: event.params.to,
        value: event.params.value,
        timestamp: event.block.timestamp,
        txHash: event.transaction.hash,
        token_id: token.id,
      });
    } catch (e) {
      context.log.error(`Error in Transfer handler: ${e}`);
    }
  },
  {
    wildcard: true,
    eventFilters: [{ to: COLLECTOR_ADDRESS }, { from: COLLECTOR_ADDRESS }],
  },
);
