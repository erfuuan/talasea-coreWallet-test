import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Talasea Core Wallet API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Talasea Core Wallet system including authentication, wallet management, asset trading, and transaction history',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 400,
            },
            error: {
              type: 'string',
              example: 'bad_request',
            },
            message: {
              type: 'string',
              example: 'Validation error message',
            },
            data: {
              type: 'object',
              nullable: true,
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 200,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'nationalCode', 'phone', 'password'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              example: 'John',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              minLength: 1,
              example: 'Doe',
              description: 'User last name',
            },
            nationalCode: {
              type: 'string',
              pattern: '^\\d{10}$',
              example: '1234567890',
              description: '10-digit national code',
            },
            phone: {
              type: 'string',
              minLength: 11,
              maxLength: 11,
              example: '09123456789',
              description: '11-digit phone number',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'password123',
              description: 'Password (minimum 8 characters)',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['phone', 'password'],
          properties: {
            phone: {
              type: 'string',
              length: 11,
              example: '09123456789',
              description: '11-digit phone number',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'password123',
              description: 'User password',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 200,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  description: 'JWT authentication token',
                },
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      example: '507f1f77bcf86cd799439011',
                    },
                    firstName: {
                      type: 'string',
                      example: 'John',
                    },
                    lastName: {
                      type: 'string',
                      example: 'Doe',
                    },
                    phone: {
                      type: 'string',
                      example: '09123456789',
                    },
                  },
                },
              },
            },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            nationalCode: {
              type: 'string',
              example: '1234567890',
            },
            phone: {
              type: 'string',
              example: '09123456789',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          minProperties: 1,
          properties: {
            firstName: {
              type: 'string',
              minLength: 1,
              example: 'John',
            },
            lastName: {
              type: 'string',
              minLength: 1,
              example: 'Doe',
            },
            phone: {
              type: 'string',
              length: 11,
              example: '09123456789',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'newpassword123',
            },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            balance: {
              type: 'number',
              example: 1000000.50,
              description: 'Current wallet balance in Rials',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        WalletOperationRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: {
              type: 'number',
              minimum: 0,
              example: 50000,
              description: 'Amount in Rials',
            },
          },
        },
        Asset: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            type: {
              type: 'string',
              enum: ['gold', 'silver'],
              example: 'gold',
            },
            totalGrams: {
              type: 'number',
              example: 50.5,
              description: 'Total grams owned',
            },
            averagePrice: {
              type: 'number',
              example: 2500000,
              description: 'Average purchase price per gram',
            },
            totalValue: {
              type: 'number',
              example: 126250000,
              description: 'Total value of assets',
            },
            holdings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  grams: {
                    type: 'number',
                    example: 25.0,
                  },
                  pricePerUnit: {
                    type: 'number',
                    example: 2500000,
                  },
                  karat: {
                    type: 'number',
                    enum: [14, 16, 18, 22, 24],
                    example: 18,
                    description: 'Required for gold, optional for silver',
                  },
                  purchaseDate: {
                    type: 'string',
                    format: 'date-time',
                  },
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        AssetOperationRequest: {
          type: 'object',
          required: ['type', 'grams', 'pricePerUnit'],
          properties: {
            type: {
              type: 'string',
              enum: ['gold', 'silver'],
              example: 'gold',
              description: 'Type of asset',
            },
            grams: {
              type: 'number',
              minimum: 0,
              example: 10.5,
              description: 'Amount of grams to buy/sell',
            },
            pricePerUnit: {
              type: 'number',
              minimum: 0,
              example: 2500000,
              description: 'Price per gram in Rials',
            },
            karat: {
              type: 'number',
              enum: [14, 16, 18, 22, 24],
              example: 18,
              description: 'Karat value (required for gold, optional for silver)',
            },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            productId: {
              type: 'string',
              nullable: true,
              example: '507f1f77bcf86cd799439011',
              description: 'Product ID (for physical transactions)',
            },
            type: {
              type: 'string',
              enum: [
                'DEPOSIT',
                'WITHDRAW',
                'BUY_GOLD_ONLINE',
                'BUY_SILVER_ONLINE',
                'SELL_GOLD_ONLINE',
                'SELL_SILVER_ONLINE',
                'BUY_GOLD_PHYSICAL',
                'BUY_SILVER_PHYSICAL',
                'SELL_GOLD_PHYSICAL',
                'SELL_SILVER_PHYSICAL',
              ],
              example: 'DEPOSIT',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'SUCCESS', 'FAILED'],
              example: 'SUCCESS',
            },
            amount: {
              type: 'number',
              example: 50000,
              description: 'Transaction amount',
            },
            commodity: {
              type: 'string',
              enum: ['gold', 'silver'],
              nullable: true,
              example: 'gold',
              description: 'Commodity type (for trade transactions)',
            },
            pricePerUnit: {
              type: 'number',
              nullable: true,
              example: 2500000,
              description: 'Price per unit (for trade transactions)',
            },
            fee: {
              type: 'number',
              nullable: true,
              example: 25000,
              description: 'Transaction fee (for trade transactions)',
            },
            total: {
              type: 'number',
              nullable: true,
              example: 2525000,
              description: 'Total cost/income (for trade transactions)',
            },
            refId: {
              type: 'string',
              example: 'TRK-20240115-123456',
              description: 'Unique transaction reference ID',
            },
            meta: {
              type: 'object',
              properties: {
                balanceBefore: {
                  type: 'number',
                  nullable: true,
                  example: 1000000,
                  description: 'Wallet balance before transaction',
                },
                balanceAfter: {
                  type: 'number',
                  nullable: true,
                  example: 1050000.50,
                  description: 'Wallet balance after transaction',
                },
              },
              additionalProperties: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        TransactionList: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 200,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Transaction',
              },
            },
          },
        },
        TradeRequest: {
          type: 'object',
          required: ['commodity', 'amount'],
          properties: {
            commodity: {
              type: 'string',
              enum: ['gold', 'silver'],
              example: 'gold',
              description: 'Type of commodity to trade',
            },
            amount: {
              type: 'number',
              minimum: 0,
              exclusiveMinimum: true,
              example: 10,
              description: 'Amount of commodity to buy/sell (must be greater than 0)',
            },
            unit: {
              type: 'string',
              enum: ['gram', 'ounce', 'kilogram'],
              example: 'gram',
              description: 'Unit of measurement (optional)',
            },
          },
        },
        TradeTransaction: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            userId: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            commodity: {
              type: 'string',
              enum: ['gold', 'silver'],
              example: 'gold',
            },
            type: {
              type: 'string',
              enum: [
                'BUY_GOLD_ONLINE',
                'BUY_SILVER_ONLINE',
                'SELL_GOLD_ONLINE',
                'SELL_SILVER_ONLINE',
              ],
              example: 'BUY_GOLD_ONLINE',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'SUCCESS', 'FAILED'],
              example: 'SUCCESS',
            },
            amount: {
              type: 'number',
              example: 10,
              description: 'Amount of commodity traded',
            },
            pricePerUnit: {
              type: 'number',
              example: 2500000,
              description: 'Price per unit at time of trade',
            },
            fee: {
              type: 'number',
              example: 25000,
              description: 'Transaction fee',
            },
            total: {
              type: 'number',
              example: 2525000,
              description: 'Total cost (for buy) or total income (for sell)',
            },
            refId: {
              type: 'string',
              example: 'TRK-20240115-123456',
              description: 'Unique transaction reference ID',
            },
            meta: {
              type: 'object',
              properties: {
                balanceBefore: {
                  type: 'number',
                  example: 1000000,
                  description: 'Wallet balance before transaction',
                },
                balanceAfter: {
                  type: 'number',
                  example: 747500,
                  description: 'Wallet balance after transaction',
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./core/routers/*.js', './core/server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
