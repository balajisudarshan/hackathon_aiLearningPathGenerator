import express from "express";
import {
  createChatController,
  getUserChatsController,
  getChatByIdController,
  sendMessageController,
  clearChatHistoryController,
  archiveChatController,
  updateChatController,
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

/**
 * @openapi
 * /api/chat:
 *   post:
 *     summary: Create a new chat session
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Optional title for the chat session
 *               topic:
 *                 type: string
 *                 description: Learning topic context (e.g. "React.js", "Python basics")
 *     responses:
 *       201:
 *         description: Chat session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 chat:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     topic:
 *                       type: string
 *                     messages:
 *                       type: array
 *                       items: {}
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 */
router.post("/", createChatController);

/**
 * @openapi
 * /api/chat:
 *   get:
 *     summary: Get all chat sessions for the current user
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       topic:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/", getUserChatsController);

/**
 * @openapi
 * /api/chat/{chatId}:
 *   get:
 *     summary: Get a specific chat session with full message history
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chat session ID
 *     responses:
 *       200:
 *         description: Chat session with messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chat:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     topic:
 *                       type: string
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           role:
 *                             type: string
 *                             enum: [user, assistant]
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat session not found
 */
router.get("/:chatId", getChatByIdController);

/**
 * @openapi
 * /api/chat/{chatId}:
 *   patch:
 *     summary: Update chat session title or topic
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               topic:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat session not found
 */
router.patch("/:chatId", updateChatController);

/**
 * @openapi
 * /api/chat/{chatId}:
 *   delete:
 *     summary: Archive (soft-delete) a chat session
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat archived successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat session not found
 */
router.delete("/:chatId", archiveChatController);

/**
 * @openapi
 * /api/chat/{chatId}/message:
 *   post:
 *     summary: Send a message and receive an AI response (multi-turn)
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chat session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user's message
 *     responses:
 *       200:
 *         description: AI response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chatId:
 *                   type: string
 *                 title:
 *                   type: string
 *                 message:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: assistant
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Message is empty
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat session not found
 */
router.post("/:chatId/message", sendMessageController);

/**
 * @openapi
 * /api/chat/{chatId}/history:
 *   delete:
 *     summary: Clear all messages in a chat session
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history cleared
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat session not found
 */
router.delete("/:chatId/history", clearChatHistoryController);

export default router;
