import express from "express";
import {
  generateRoadmapController,
  getUserRoadmapsController,
  getRoadmapByIdController,
  updateProgressController,
  deleteRoadmapController,
} from "../controllers/roadmap.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All roadmap routes require authentication
router.use(authMiddleware);

/**
 * @openapi
 * /api/roadmaps/generate:
 *   post:
 *     summary: AI generates a new learning roadmap for a specific topic
 *     tags:
 *       - Roadmaps
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *                 description: "The subject to learn, e.g., 'React.js', 'Machine Learning'"
 *     responses:
 *       201:
 *         description: Roadmap generated successfully
 *       400:
 *         description: Missing topic
 *       429:
 *         description: AI rate limit exceeded
 *       401:
 *         description: Unauthorized
 */
router.post("/generate", generateRoadmapController);

/**
 * @openapi
 * /api/roadmaps:
 *   get:
 *     summary: Get all roadmaps for the current user
 *     tags:
 *       - Roadmaps
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user roadmaps
 *       401:
 *         description: Unauthorized
 */
router.get("/", getUserRoadmapsController);

/**
 * @openapi
 * /api/roadmaps/{id}:
 *   get:
 *     summary: Get a specific roadmap by ID
 *     tags:
 *       - Roadmaps
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Roadmap details
 *       404:
 *         description: Roadmap not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", getRoadmapByIdController);

/**
 * @openapi
 * /api/roadmaps/{id}/progress:
 *   patch:
 *     summary: Update progress (mark topic as completed)
 *     tags:
 *       - Roadmaps
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sectionId
 *               - topicId
 *               - isCompleted
 *             properties:
 *               sectionId:
 *                 type: string
 *               topicId:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       400:
 *         description: Missing parameters
 *       404:
 *         description: Roadmap, section, or topic not found
 *       401:
 *         description: Unauthorized
 */
router.patch("/:id/progress", updateProgressController);

/**
 * @openapi
 * /api/roadmaps/{id}:
 *   delete:
 *     summary: Delete a roadmap
 *     tags:
 *       - Roadmaps
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Roadmap deleted
 *       404:
 *         description: Roadmap not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", deleteRoadmapController);

export default router;
