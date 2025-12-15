import { CommodityType } from './commodityEnums.js';

export const TransactionType = {
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  BUY_GOLD_ONLINE: "BUY_GOLD_ONLINE",
  BUY_SILVER_ONLINE: "BUY_SILVER_ONLINE",
  SELL_GOLD_ONLINE: "SELL_GOLD_ONLINE",
  SELL_SILVER_ONLINE: "SELL_SILVER_ONLINE",
  BUY_GOLD_PHYSICAL: "BUY_GOLD_PHYSICAL",
  BUY_SILVER_PHYSICAL: "BUY_SILVER_PHYSICAL",
  SELL_GOLD_PHYSICAL: "SELL_GOLD_PHYSICAL",
  SELL_SILVER_PHYSICAL: "SELL_SILVER_PHYSICAL",
};


export const TransactionStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};


export const TransactionTypeValues = Object.values(TransactionType);


export const TransactionStatusValues = Object.values(TransactionStatus);


export function getOnlineTradeType(action, commodity) {
  if (action === "BUY") {
    return commodity === CommodityType.GOLD ? TransactionType.BUY_GOLD_ONLINE : TransactionType.BUY_SILVER_ONLINE;
  } else if (action === "SELL") {
    return commodity === CommodityType.GOLD ? TransactionType.SELL_GOLD_ONLINE : TransactionType.SELL_SILVER_ONLINE;
  }
  throw new Error(`Invalid action: ${action}`);
}

