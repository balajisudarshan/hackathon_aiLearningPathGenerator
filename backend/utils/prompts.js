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

// ─── Roadmap Generation Prompts ─────────────────────────────────────────────

/**
 * Build a prompt to generate a highly structured learning roadmap.
 * Uses Groq JSON mode.
 * @param {string} topic - The topic to learn (e.g., "React.js", "Machine Learning")
 * @param {object} preferences - User's learning preferences to tailor the curriculum
 */
export const buildRoadmapGenerationPrompt = (topic, preferences = {}) => {
  const profileSummary = preferences.aiProfileSummary
    ? `\nLEARNER PROFILE:\n${preferences.aiProfileSummary}`
    : `\nLEARNER LEVEL: ${preferences.experienceLevel || "beginner"}`;

  return `
You are an expert curriculum designer and AI learning assistant.
Create a highly structured, step-by-step learning roadmap for the following topic: "${topic}".

${profileSummary}
Tailor the roadmap's difficulty, pace, and recommended resources to perfectly match this learner's profile.

Return ONLY valid JSON matching this exact schema:
{
  "title": "A catchy title for the roadmap (string)",
  "topic": "${topic}",
  "description": "A 2-3 sentence overview of what the learner will achieve (string)",
  "level": "beginner|intermediate|advanced",
  "estimatedWeeks": number,
  "sections": [
    {
      "title": "Section Title (e.g., 'Week 1: Basics', 'Core Concepts')",
      "description": "Short description of this section",
      "topics": [
        {
          "title": "Specific topic to learn",
          "description": "What they need to learn and why it matters",
          "resources": [
            {
              "title": "Name of the resource (e.g., 'Official React Docs: Hooks', 'Fireship: 100 seconds of Code')",
              "type": "video|article|course|documentation|book",
              "searchQuery": {
                "technology": "Main technology name (e.g., react)",
                "tags": ["array", "of", "topic", "tags"]
              }
            }
          ]
        }
      ]
    }
  ]
}

Ensure there are at least 3 sections, and each section has 3-5 topics. Each topic should have 1-2 resources.
Return ONLY valid JSON.
`;
};

