import express from 'express';
import ProfileController from '../controllers/profile.js';
import { container } from '../container.js';
import validators from '../validators/index.js';
import middlewares from '../middlewares/index.js';

const router = express.Router();
const profileController = new ProfileController({
  profileService: container.profileService,
});

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile information including personal details.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', profileController.getProfile.bind(profileController));

/**
 * @swagger
 * /api/v1/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile information. At least one field must be provided.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           examples:
 *             example1:
 *               summary: Update name and phone
 *               value:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 phone: "09187654321"
 *             example2:
 *               summary: Update password only
 *               value:
 *                 password: "newpassword123"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/',
  middlewares.validator(validators.profile.schema),
  profileController.updateProfile.bind(profileController)
);

export default router;
