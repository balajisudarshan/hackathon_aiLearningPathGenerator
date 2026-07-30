import {
  createResource,
  searchResources,
  getResourceById,
  incrementViews,
  deleteResource,
  getRecommendedResources,
} from "../services/resource.service.js";

/**
 * POST /api/resources
 * Create a new curated resource.
 */
export const createResourceController = async (req, res) => {
  try {
    const resource = await createResource(req.body);
    return res.status(201).json({
      success: true,
      message: "Resource added successfully",
      resource,
    });
  } catch (error) {
    console.error("Error in createResourceController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * GET /api/resources
 * Search resources with text and filters.
 */
export const searchResourcesController = async (req, res) => {
  try {
    const { q, technology, difficulty, page, limit } = req.query;
    const result = await searchResources({
      query: q,
      technology,
      difficulty,
      page,
      limit,
    });
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in searchResourcesController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * POST /api/resources/recommend
 * Internal/Frontend tool to manually test AI tag matching.
 */
export const testRecommendationController = async (req, res) => {
  try {
    const { technology, tags, difficulty } = req.body;
    
    if (!technology) {
      return res.status(400).json({
        success: false,
        message: "technology is required for recommendations",
      });
    }

    const resources = await getRecommendedResources(technology, tags, difficulty);
    return res.status(200).json({
      success: true,
      resources,
    });
  } catch (error) {
    console.error("Error in testRecommendationController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * GET /api/resources/:id
 */
export const getResourceByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await getResourceById(id);
    return res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    console.error("Error in getResourceByIdController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * PATCH /api/resources/:id
 * E.g., increment views.
 */
export const updateResourceController = async (req, res) => {
  try {
    const { id } = req.params;
    const { views } = req.body; // For MVP, only exposing views increment
    
    let resource;
    if (views) {
      resource = await incrementViews(id);
    } else {
      // Stub for full update if needed later
      return res.status(400).json({ success: false, message: "No valid update fields provided" });
    }

    return res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    console.error("Error in updateResourceController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * DELETE /api/resources/:id
 */
export const deleteResourceController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteResource(id);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in deleteResourceController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
