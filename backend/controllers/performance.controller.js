import { getUserPerformance } from "../services/performance.service.js";

/**
 * GET /api/performance
 * Fetch performance metrics and diagnostic suggestions for the authenticated user.
 */
export const getUserPerformanceController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const performance = await getUserPerformance(userId);

    return res.status(200).json({
      success: true,
      performance,
    });
  } catch (error) {
    console.error("Error in getUserPerformanceController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
