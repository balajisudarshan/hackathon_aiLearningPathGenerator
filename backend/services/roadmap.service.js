import Roadmap from "../models/Roadmap.js";
import User from "../models/User.js";
import { getGroqClient, GROQ_MODEL } from "../config/groq.js";
import { buildRoadmapGenerationPrompt } from "../utils/prompts.js";

/**
 * Generate a new AI roadmap for a specific topic, tailored to user preferences.
 */
export const generateRoadmap = async (userId, topic) => {
  if (!topic || topic.trim().length === 0) {
    const error = new Error("Topic is required to generate a roadmap");
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch user preferences
  const user = await User.findById(userId).select("preferences");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const preferences = user.preferences || {};

  // 2. Call AI to generate roadmap JSON
  const groq = getGroqClient();
  const prompt = buildRoadmapGenerationPrompt(topic, preferences);

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3, // Slightly creative but structured
    max_tokens: 3000, // Roadmaps can be long
  });

  let roadmapData;
  try {
    roadmapData = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (err) {
    const error = new Error("AI failed to generate a valid roadmap. Please try again.");
    error.statusCode = 500;
    throw error;
  }

  // 3. Save to database
  const roadmap = await Roadmap.create({
    userId,
    title: roadmapData.title || `Learning Path: ${topic}`,
    topic: roadmapData.topic || topic,
    description: roadmapData.description || "",
    level: roadmapData.level || "beginner",
    estimatedWeeks: roadmapData.estimatedWeeks || 4,
    sections: roadmapData.sections || [],
  });

  return roadmap;
};

/**
 * Get all roadmaps for a user.
 */
export const getUserRoadmaps = async (userId) => {
  const roadmaps = await Roadmap.find({ userId })
    .select("title topic level estimatedWeeks isCompleted createdAt updatedAt")
    .sort({ updatedAt: -1 });
  return roadmaps;
};

/**
 * Get a specific roadmap by ID (with full sections/topics).
 */
export const getRoadmapById = async (roadmapId, userId) => {
  const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
  if (!roadmap) {
    const error = new Error("Roadmap not found");
    error.statusCode = 404;
    throw error;
  }
  return roadmap;
};

/**
 * Update the progress (isCompleted) of a specific topic in a roadmap.
 */
export const updateTopicProgress = async (roadmapId, sectionId, topicId, isCompleted, userId) => {
  // We use the positional operator $[] to update the nested topic array
  const roadmap = await Roadmap.findOneAndUpdate(
    {
      _id: roadmapId,
      userId: userId,
      "sections._id": sectionId,
      "sections.topics._id": topicId,
    },
    {
      $set: {
        "sections.$[section].topics.$[topic].isCompleted": isCompleted,
      },
    },
    {
      arrayFilters: [{ "section._id": sectionId }, { "topic._id": topicId }],
      new: true,
    }
  );

  if (!roadmap) {
    const error = new Error("Roadmap, section, or topic not found");
    error.statusCode = 404;
    throw error;
  }

  // Check if all topics in all sections are completed to mark the entire roadmap as done
  let allDone = true;
  for (const section of roadmap.sections) {
    for (const topic of section.topics) {
      if (!topic.isCompleted) {
        allDone = false;
        break;
      }
    }
    if (!allDone) break;
  }

  if (roadmap.isCompleted !== allDone) {
    roadmap.isCompleted = allDone;
    await roadmap.save();
  }

  return roadmap;
};

/**
 * Delete a roadmap.
 */
export const deleteRoadmap = async (roadmapId, userId) => {
  const roadmap = await Roadmap.findOneAndDelete({ _id: roadmapId, userId });
  if (!roadmap) {
    const error = new Error("Roadmap not found");
    error.statusCode = 404;
    throw error;
  }
  return { id: roadmapId, message: "Roadmap deleted successfully" };
};
