import express from "express";
import {
  getProfileController,
  updateProfileController,
  skipOnboardingController,
  extractProfileController,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile with learning preferences
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         onboardingCompleted:
 *                           type: boolean
 *                         currentRole:
 *                           type: string
 *                         targetRole:
 *                           type: string
 *                         experienceLevel:
 *                           type: string
 *                         goals:
 *                           type: array
 *                           items:
 *                             type: string
 *                         skills:
 *                           type: array
 *                         interests:
 *                           type: array
 *                           items:
 *                             type: string
 *                         aiProfileSummary:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", getProfileController);

/**
 * @openapi
 * /api/user/profile:
 *   put:
 *     summary: Manually update user profile and learning preferences
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               currentRole:
 *                 type: string
 *               targetRole:
 *                 type: string
 *               experienceLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               learningStyle:
 *                 type: string
 *                 enum: [visual, reading, hands-on, mixed]
 *               weeklyHoursAvailable:
 *                 type: number
 *               preferredLanguage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", updateProfileController);

/**
 * @openapi
 * /api/user/profile/extract:
 *   post:
 *     summary: AI extracts and saves learning profile from free-form text description
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: "Free-form description of the learner. E.g: 'I am a CS student who knows Python basics and want to become a data scientist...'"
 *     responses:
 *       200:
 *         description: Profile extracted and saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 preferences:
 *                   type: object
 *                 extracted:
 *                   type: object
 *                   description: Raw AI extraction output
 *       400:
 *         description: Text too short
 *       429:
 *         description: AI rate limit exceeded
 *       401:
 *         description: Unauthorized
 */
router.post("/profile/extract", extractProfileController);

/**
 * @openapi
 * /api/user/profile/skip-onboarding:
 *   post:
 *     summary: Skip onboarding (user can come back later)
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding skipped
 *       401:
 *         description: Unauthorized
 */
router.post("/profile/skip-onboarding", skipOnboardingController);

export default router;
