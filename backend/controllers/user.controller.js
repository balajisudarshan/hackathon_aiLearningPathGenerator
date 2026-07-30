import {
  getUserProfile,
  updateUserProfile,
  skipOnboarding,
  extractAndSaveProfile,
} from "../services/user.service.js";

/**
 * GET /api/user/profile
 */
export const getProfileController = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.userId);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in getProfileController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * PUT /api/user/profile
 * Manual update of profile/preferences fields.
 */
export const updateProfileController = async (req, res) => {
  try {
    const user = await updateUserProfile(req.user.userId, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in updateProfileController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * POST /api/user/profile/skip-onboarding
 * Mark onboarding as skipped.
 */
export const skipOnboardingController = async (req, res) => {
  try {
    const user = await skipOnboarding(req.user.userId);
    return res.status(200).json({
      success: true,
      message: "Onboarding skipped",
      user,
    });
  } catch (error) {
    console.error("Error in skipOnboardingController:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * POST /api/user/profile/extract
 * AI extracts a structured profile from free-form description text.
 */
export const extractProfileController = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a description of at least 10 characters",
      });
    }

    const { user, extracted } = await extractAndSaveProfile(req.user.userId, text);

    return res.status(200).json({
      success: true,
      message: "Profile extracted and saved successfully",
      preferences: user.preferences,
      extracted, // raw AI output — useful for frontend to show what was understood
    });
  } catch (error) {
    console.error("Error in extractProfileController:", error);

    // Handle AI rate limits
    if (
      error.status === 429 ||
      error.statusCode === 429 ||
      error.message?.includes("429") ||
      error.message?.includes("rate_limit")
    ) {
      return res.status(429).json({
        success: false,
        message: "AI service is temporarily unavailable. Please try again in a moment.",
        retryAfter: 60,
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
