import responseBuilder from "../utils/responseBuilder.js";
import Model from "../models/index.js";
import mongoose from "mongoose";
import cryptography from "../utils/cryptography.js";
import ruleValidator from "../validators/index.js";
import Joi from "joi";
import Service from "../service/index.js";
export default {

    async getWallet(req, res) {
        try {
            const wallet = await Model.wallet.findOne({ userId: req.user.id });
            if (!wallet) {
                return responseBuilder.notFound(res, null, "Wallet not found");
            }
            return responseBuilder.success(res, wallet);
        } catch (err) {
            console.error("Get profile error:", err);
            return responseBuilder.internalErr(res);
        }
    },

    async deposit(req, res) {
        const lockKey = `lock:wallet:${req.user.id}`;
        const lockToken = await Service.redisMain.acquireLock(lockKey, 7000);

        if (!lockToken) {
            return responseBuilder.conflict(
                res,
                null,
                "Another wallet operation is in progress"
            );
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { amount } = await ruleValidator.wallet.schema.validateAsync(req.body);

            const wallet = await Model.wallet
                .findOne({ userId: req.user.id })
                .session(session);

            if (!wallet) {
                return responseBuilder.notFound(res, null, "Wallet not found");
            }

            const balanceBefore = wallet.balance;

            // Optimistic Locking: آپدیت فقط اگر __v تغییر نکرده باشد
            const updatedWallet = await Model.wallet.findOneAndUpdate(
                { _id: wallet._id, __v: wallet.__v },
                { $inc: { balance: amount, __v: 1 } },
                { new: true, session }
            );

            if (!updatedWallet) {
                throw new Error("Wallet was updated by another process. Try again.");
            }

            await Model.transaction.create(
                [{
                    userId: req.user.id,
                    type: "DEPOSIT",
                    status: "SUCCESS",
                    amount,
                    refId: cryptography.trackId(),
                    meta: {
                        reason: "Deposit by user",
                        balanceBefore,
                        balanceAfter: updatedWallet.balance,
                    },
                }],
                { session }
            );

            await session.commitTransaction();

            // ذخیره نتیجه در Redis برای Idempotency
            await Service.redisMain.setJSON(req.idempotencyKey, updatedWallet, 60 * 60 * 24);

            return responseBuilder.success(res, updatedWallet, "Deposit successful");

        } catch (err) {
            await session.abortTransaction();

            if (Joi.isError(err)) {
                return responseBuilder.badRequest(res, null, err.details[0].message);
            }

            console.error("Deposit error:", err);
            return responseBuilder.internalErr(res);

        } finally {
            session.endSession();
            await Service.redisMain.releaseLock(lockKey, lockToken);
        }
    },



    async withdraw(req, res) {
        const lockKey = `lock:wallet:${req.user.id}`;
        const lockToken = await Service.redisMain.acquireLock(lockKey, 7000);

        if (!lockToken) {
            return responseBuilder.conflict(
                res,
                null,
                "Another wallet operation is in progress"
            );
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { amount } = await ruleValidator.wallet.schema.validateAsync(req.body);

            // پیدا کردن ولت با session
            const wallet = await Model.wallet
                .findOne({ userId: req.user.id })
                .session(session);

            if (!wallet) {
                return responseBuilder.notFound(res, null, "Wallet not found");
            }

            if (wallet.balance < amount) {
                return responseBuilder.badRequest(res, null, "Insufficient balance");
            }

            const balanceBefore = wallet.balance;

            // Optimistic Locking: آپدیت فقط اگر __v تغییر نکرده باشد
            const updatedWallet = await Model.wallet.findOneAndUpdate(
                { _id: wallet._id, __v: wallet.__v }, // شرط نسخه
                {
                    $inc: { balance: -amount, lockedBalance: amount, __v: 1 } // افزایش نسخه
                },
                { new: true, session }
            );

            if (!updatedWallet) {
                throw new Error("Wallet was updated by another process. Try again.");
            }

            // ثبت تراکنش
            await Model.transaction.create(
                [{
                    userId: req.user.id,
                    type: "WITHDRAW",
                    status: "SUCCESS",
                    amount,
                    refId: cryptography.trackId(),
                    meta: {
                        reason: "Withdraw by user",
                        balanceBefore,
                        balanceAfter: updatedWallet.balance,
                    },
                }],
                { session }
            );

            await session.commitTransaction();

            // Idempotency: ذخیره نتیجه در Redis
            await Service.redisMain.setJSON(req.idempotencyKey, updatedWallet, 60 * 60 * 24);

            return responseBuilder.success(res, updatedWallet, "Withdraw successful");

        } catch (err) {
            await session.abortTransaction();

            if (Joi.isError(err)) {
                return responseBuilder.badRequest(res, null, err.details[0].message);
            }

            console.error("Withdraw error:", err);
            return responseBuilder.internalErr(res);

        } finally {
            session.endSession();
            await Service.redisMain.releaseLock(lockKey, lockToken);
        }
    }

}