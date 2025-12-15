import mongoose from "mongoose";
import { OrderSideValues, OrderTypeValues, OrderStatusValues, OrderType, OrderStatus } from "../enum/orderEnums.js";

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true
    },
    side: {
        type: String,
        enum: OrderSideValues,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: OrderTypeValues,
        default: OrderType.PHYSICAL,
        required: true
    },
    grams: {
        type: Number,
        required: true,
        min: 0
    },
    pricePerUnit: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: OrderStatusValues,
        default: OrderStatus.PENDING,
        required: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    confirmedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

export default mongoose.model("Order", OrderSchema);
