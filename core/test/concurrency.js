import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

// ================== CONFIG ==================
let ASSET_ID = null;
const COMMODITY = "gold"; 

const CONCURRENCY = 10; 

// Login credentials
const LOGIN_PHONE = "09305087411";
const LOGIN_PASSWORD = "password";
// ============================================

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true, 
});

let authToken = null;
let productIds = []; 
let assetIds = []; 

const logResult = (label, res) => {
  if (res.status >= 200 && res.status < 300) {
    console.log(`✅ ${label} SUCCESS`, res.data?.status || "");
  } else {
    console.log(`❌ ${label} FAIL`, res.status, res.data?.message);
  }
};

// Login function
async function login() {
  console.log("\n🔐 LOGGING IN...");
  try {
    const response = await client.post("/auth/login", {
      phone: LOGIN_PHONE,
      password: LOGIN_PASSWORD,
    });

    if (response.status === 200 && response.data?.data?.token) {
      authToken = response.data.data.token;
      console.log("✅ LOGIN SUCCESS");
      // Set default Authorization header for all requests
      client.defaults.headers.common["Authorization"] = authToken;
      return authToken;
    } else {
      throw new Error(`Login failed: ${response.status} - ${response.data?.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("❌ LOGIN FAILED", error.message);
    throw error;
  }
}

// Fetch products function
async function fetchProducts() {
  console.log("\n📦 FETCHING PRODUCTS...");
  try {

    // If POST doesn't work, try GET
    const response = await client.get("/product", {
      headers: {
        "Authorization": authToken,
      },
    });
    if (response.status !== 200) {
      throw new Error(`Failed to fetch products: ${response.status} - ${response.data?.message || "Unknown error"}`);
    }

    if (response.status === 200 && response.data?.data) {
      productIds = response.data.data.map(product => product._id);
      console.log(`✅ FETCHED ${productIds.length} PRODUCTS`);
      return productIds;
    } else {
      throw new Error(`Failed to fetch products: ${response.status} - ${response.data?.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("❌ FETCH PRODUCTS FAILED", error.message);
    throw error;
  }
}

// Fetch assets function
async function fetchAssets() {
  console.log("\n💎 FETCHING ASSETS...");
  try {
    const response = await client.get("/asset", {
      headers: {
        "Authorization": authToken,
        "Idempotency-Key": `fetch-assets-${Date.now()}`,
      },
    });

    if (response.status === 200 && response.data?.data) {
      const assets = Array.isArray(response.data.data) 
        ? response.data.data 
        : (response.data.data.assets || []);
      
      assetIds = assets
        .filter(asset => asset._id)
        .map(asset => asset._id);
      
      if (assetIds.length > 0) {
        ASSET_ID = assetIds[0]; // Use first asset ID
        console.log(`✅ FETCHED ${assetIds.length} ASSETS, using first one: ${ASSET_ID}`);
      } else {
        console.log("⚠️ No assets found. Asset sell test will be skipped.");
      }
      return assetIds;
    } else {
      console.log("⚠️ No assets found or failed to fetch. Asset sell test will be skipped.");
      return [];
    }
  } catch (error) {
    console.error("❌ FETCH ASSETS FAILED", error.message);
    console.log("⚠️ Asset sell test will be skipped.");
    return [];
  }
}


async function testAssetBuyConcurrency() {
  console.log("\n🔥 ASSET BUY CONCURRENCY TEST");

  if (productIds.length === 0) {
    console.error("❌ No products available. Please fetch products first.");
    return;
  }

  const requests = Array.from({ length: CONCURRENCY }).map((_, i) => {
    // Use product ID from fetched products (cycle through them)
    const productId = productIds[i % productIds.length];
    
    return client.post("/asset/buy", {
      productId: productId,
      grams: 1,
    }, {
      headers: {
        "Idempotency-Key": `buy-asset-${i}`,
        "Authorization": authToken,
      },
    });
  });

  const results = await Promise.all(requests);
  results.forEach(r => logResult("BUY_ASSET", r));
}


async function testAssetSellConcurrency() {
  console.log("\n🔥 ASSET SELL CONCURRENCY TEST");

  if (!ASSET_ID || assetIds.length === 0) {
    console.error("❌ No assets available. Please ensure you have assets before running sell test.");
    return;
  }

  const requests = Array.from({ length: CONCURRENCY }).map((_, i) => {
    // Use asset ID from fetched assets (cycle through them)
    const assetId = assetIds[i % assetIds.length];
    
    return client.post("/asset/sell", {
      assetId: assetId,
    }, {
      headers: {
        "Idempotency-Key": `sell-asset-${i}`,
        "Authorization": authToken,
      },
    });
  });

  const results = await Promise.all(requests);
  results.forEach(r => logResult("SELL_ASSET", r));
}


async function testTradeBuyConcurrency() {
  console.log("\n🔥 TRADE BUY CONCURRENCY TEST");

  const requests = Array.from({ length: CONCURRENCY }).map((_, i) =>
    client.post(`/trades/${COMMODITY}/buy`, {
      amount: 2,
    }, {
      headers: {
        "idempotency-key": `buy-trade-${i}`,
        "Authorization": authToken,
        "Content-Type": "application/json",
      },
    })
  );

  const results = await Promise.all(requests);
  results.forEach(r => logResult("BUY_TRADE", r));
}


async function testTradeSellConcurrency() {
  console.log("\n🔥 TRADE SELL CONCURRENCY TEST");

  const requests = Array.from({ length: CONCURRENCY }).map((_, i) =>
    client.post(`/trades/${COMMODITY}/sell`, {
      amount: 1,
    }, {
      headers: {
        "idempotency-key": `sell-trade-${i}`,
        "Authorization": authToken,
      },
    })
  );

  const results = await Promise.all(requests);
  results.forEach(r => logResult("SELL_TRADE", r));
}


async function testWalletWithdrawConcurrency() {
  console.log("\n🔥 WALLET WITHDRAW CONCURRENCY TEST");

  const requests = Array.from({ length: CONCURRENCY }).map((_, i) =>
    client.post("/wallet/withdraw", {
      amount: 100,
    }, {
      headers: {
        "idempotency-key": `withdraw-${i}`,
        "Authorization": authToken,
        "Content-Type": "application/json",
      },
    })
  );

  const results = await Promise.all(requests);
  results.forEach(r => logResult("WITHDRAW", r));
}


async function testWalletDepositConcurrency() {
  console.log("\n🔥 WALLET DEPOSIT CONCURRENCY TEST");

  const requests = Array.from({ length: CONCURRENCY }).map((_, i) =>
    
    client.post("/wallet/deposit", {
      amount: 9999999,
    }, {
      headers: {
        "idempotency-key": `deposit-${i}`,
        "Authorization": authToken,
        "Content-Type": "application/json",
      },
    })
  );

  const results = await Promise.all(requests);
  results.forEach(r => logResult("DEPOSIT", r));
}

// ================= RUN =================
(async () => {
  try {
    // Login first to get the token
    await login();
    
    // Fetch products to get real product IDs
    await fetchProducts();
    
    // Fetch assets to get real asset IDs
    await fetchAssets();
    
    // Run all concurrency tests
    await testAssetBuyConcurrency();
    await testAssetSellConcurrency();
    await testTradeBuyConcurrency();
    await testTradeSellConcurrency();
    await testWalletWithdrawConcurrency();
    await testWalletDepositConcurrency();
  } catch (err) {
    console.error("💥 TEST CRASHED", err.message);
  }
})();
