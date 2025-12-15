// scripts/seedProducts.js
import Product from "./models/product.js";
import CommodityPrice from "./models/commodity.js";
import mongodbConnection from "./connections/mongodb.js";

async function seedProducts() {
  try {
    await mongodbConnection.connect();
    console.log("✔ MongoDB connected");

    await Product.deleteMany({});
    console.log("🧹 Old products removed");

    const products = [
      // GOLD
      {
        type: "gold",
        karat: 18,
        buyPrice: 3200000,
        sellPrice: 3150000,
      },
      {
        type: "gold",
        karat: 24,
        buyPrice: 4200000,
        sellPrice: 4150000,
      },
      {
        type: "gold",
        karat: 22,
        buyPrice: 3900000,
        sellPrice: 3850000,
      },
      {
        type: "gold",
        karat: 16,
        buyPrice: 2800000,
        sellPrice: 2750000,
      },

      // SILVER
      {
        type: "silver",
        buyPrice: 45000,
        sellPrice: 43000,
      },
    ];

    await Product.insertMany(products);
    console.log("✅ Fake products inserted successfully");

    await mongodbConnection.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    await mongodbConnection.disconnect();
    process.exit(1);
  }
}

export async function seedCommodityPrices() {
  try {
    await mongodbConnection.connect();
    console.log("✔ MongoDB connected");

    await CommodityPrice.deleteMany({});
    console.log("🧹 Old commodity prices removed");

    const commodityPrices = [
      {
        commodity: "gold",
        price: 13740000, // Price per gram in Iranian Toman
        unit: "gram",
        feePercent: 0.01
      },
      {
        commodity: "silver",
        price: 450000, // Price per gram in Iranian Toman
        unit: "gram",
        feePercent: 0.01
      }
    ];

    await CommodityPrice.insertMany(commodityPrices);
    console.log("✅ Fake commodity prices inserted successfully");

    await mongodbConnection.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    await mongodbConnection.disconnect();
    process.exit(1);
  }
}

// seedProducts();
seedCommodityPrices();
