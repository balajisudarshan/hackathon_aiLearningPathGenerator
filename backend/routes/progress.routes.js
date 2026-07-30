import express from "express";
import { getLearningProgressController } from "../controllers/progress.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/progress:
 *   get:
 *     summary: Get overall learning progress and completion percentage by roadmap
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed learning progress per roadmap
 */
router.get("/", getLearningProgressController);

export default router;
