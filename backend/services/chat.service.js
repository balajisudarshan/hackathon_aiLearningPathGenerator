import Chat from "../models/Chat.js";
import { getGeminiModel } from "../config/gemini.js";
import {
  buildChatContextPrompt,
  buildGeminiHistory,
} from "../utils/prompts.js";

/**
 * Create a new chat session for the user.
 */
export const createChatSession = async (userId, { title, topic } = {}) => {
  const chat = await Chat.create({
    userId,
    title: title || "New Chat",
    topic: topic || "",
    messages: [],
  });
  return chat;
};

/**
 * Get all chat sessions for a user (excluding archived, without messages).
 */
export const getUserChats = async (userId) => {
  const chats = await Chat.find({ userId, isArchived: false })
    .select("_id title topic createdAt updatedAt")
    .sort({ updatedAt: -1 });

  return chats.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    topic: c.topic,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
};

/**
 * Get a single chat session with full message history.
 */
export const getChatById = async (chatId, userId) => {
  const chat = await Chat.findOne({ _id: chatId, userId, isArchived: false });

  if (!chat) {
    const error = new Error("Chat session not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: chat._id.toString(),
    title: chat.title,
    topic: chat.topic,
    messages: chat.messages.map((m) => ({
      id: m._id.toString(),
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
};

/**
 * Send a message in a chat session and get an AI response.
 * Maintains multi-turn conversation context from the stored history.
 */
export const sendMessage = async (chatId, userId, userMessage) => {
  // 1. Load the chat session
  const chat = await Chat.findOne({ _id: chatId, userId, isArchived: false });
  if (!chat) {
    const error = new Error("Chat session not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Validate message
  if (!userMessage || userMessage.trim().length === 0) {
    const error = new Error("Message cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  // 3. Push user message to history
  chat.messages.push({ role: "user", content: userMessage.trim() });

  // 4. Build Gemini multi-turn history (all previous messages, NOT the current one)
  const historyForGemini = buildGeminiHistory(
    chat.messages.slice(0, -1) // exclude the message we just added
  );

  // 5. Prepare system context
  const systemInstruction = buildChatContextPrompt(chat.topic);

  // 6. Initialize Gemini model with system instruction
  const model = getGeminiModel("gemini-2.0-flash-lite");

  // 7. Start a multi-turn chat session with history
  const geminiChat = model.startChat({
    history: historyForGemini,
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });

  // 8. Send the latest user message to Gemini
  const result = await geminiChat.sendMessage(userMessage.trim());
  const aiText = result.response.text();

  // 9. Save AI response to history
  chat.messages.push({ role: "assistant", content: aiText });

  // 10. Persist the updated session
  await chat.save();

  return {
    userMessage: chat.messages.at(-2), // the user message
    assistantMessage: {
      id: chat.messages.at(-1)._id.toString(),
      role: "assistant",
      content: aiText,
      createdAt: chat.messages.at(-1).createdAt,
    },
    chatId: chat._id.toString(),
    title: chat.title,
  };
};

/**
 * Clear all messages in a chat session (reset history).
 */
export const clearChatHistory = async (chatId, userId) => {
  const chat = await Chat.findOne({ _id: chatId, userId, isArchived: false });
  if (!chat) {
    const error = new Error("Chat session not found");
    error.statusCode = 404;
    throw error;
  }

  chat.messages = [];
  chat.title = "New Chat";
  await chat.save();

  return { id: chat._id.toString(), title: chat.title };
};

/**
 * Archive (soft-delete) a chat session.
 */
export const archiveChatSession = async (chatId, userId) => {
  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId, isArchived: false },
    { isArchived: true },
    { new: true }
  );

  if (!chat) {
    const error = new Error("Chat session not found");
    error.statusCode = 404;
    throw error;
  }

  return { id: chat._id.toString(), message: "Chat archived successfully" };
};

/**
 * Update the title or topic of a chat session.
 */
export const updateChatSession = async (chatId, userId, { title, topic }) => {
  const update = {};
  if (title !== undefined) update.title = title;
  if (topic !== undefined) update.topic = topic;

  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId, isArchived: false },
    update,
    { new: true }
  );

  if (!chat) {
    const error = new Error("Chat session not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: chat._id.toString(),
    title: chat.title,
    topic: chat.topic,
    updatedAt: chat.updatedAt,
  };
};
