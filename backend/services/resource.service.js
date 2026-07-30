import Resource from "../models/Resource.js";

/**
 * Add a curated resource to the library.
 */
export const createResource = async (data) => {
  const resource = await Resource.create(data);
  return resource;
};

/**
 * Search resources for the global library (text search + filters).
 */
export const searchResources = async ({ query, technology, difficulty, page = 1, limit = 10 }) => {
  const filter = {};

  if (query) {
    filter.$text = { $search: query };
  }

  if (technology) {
    filter.technology = { $regex: new RegExp(`^${technology}$`, "i") };
  }

  if (difficulty && difficulty !== "all") {
    filter.difficulty = { $in: [difficulty, "all"] };
  }

  const skip = (page - 1) * limit;

  const resources = await Resource.find(filter)
    .sort(query ? { score: { $meta: "textScore" } } : { views: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Resource.countDocuments(filter);

  return {
    resources,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Core matching logic for AI Roadmaps.
 * Maps AI generated tags to curated MongoDB resources.
 */
export const getRecommendedResources = async (technology, tags = [], difficulty = "all") => {
  // If no tech is provided, return empty (safeguard)
  if (!technology) return [];

  const filter = {
    technology: { $regex: new RegExp(`^${technology}$`, "i") },
  };

  if (tags && tags.length > 0) {
    // Return resources that have AT LEAST ONE matching tag
    filter.tags = { $in: tags.map((t) => new RegExp(t, "i")) };
  }

  if (difficulty && difficulty !== "all") {
    filter.difficulty = { $in: [difficulty, "all"] };
  }

  // Find the top 3 best matching resources
  const resources = await Resource.find(filter)
    .sort({ views: -1 }) // simple ranking by popularity for MVP
    .limit(3);

  return resources;
};

/**
 * Get a single resource by ID.
 */
export const getResourceById = async (id) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    const error = new Error("Resource not found");
    error.statusCode = 404;
    throw error;
  }
  return resource;
};

/**
 * Increment view count for analytics.
 */
export const incrementViews = async (id) => {
  const resource = await Resource.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!resource) {
    const error = new Error("Resource not found");
    error.statusCode = 404;
    throw error;
  }
  return resource;
};

/**
 * Delete a resource (Admin).
 */
export const deleteResource = async (id) => {
  const resource = await Resource.findByIdAndDelete(id);
  if (!resource) {
    const error = new Error("Resource not found");
    error.statusCode = 404;
    throw error;
  }
  return { id, message: "Resource deleted successfully" };
};
