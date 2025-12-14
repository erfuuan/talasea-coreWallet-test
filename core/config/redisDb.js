/**
 * Redis Database Enum
 * Defines the database numbers used for different Redis services
 */
export const RedisDB = {
  LOCK: 0,           // Redis lock service for distributed locking
  IDEMPOTENCY: 1,    // Idempotency key storage
  RATE_LIMITER: 3,   // Rate limiting service
};

export default RedisDB;
