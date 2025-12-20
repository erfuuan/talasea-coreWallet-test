# الگوهای معماری و طراحی پروژه Talasea Core Wallet

این سند الگوهای معماری، طراحی و پیاده‌سازی استفاده شده در پروژه را شرح می‌دهد.

---

## 📐 الگوهای معماری (Architectural Patterns)

### 1. معماری لایه‌ای (Layered Architecture)

پروژه از معماری سه لایه استفاده می‌کند:

```
┌─────────────────┐
│   Controllers   │  ← لایه ارائه (Presentation Layer)
├─────────────────┤
│    Services     │  ← لایه منطق کسب‌وکار (Business Logic Layer)
├─────────────────┤
│   Repository    │  ← لایه دسترسی به داده (Data Access Layer)
└─────────────────┘
```

**مزایا:**
- جداسازی مسئولیت‌ها (Separation of Concerns)
- قابلیت تست‌پذیری بالا
- نگهداری و توسعه آسان

**فایل‌های مرتبط:**
- `core/controllers/` - کنترلرها
- `core/service/` - سرویس‌ها
- `core/repository/mongo.js` - لایه دسترسی به داده

---

### 2. الگوی MVC (Model-View-Controller)

- **Model**: مدل‌های Mongoose در `core/models/`
- **View**: پاسخ‌های JSON استاندارد از طریق `responseBuilder`
- **Controller**: کنترلرها در `core/controllers/`

---

### 3. الگوی Dependency Injection (تزریق وابستگی)

پروژه از یک **Container Pattern** برای مدیریت وابستگی‌ها استفاده می‌کند:

```javascript
// core/container.js
export const container = {
  walletService: new WalletService({
    WalletModel,
    TransactionModel,
    mongoService,
    redisLockService: redisManager.getService(RedisDB.LOCK),
    idempotencyService: redisManager.getService(RedisDB.IDEMPOTENCY),
  }),
  // ...
};
```

**مزایا:**
- کاهش وابستگی‌های سخت (Tight Coupling)
- قابلیت Mock کردن برای تست
- مدیریت متمرکز وابستگی‌ها

---

## 🎨 الگوهای طراحی (Design Patterns)

### 1. Repository Pattern

یک لایه انتزاعی برای دسترسی به داده‌ها ایجاد شده است:

```javascript
// core/repository/mongo.js
class MongoService {
  async create(Model, data, options = {})
  async findById(Model, id, options = {})
  async findOneRecord(Model, condition, options = {})
  async getAll(Model, condition = {}, options = {})
  async updateById(Model, data, id, options = {})
  async findOneAndUpdate(Model, condition, data, options = {})
}
```

**مزایا:**
- جداسازی منطق دسترسی به داده از منطق کسب‌وکار
- قابلیت تغییر دیتابیس بدون تغییر در سرویس‌ها
- پشتیبانی از Transaction و Session

---

### 2. Service Layer Pattern

تمام منطق کسب‌وکار در لایه Service قرار دارد:

```javascript
// core/service/wallet.js
export default class WalletService {
  constructor({ WalletModel, TransactionModel, mongoService, ... }) {
    // Dependency Injection
  }
  
  async deposit(userId, amount, idempotencyKey) {
    // Business Logic
  }
}
```

**ویژگی‌ها:**
- منطق کسب‌وکار مستقل از Controller
- قابلیت استفاده مجدد
- مدیریت خطاهای کسب‌وکار

---

### 3. Factory Pattern

برای ایجاد اتصالات Redis از Factory Pattern استفاده شده:

```javascript
// core/connections/redis.js
class RedisManager {
  getService(db = RedisDB.LOCK) {
    if (!this.clients[db]) {
      const client = this.baseClient.duplicate();
      client.select(db);
      this.clients[db] = new RedisService(client);
    }
    return this.clients[db];
  }
}
```

**مزایا:**
- مدیریت متمرکز ایجاد اشیاء
- جلوگیری از ایجاد اتصالات تکراری
- مدیریت چندین دیتابیس Redis

---

### 4. Singleton Pattern

`RedisManager` و `container` به صورت Singleton پیاده‌سازی شده‌اند:

```javascript
const redisManager = new RedisManager();
export default redisManager; // Single instance
```

---

### 5. Middleware Pattern

استفاده از Middleware برای Cross-Cutting Concerns:

```javascript
// core/middlewares/index.js
export default {
  idempotency,
  auth,
  rateLimiter,
  validator,
};
```

**Middleware های پیاده‌سازی شده:**
- **Authentication**: بررسی و اعتبارسنجی توکن
- **Idempotency**: جلوگیری از درخواست‌های تکراری
- **Rate Limiting**: محدود کردن تعداد درخواست‌ها
- **Validator**: اعتبارسنجی ورودی‌ها

---

### 6. Error Handling Pattern

**الف) Custom Error Classes:**

```javascript
// core/utils/errors.js
export class NotFoundError extends Error { }
export class BadRequestError extends Error { }
export class ConflictError extends Error { }
```

**ب) Global Error Handlers:**

```javascript
// core/utils/errorHandlers.js
export const registerErrorHandlers = () => {
  process.on("uncaughtException", uncaughtExceptionHandler);
  process.on("unhandledRejection", unhandledRejectionHandler);
};
```

**ج) Error Middleware:**

```javascript
// core/middlewares/errorHandler.js
export default function errorHandler(err, req, res, _) {
  // Centralized error handling
}
```

---

## 🔒 الگوهای همزمانی و امنیت (Concurrency & Security Patterns)

### 1. Distributed Locking Pattern

برای جلوگیری از Race Condition در عملیات‌های مالی از Distributed Lock استفاده شده:

```javascript
// core/service/wallet.js
lockKey = `lock:wallet:${userId}`;
lockToken = await this.redisLockService.acquireLock(lockKey, 7000);
if (!lockToken) throw new ConflictError("Another wallet operation is in progress");
```

**ویژگی‌ها:**
- استفاده از Redis برای Lock
- TTL خودکار برای جلوگیری از Deadlock
- Release Lock با استفاده از Lua Script (Atomic)

---

### 2. Optimistic Locking Pattern

استفاده از فیلد `__v` (Version) برای Optimistic Locking:

```javascript
const updatedWallet = await this.mongoService.findOneAndUpdate(
  this.Wallet,
  { _id: wallet._id, __v: wallet.__v }, // Check version
  { $inc: { balance: -amount, __v: 1 } }, // Increment version
  { new: true, session }
);
```

**مزایا:**
- جلوگیری از Lost Update
- کارایی بهتر نسبت به Pessimistic Locking
- سازگار با MongoDB Transactions

---

### 3. Transaction Management Pattern

استفاده از MongoDB Sessions برای Transaction:

```javascript
session = await this.mongoService.startSession();
this.mongoService.startTransaction(session);

try {
  // Multiple operations
  await this.mongoService.commitTransaction(session);
} catch (err) {
  await this.mongoService.abortTransaction(session);
} finally {
  await this.mongoService.endSession(session);
}
```

**ویژگی‌ها:**
- ACID Compliance
- Rollback خودکار در صورت خطا
- مدیریت Session در finally block

---

### 4. Idempotency Pattern

جلوگیری از اجرای مجدد درخواست‌های تکراری:

```javascript
// core/middlewares/idempotency.js
const cached = await redisClient.get(key);
if (cached) {
  return responseBuilder.success(res, JSON.parse(cached));
}
req.idempotencyKey = key;
```

**مزایا:**
- جلوگیری از تراکنش‌های تکراری
- پاسخ سریع برای درخواست‌های تکراری
- ذخیره نتیجه در Redis با TTL

---

### 5. Rate Limiting Pattern

محدود کردن تعداد درخواست‌ها:

```javascript
// core/routers/wallet.js
router.post("/deposit", 
  middlewares.rateLimiter(5, 60), // 5 requests per 60 seconds
  walletController.deposit
);
```

---

## 🏗️ الگوهای زیرساخت (Infrastructure Patterns)

### 1. Connection Management Pattern

مدیریت متمرکز اتصالات:

```javascript
// core/connections/index.js
export default {
  mongodbConnection,
  // ...
};
```

**ویژگی‌ها:**
- اتصال یکتا به MongoDB
- مدیریت Lifecycle اتصالات
- Graceful Shutdown

---

### 2. Configuration Pattern

مدیریت متمرکز تنظیمات:

```javascript
// core/config/application.js
export default {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  // ...
};
```

---

### 3. Logging Pattern

سیستم لاگینگ یکپارچه:

```javascript
// core/utils/Logger.js
logger.info("Server running on port ${PORT}");
logger.error("Error message", err);
logger.fatal("Critical error", err);
```

---

### 4. Response Builder Pattern

ساخت پاسخ‌های استاندارد:

```javascript
// core/utils/responseBuilder.js
responseBuilder.success(res, data, message);
responseBuilder.badRequest(res, data, message);
responseBuilder.unauthorized(res, data, message);
```

---

## 📊 خلاصه الگوها

| الگو | نوع | کاربرد |
|------|-----|--------|
| Layered Architecture | معماری | جداسازی لایه‌ها |
| MVC | معماری | ساختار کلی پروژه |
| Dependency Injection | طراحی | مدیریت وابستگی‌ها |
| Repository | طراحی | دسترسی به داده |
| Service Layer | طراحی | منطق کسب‌وکار |
| Factory | طراحی | ایجاد اتصالات Redis |
| Singleton | طراحی | مدیریت اتصالات |
| Middleware | طراحی | Cross-Cutting Concerns |
| Distributed Locking | همزمانی | جلوگیری از Race Condition |
| Optimistic Locking | همزمانی | کنترل نسخه‌ها |
| Transaction Management | همزمانی | ACID Compliance |
| Idempotency | امنیت | جلوگیری از تکرار |
| Rate Limiting | امنیت | محدود کردن درخواست‌ها |

---

## 🎯 مزایای استفاده از این الگوها

1. **قابلیت نگهداری (Maintainability)**: کد تمیز و سازمان‌یافته
2. **قابلیت تست (Testability)**: جداسازی لایه‌ها امکان Mock را فراهم می‌کند
3. **مقیاس‌پذیری (Scalability)**: معماری مناسب برای رشد پروژه
4. **امنیت (Security)**: الگوهای امنیتی برای محافظت از داده‌ها
5. **قابلیت اطمینان (Reliability)**: مدیریت خطا و Transaction
6. **کارایی (Performance)**: استفاده از Cache و Optimistic Locking

---

## 📝 نکات مهم برای توسعه

1. **همیشه از Transaction استفاده کنید** برای عملیات‌های مالی
2. **Lock را در finally block آزاد کنید** برای جلوگیری از Deadlock
3. **از Idempotency Key استفاده کنید** برای عملیات‌های حساس
4. **Version Field را چک کنید** برای Optimistic Locking
5. **خطاها را به درستی Handle کنید** و لاگ کنید

---

*این سند آخرین بار در تاریخ ایجاد شده است و باید با تغییرات پروژه به‌روزرسانی شود.*

