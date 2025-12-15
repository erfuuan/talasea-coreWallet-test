# Talasea Core Wallet

Core wallet API service built with Express.js, MongoDB, and Redis.

## Quick Start

Run with Docker Compose:

```bash
docker-compose up -d
```

Then start the application:

```bash
npm install
npm run dev
```

The server will run on `http://localhost:3000`

## Concurrency Safety

This application implements multiple layers of concurrency protection:

- **Redis Distributed Lock**: Prevents concurrent operations on the same resource using atomic SET NX PX operations
- **MongoDB Transactions**: Ensures atomicity of multi-document operations with proper commit/abort handling
- **Optimistic Version Control**: Uses `__v` field to detect and prevent concurrent updates with automatic version increment
