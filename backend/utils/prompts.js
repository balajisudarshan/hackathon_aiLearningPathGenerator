/**
 * All AI prompt templates in one place.
 */

/**
 * System instruction for the AI learning assistant.
 */
export const CHAT_SYSTEM_PROMPT = `You are an expert AI learning assistant specializing in personalized education and skill development.
Your role is to:
- Answer questions clearly and concisely, adapting to the learner's level.
- Provide examples, analogies, and step-by-step explanations where helpful.
- Suggest next learning steps when relevant.
- Stay focused on educational topics but be friendly and encouraging.
- If asked about a topic outside education or technology, politely redirect to learning-related discussions.
- Format code snippets in proper markdown code blocks with the correct language tag.
- Keep answers focused and avoid overwhelming the learner with too much information at once.`;

/**
 * Build a context-aware system prompt.
 * @param {string} topic - The learning topic or roadmap context.
 * @returns {string}
 */
export const buildChatContextPrompt = (topic = "") => {
  if (!topic) return CHAT_SYSTEM_PROMPT;
  return `${CHAT_SYSTEM_PROMPT}

The learner is currently studying: "${topic}". Keep your responses relevant to this topic when possible, but also answer any general learning questions they have.`;
};

/**
 * Convert stored messages to the OpenAI/Groq messages array format.
 * @param {Array<{role: string, content: string}>} messages - Stored DB messages
 * @param {string} systemPrompt - The system instruction text
 * @returns {Array<{role: string, content: string}>}
 */
export const buildGroqMessages = (messages = [], systemPrompt = CHAT_SYSTEM_PROMPT) => {
  return [
    { role: "system", content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    })),
  ];
};
