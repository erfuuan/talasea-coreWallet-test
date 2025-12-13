import Models from "../models/index.js";
import responseBuilder from "../utils/responseBuilder.js";
import mongoose from "mongoose";
import ruleValidator from "../validators/index.js";
import Joi from "joi";
import cryptography from "../utils/cryptography.js";
import Service from "../service/index.js";
export default {

    async getAsset(req, res) {
        try {
            const asset = await Models.asset.findOne({ userId: req.user.id, type: req.query.type });
            if (!asset) return responseBuilder.notFound(res, null, "Asset not found");
            return responseBuilder.success(res, asset);
        } catch (err) {
            console.error("Get asset error:", err);
            return responseBuilder.internalErr(res);
        }
    },


    async buyAsset(req, res) {
        const lockKey = `lock:buy-asset:${req.user.id}`;
        const lockToken = await Service.redisMain.acquireLock(lockKey, 8000);

        if (!lockToken) {
            return responseBuilder.conflict(
                res,
                null,
                "Another asset operation is in progress"
            );
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { type, grams, pricePerUnit, karat } =
                await ruleValidator.asset.schema.validateAsync(req.body);

            const wallet = await Models.wallet
                .findOne({ userId: req.user.id })
                .session(session);

            if (!wallet) {
                return responseBuilder.notFound(res, null, "Wallet not found");
            }

            const totalPrice = grams * pricePerUnit;

            if (wallet.balance < totalPrice) {
                return responseBuilder.badRequest(res, null, "Insufficient wallet balance");
            }

            // پیدا کردن یا ایجاد دارایی
            let asset = await Models.asset
                .findOne({ userId: req.user.id, type, karat })
                .session(session);

            if (!asset) {
                asset = await Models.asset.create(
                    [{ userId: req.user.id, type, karat, amount: 0 }],
                    { session }
                );
                asset = asset[0];
            }

            const walletBefore = wallet.balance;
            const assetBefore = asset.amount;

            // Optimistic Locking برای wallet
            const updatedWallet = await Models.wallet.findOneAndUpdate(
                { _id: wallet._id, __v: wallet.__v },
                { $inc: { balance: -totalPrice, __v: 1 } },
                { new: true, session }
            );

            if (!updatedWallet) {
                throw new Error("Wallet was updated by another process. Try again.");
            }

            // Optimistic Locking برای asset
            const updatedAsset = await Models.asset.findOneAndUpdate(
                { _id: asset._id, __v: asset.__v },
                { $inc: { amount: grams, __v: 1 } },
                { new: true, session }
            );

            if (!updatedAsset) {
                throw new Error("Asset was updated by another process. Try again.");
            }

            await Models.transaction.create(
                [{
                    userId: req.user.id,
                    type: `BUY_${type.toUpperCase()}`,
                    status: "SUCCESS",
                    amount: totalPrice,
                    refId: cryptography.trackId(),
                    meta: {
                        grams,
                        pricePerUnit,
                        totalPrice,
                        karat,
                        walletBefore,
                        walletAfter: updatedWallet.balance,
                        assetBefore,
                        assetAfter: updatedAsset.amount,
                    },
                }],
                { session }
            );

            await session.commitTransaction();
            await Service.redisMain.setJSON(req.idempotencyKey, updatedAsset, 60 * 60 * 24);

            return responseBuilder.success(res, updatedAsset, `${type} purchased successfully`);

        } catch (err) {
            await session.abortTransaction();

            if (Joi.isError(err)) {
                return responseBuilder.badRequest(res, null, err.details[0].message);
            }

            console.error("Buy asset error:", err);
            return responseBuilder.internalErr(res);

        } finally {
            session.endSession();
            await Service.redisMain.releaseLock(lockKey, lockToken);
        }
    },



    async sellAsset(req, res) {
        const lockKey = `lock:sell-asset:${req.user.id}`;
        const lockToken = await Service.redisMain.acquireLock(lockKey, 8000);

        if (!lockToken) {
            return responseBuilder.conflict(
                res,
                null,
                "Another asset operation is in progress"
            );
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { type, grams, pricePerUnit, karat } =
                await ruleValidator.asset.schema.validateAsync(req.body);

            // پیدا کردن دارایی
            let asset = await Models.asset
                .findOne({ userId: req.user.id, type, karat })
                .session(session);

            if (!asset || asset.amount < grams) {
                return responseBuilder.badRequest(res, null, "Insufficient asset balance");
            }

            // پیدا کردن کیف پول
            const wallet = await Models.wallet
                .findOne({ userId: req.user.id })
                .session(session);

            if (!wallet) {
                return responseBuilder.notFound(res, null, "Wallet not found");
            }

            const totalPrice = grams * pricePerUnit;
            const walletBefore = wallet.balance;
            const assetBefore = asset.amount;

            // Optimistic Locking برای asset
            const updatedAsset = await Models.asset.findOneAndUpdate(
                { _id: asset._id, __v: asset.__v, amount: { $gte: grams } },
                { $inc: { amount: -grams, __v: 1 } },
                { new: true, session }
            );

            if (!updatedAsset) {
                throw new Error("Asset was updated by another process or insufficient balance. Try again.");
            }

            // Optimistic Locking برای wallet
            const updatedWallet = await Models.wallet.findOneAndUpdate(
                { _id: wallet._id, __v: wallet.__v },
                { $inc: { balance: totalPrice, __v: 1 } },
                { new: true, session }
            );

            if (!updatedWallet) {
                throw new Error("Wallet was updated by another process. Try again.");
            }

            // ثبت تراکنش
            await Models.transaction.create(
                [{
                    userId: req.user.id,
                    type: `SELL_${type.toUpperCase()}`,
                    status: "SUCCESS",
                    amount: totalPrice,
                    refId: cryptography.trackId(),
                    meta: {
                        grams,
                        pricePerUnit,
                        totalPrice,
                        karat,
                        walletBefore,
                        walletAfter: updatedWallet.balance,
                        assetBefore,
                        assetAfter: updatedAsset.amount,
                    }
                }],
                { session }
            );

            await session.commitTransaction();
            await Service.redisMain.setJSON(req.idempotencyKey, updatedAsset, 60 * 60 * 24);

            return responseBuilder.success(res, updatedAsset, `${type} sold successfully`);

        } catch (err) {
            await session.abortTransaction();

            if (Joi.isError(err)) {
                return responseBuilder.badRequest(res, null, err.details[0].message);
            }

            console.error("Sell asset error:", err);
            return responseBuilder.internalErr(res);

        } finally {
            session.endSession();
            await Service.redisMain.releaseLock(lockKey, lockToken);
        }
    }




}