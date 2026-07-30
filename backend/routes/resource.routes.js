import express from "express";
import {
  createResourceController,
  searchResourcesController,
  getResourceByIdController,
  updateResourceController,
  deleteResourceController,
  testRecommendationController,
} from "../controllers/resource.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public read routes
/**
 * @openapi
 * /api/resources:
 *   get:
 *     summary: Search the curated resource library
 *     tags:
 *       - Resources
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text search query
 *       - in: query
 *         name: technology
 *         schema:
 *           type: string
 *         description: Filter by technology (e.g. react)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced, all]
 *     responses:
 *       200:
 *         description: List of resources
 */
router.get("/", searchResourcesController);

/**
 * @openapi
 * /api/resources/{id}:
 *   get:
 *     summary: Get a specific resource by ID
 *     tags:
 *       - Resources
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource details
 *       404:
 *         description: Resource not found
 */
router.get("/:id", getResourceByIdController);


// Protected routes
router.use(authMiddleware);

/**
 * @openapi
 * /api/resources/recommend:
 *   post:
 *     summary: Test AI tag matching (Internal/Frontend tool)
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - technology
 *             properties:
 *               technology:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               difficulty:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recommended resources
 */
router.post("/recommend", testRecommendationController);

/**
 * @openapi
 * /api/resources:
 *   post:
 *     summary: Add a new curated resource (Admin)
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - url
 *               - technology
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [video, article, documentation, course, github, practice]
 *               url:
 *                 type: string
 *               technology:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               difficulty:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resource created
 */
router.post("/", createResourceController);

/**
 * @openapi
 * /api/resources/{id}:
 *   patch:
 *     summary: Update a resource (e.g., increment views)
 *     tags:
 *       - Resources
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
 *             properties:
 *               views:
 *                 type: number
 *     responses:
 *       200:
 *         description: Resource updated
 */
router.patch("/:id", updateResourceController);

/**
 * @openapi
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource (Admin)
 *     tags:
 *       - Resources
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
 *         description: Resource deleted
 */
router.delete("/:id", deleteResourceController);

export default router;
