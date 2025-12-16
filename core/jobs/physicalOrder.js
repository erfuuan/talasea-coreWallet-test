import Order from "../models/order.js";
import Wallet from "../models/wallet.js";
import Asset from "../models/asset.js";
import Transaction from "../models/transaction.js";
import Product from "../models/product.js";
import { OrderSide, OrderStatus } from "../enum/orderEnums.js";
import { TransactionType, TransactionStatus } from "../enum/transactionEnums.js";
import { CommodityType } from "../enum/commodityEnums.js";
import logger from "../utils/Logger.js";

async function confirmBuyOrder(order) {
    const wallet = await Wallet.findOne({ userId: order.userId });
    if (!wallet) throw new Error("Wallet not found");

    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product not found");

    const totalPrice = order.totalPrice || (order.grams * order.pricePerUnit);

    const availableBalance = (wallet.balance || 0) + (wallet.lockedBalance || 0);
    if (availableBalance < totalPrice) {
        throw new Error("Insufficient balance");
    }

    const lockedAmount = wallet.lockedBalance || 0;
    const remainingToDeduct = totalPrice - lockedAmount;

    wallet.lockedBalance = 0;
    wallet.balance = (wallet.balance || 0) - remainingToDeduct;

    // Use findOneAndUpdate with upsert to avoid race condition and duplicate key errors
    // $inc will increment amount, and if asset doesn't exist, MongoDB will create it with amount = order.grams
    // $setOnInsert only sets fields when creating new document
    const asset = await Asset.findOneAndUpdate(
        {
            userId: order.userId,
            productId: order.productId,
        },
        {
            $inc: { amount: order.grams },
            $setOnInsert: {
                userId: order.userId,
                productId: order.productId,
                lockedAmount: 0,
            }
        },
        {
            upsert: true,
            new: true,
        }
    );

    const balanceBefore = (wallet.balance || 0) + lockedAmount;
    await wallet.save();

    const transactionType = product.type === CommodityType.GOLD
        ? TransactionType.BUY_GOLD_PHYSICAL
        : TransactionType.BUY_SILVER_PHYSICAL;

    await Transaction.create({
        userId: order.userId,
        productId: order.productId,
        type: transactionType,
        status: TransactionStatus.SUCCESS,
        amount: order.grams,
        refId: order._id.toString(),
        meta: {
            pricePerUnit: order.pricePerUnit,
            totalPrice: totalPrice,
            balanceBefore: balanceBefore,
            balanceAfter: wallet.balance,
            assetBefore: asset.amount - order.grams,
            assetAfter: asset.amount,
        },
    });

    order.status = OrderStatus.CONFIRMED;
    order.confirmedAt = new Date();
    await order.save();

    logger.info(`✅ Buy order confirmed: Order ${order._id}, User ${order.userId}, ${order.grams}g, Total: ${totalPrice}`);
}

async function confirmSellOrder(order) {
    const wallet = await Wallet.findOne({ userId: order.userId });
    if (!wallet) throw new Error("Wallet not found");

    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product not found");

    // Note: Asset was already deleted when the sell order was created in sellAsset()
    // So we don't need to check or modify the asset here, just credit the wallet

    const totalPrice = order.totalPrice || (order.grams * order.pricePerUnit);

    const balanceBefore = wallet.balance || 0;
    wallet.balance = balanceBefore + totalPrice;

    await wallet.save();

    const transactionType = product.type === CommodityType.GOLD
        ? TransactionType.SELL_GOLD_PHYSICAL
        : TransactionType.SELL_SILVER_PHYSICAL;

    await Transaction.create({
        userId: order.userId,
        productId: order.productId,
        type: transactionType,
        status: TransactionStatus.SUCCESS,
        amount: order.grams,
        refId: order._id.toString(),
        meta: {
            pricePerUnit: order.pricePerUnit,
            totalPrice: totalPrice,
            balanceBefore: balanceBefore,
            balanceAfter: wallet.balance,
            assetBefore: order.grams, // Asset was already deleted, so before was the order amount
            assetAfter: 0, // Asset is now 0 since it was deleted
        },
    });

    order.status = OrderStatus.CONFIRMED;
    order.confirmedAt = new Date();
    await order.save();

    logger.info(`✅ Sell order confirmed: Order ${order._id}, User ${order.userId}, ${order.grams}g, Total: ${totalPrice}`);
}


export function startJobs() {
    logger.info('🚀 Jobs started');
    setInterval(async () => {
        try {
            logger.info('⏳ Checking pending orders...');
            const orders = await Order.find({
                status: OrderStatus.PENDING,
                expiresAt: { $gt: new Date() }
            });
            logger.info('🔍 Found orders:', orders.length);

            for (const order of orders) {
                try {
                    if (order.side === OrderSide.BUY) {
                        await confirmBuyOrder(order);
                    } else if (order.side === OrderSide.SELL) {
                        await confirmSellOrder(order);
                    }
                } catch (e) {
                    order.status = OrderStatus.FAILED;
                    await order.save();
                    logger.error("Error confirming order", e);
                }
            }

            const expiredOrders = await Order.find({
                status: OrderStatus.PENDING,
                expiresAt: { $lte: new Date() }
            });

            for (const order of expiredOrders) {
                order.status = OrderStatus.FAILED;
                await order.save();
            }

        } catch (err) {
            logger.error('❌ Job error:', err);
        }
    }, 4000);
}
