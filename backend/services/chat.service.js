import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { getGroqClient, GROQ_MODEL } from "../config/groq.js";
import { buildChatContextPrompt, buildGroqMessages } from "../utils/prompts.js";
import { passivelyUpdateProfile } from "./user.service.js";

// Trigger passive profile extraction every N user messages
const PASSIVE_EXTRACTION_INTERVAL = 10; // every 10 messages (5 exchanges)

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
 * Send a message and get an AI response via Groq.
 * - Loads user preferences to personalize the system prompt.
 * - After every PASSIVE_EXTRACTION_INTERVAL messages, passively updates the user profile.
 */
export const sendMessage = async (chatId, userId, userMessage) => {
  // 1. Load chat session
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

  const trimmedMessage = userMessage.trim();

  // 3. Load user preferences to personalize the system prompt
  const user = await User.findById(userId).select("preferences");
  const preferences = user?.preferences || null;

  // 4. Build personalized system prompt
  const systemPrompt = buildChatContextPrompt(chat.topic, preferences);

  // 5. Build messages for Groq: [system, ...history, new user message]
  const messagesForGroq = buildGroqMessages(chat.messages, systemPrompt);
  messagesForGroq.push({ role: "user", content: trimmedMessage });

  // 6. Call Groq API
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: messagesForGroq,
    max_tokens: 2048,
    temperature: 0.7,
  });

  const aiText =
    completion.choices[0]?.message?.content ||
    "I could not generate a response. Please try again.";

  // 7. Persist both messages to DB
  chat.messages.push({ role: "user", content: trimmedMessage });
  chat.messages.push({ role: "assistant", content: aiText });
  await chat.save();

  // 8. Passive profile extraction — fire-and-forget every N messages
  const totalMessages = chat.messages.length;
  if (totalMessages % PASSIVE_EXTRACTION_INTERVAL === 0) {
    // Non-blocking: don't await, don't block the response
    passivelyUpdateProfile(userId, chat.messages, preferences || {}).catch(
      (err) => console.warn("[Profile] Background extraction error:", err.message)
    );
  }

  return {
    chatId: chat._id.toString(),
    title: chat.title,
    assistantMessage: {
      id: chat.messages.at(-1)._id.toString(),
      role: "assistant",
      content: aiText,
      createdAt: chat.messages.at(-1).createdAt,
    },
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
