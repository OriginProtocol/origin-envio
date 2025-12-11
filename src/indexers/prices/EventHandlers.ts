/* eslint-disable @typescript-eslint/no-explicit-any */
import { toNumber } from 'dnum';

import {
  AERO_8453_USD_Aggregator,
  ETH_1_USD_Aggregator,
  ETH_146_USD_Aggregator,
  ETH_8453_USD_Aggregator,
  OETH_1_ETH_1_Aggregator,
  OGN_8453_USD_Aggregator,
  OS_146_S_146_Aggregator,
  S_146_USD_Aggregator,
  USDC_1_USD_Aggregator,
  USDC_8453_USD_Aggregator,
  USDT_1_USD_Aggregator,
} from './generated';

const priceHandler =
  (pair: string, decimal: number, chain_id: number) =>
  async ({ event, context }: { event: any; context: any }) => {
    const id = `${pair}-${event.params.roundId}`;
    const value = toNumber([event.params.current, decimal]);
    const timestamp = Number(event.params.updatedAt);
    const block = event.block.number;

    context.OraclePrice.set({
      id,
      pair,
      value,
      timestamp,
      block,
      chain_id,
    });
  };

USDC_1_USD_Aggregator.AnswerUpdated.handler(priceHandler('1:USDC_USD', 8, 1));
ETH_1_USD_Aggregator.AnswerUpdated.handler(priceHandler('1:ETH_USD', 8, 1));
USDT_1_USD_Aggregator.AnswerUpdated.handler(priceHandler('1:USDT_USD', 8, 1));
OETH_1_ETH_1_Aggregator.AnswerUpdated.handler(
  priceHandler('1:OETH_ETH', 18, 1),
);
ETH_8453_USD_Aggregator.AnswerUpdated.handler(
  priceHandler('8453:ETH_USD', 8, 8453),
);
AERO_8453_USD_Aggregator.AnswerUpdated.handler(
  priceHandler('8453:AERO_USD', 8, 8453),
);
OGN_8453_USD_Aggregator.AnswerUpdated.handler(
  priceHandler('8453:OGN_USD', 8, 8453),
);
USDC_8453_USD_Aggregator.AnswerUpdated.handler(
  priceHandler('8453:USDC_USD', 8, 8453),
);
ETH_146_USD_Aggregator.AnswerUpdated.handler(
  priceHandler('146:ETH_USD', 8, 146),
);
S_146_USD_Aggregator.AnswerUpdated.handler(priceHandler('146:S_USD', 8, 146));
OS_146_S_146_Aggregator.AnswerUpdated.handler(
  priceHandler('146:OS_146:S', 18, 146),
);
