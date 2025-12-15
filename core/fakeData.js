// scripts/seedProducts.js
import Product from "./models/product.js";
import CommodityPrice from "./models/commodity.js";
import mongodbConnection from "./connections/mongodb.js";

async function seedProducts() {
  try {
    if (!mongodbConnection.isConnected()) {
      await mongodbConnection.connect();
      console.log("✔ MongoDB connected");
    }

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
  } catch (err) {
    console.error("❌ Seed error:", err);
    throw err;
  }
}

export async function seedCommodityPrices() {
  try {
    if (!mongodbConnection.isConnected()) {
      await mongodbConnection.connect();
      console.log("✔ MongoDB connected");
    }

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
  } catch (err) {
    console.error("❌ Seed error:", err);
    throw err;
  }
}

async function runSeeds() {
  try {
    await seedProducts();
    await seedCommodityPrices();
    await mongodbConnection.disconnect();
    console.log("✔ All seeds completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed execution error:", err);
    await mongodbConnection.disconnect();
    process.exit(1);
  }
}

runSeeds();
