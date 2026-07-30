import Chat from "../models/Chat.js";
import { getGroqClient, GROQ_MODEL } from "../config/groq.js";
import { buildChatContextPrompt, buildGroqMessages } from "../utils/prompts.js";

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
 * Send a message in a chat session and get an AI response via Groq.
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

  const trimmedMessage = userMessage.trim();

  // 3. Build system prompt with optional topic context
  const systemPrompt = buildChatContextPrompt(chat.topic);

  // 4. Build full message array: [system, ...history, new user message]
  const messagesForGroq = buildGroqMessages(chat.messages, systemPrompt);
  messagesForGroq.push({ role: "user", content: trimmedMessage });

  // 5. Call Groq API
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: messagesForGroq,
    max_tokens: 2048,
    temperature: 0.7,
  });

  const aiText = completion.choices[0]?.message?.content || "I could not generate a response. Please try again.";

  // 6. Save both user message and AI response to DB
  chat.messages.push({ role: "user", content: trimmedMessage });
  chat.messages.push({ role: "assistant", content: aiText });
  await chat.save();

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
