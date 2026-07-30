/**
 * All AI prompt templates in one place.
 */

// ─── Chat System Prompts ────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are an expert AI learning assistant specializing in personalized education and skill development.
Your role is to:
- Answer questions clearly and concisely, adapting to the learner's level.
- Provide examples, analogies, and step-by-step explanations where helpful.
- Suggest next learning steps when relevant.
- Stay focused on educational topics but be friendly and encouraging.
- Format code snippets in proper markdown code blocks with the correct language tag.
- Keep answers focused and avoid overwhelming the learner with too much information at once.`;

/**
 * Build the system prompt injected into every chat.
 * Personalizes based on stored user preferences when available.
 * @param {string} topic - Current chat topic
 * @param {object} preferences - User.preferences from DB
 */
export const buildChatContextPrompt = (topic = "", preferences = null) => {
  let prompt = BASE_SYSTEM_PROMPT;

  // Inject learner profile if AI summary exists
  if (preferences?.aiProfileSummary) {
    prompt += `\n\nLEARNER PROFILE:\n${preferences.aiProfileSummary}`;
    prompt += `\nAlways tailor explanations, examples, and recommendations to match this learner's background and goals.`;
  } else if (preferences?.experienceLevel) {
    // Fallback: basic level hint if no summary yet
    prompt += `\n\nThe learner's experience level is: ${preferences.experienceLevel}.`;
  }

  if (topic) {
    prompt += `\n\nThe learner is currently studying: "${topic}". Keep responses relevant to this topic when possible.`;
  }

  return prompt;
};

/**
 * Convert stored messages to Groq/OpenAI messages array format.
 */
export const buildGroqMessages = (messages = [], systemPrompt = BASE_SYSTEM_PROMPT) => {
  return [
    { role: "system", content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    })),
  ];
};

// ─── Profile Extraction Prompts ─────────────────────────────────────────────

/**
 * Build a prompt to extract a structured learning profile from free-form text.
 * Uses Groq JSON mode to guarantee JSON output.
 * @param {string} text - User's self-description
 */
export const buildProfileExtractionPrompt = (text) => `
You are a learning profile extraction assistant.

Extract a structured learning profile from the following user-provided text.
Return ONLY valid JSON — no markdown, no explanation, no extra text.

The JSON must follow this schema exactly:
{
  "currentRole": "string (e.g. Student, Developer, Designer, or empty string)",
  "targetRole": "string (e.g. Full-Stack Developer, Data Scientist, or empty string)",
  "experienceLevel": "one of: beginner, intermediate, advanced, or empty string",
  "goals": ["array of short goal strings, max 5"],
  "skills": [
    { "name": "skill name", "level": "beginner|intermediate|advanced" }
  ],
  "interests": ["array of topic strings, max 8"],
  "learningStyle": "one of: visual, reading, hands-on, mixed, or empty string",
  "weeklyHoursAvailable": 0,
  "preferredLanguage": "primary programming language or empty string",
  "aiProfileSummary": "a 2-3 sentence natural language summary of this learner that will be injected into an AI system prompt to personalize responses"
}

User text:
"""
${text}
"""
`;

/**
 * Build a prompt to passively extract profile signals from chat history.
 * Designed to run in the background and MERGE with existing preferences.
 * @param {Array<{role, content}>} messages - recent chat messages
 * @param {object} existingPreferences - current stored preferences
 */
export const buildPassiveExtractionPrompt = (messages, existingPreferences = {}) => {
  const recentHistory = messages
    .slice(-20) // only look at last 20 messages
    .filter((m) => m.role === "user")
    .map((m) => `User: ${m.content}`)
    .join("\n");

  const existingSummary = existingPreferences.aiProfileSummary
    ? `\nExisting profile summary: "${existingPreferences.aiProfileSummary}"`
    : "";

  return `
You are a learning profile extraction assistant.
Analyze the following chat messages from a learner and extract any new signals about their background, skills, goals or preferences.
Return ONLY valid JSON — no markdown, no explanation.
Only include fields where you found NEW or UPDATED information. Leave other fields as empty strings or empty arrays.
${existingSummary}

JSON schema (only return fields with new info, rest can be empty/null):
{
  "currentRole": "string or null",
  "targetRole": "string or null",
  "experienceLevel": "beginner|intermediate|advanced or null",
  "goals": [],
  "skills": [{ "name": "", "level": "beginner|intermediate|advanced" }],
  "interests": [],
  "learningStyle": "visual|reading|hands-on|mixed or null",
  "weeklyHoursAvailable": null,
  "preferredLanguage": "string or null",
  "aiProfileSummary": "updated 2-3 sentence learner summary or null if no significant change"
}

Recent chat messages:
"""
${recentHistory}
"""
`;
};
