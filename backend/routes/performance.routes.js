import express from "express";
import { getUserPerformanceController } from "../controllers/performance.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/performance:
 *   get:
 *     summary: Get user performance analytics by topic and diagnostic fix suggestions
 *     tags:
 *       - Performance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance breakdown and suggestions
 */
router.get("/", getUserPerformanceController);

export default router;
