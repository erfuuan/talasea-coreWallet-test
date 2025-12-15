import express from 'express';
import AuthController from '../controllers/auth.js';
import { container } from '../container.js';
import validators from '../validators/index.js';
import middlewares from '../middlewares/index.js';
const router = express.Router();
const authController = new AuthController({
  authService: container.authService,
});

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with wallet initialization. Returns user information and authentication token.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           examples:
 *             example1:
 *               summary: New user registration
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 nationalCode: "1234567890"
 *                 phone: "09123456789"
 *                 password: "password123"
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   statusCode: 400
 *                   error: "bad_request"
 *                   message: "nationalCode must be 10 digits"
 *       409:
 *         description: Conflict - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/signup',
  middlewares.validator(validators.signup.schema),
  authController.signup.bind(authController)
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with phone and password. Returns JWT token for subsequent API calls.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             example1:
 *               summary: User login
 *               value:
 *                 phone: "09123456789"
 *                 password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid credentials
 *                 value:
 *                   statusCode: 401
 *                   error: "unauthorized"
 *                   message: "Invalid phone or password"
 */
router.post(
  '/login',
  middlewares.validator(validators.login.schema),
  authController.login.bind(authController)
);

export default router;
