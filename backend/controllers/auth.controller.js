import {
  registerUser,
  loginUser,
  googleAuthUser,
  getUserProfile,
} from "../services/auth.service.js";

// Helper to set HTTP-Only Cookie
const setAuthCookie = (res, accessToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Register Controller
 */
export const registerController = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const { user, accessToken } = await registerUser({
      email,
      password,
      firstName,
      lastName,
    });

    setAuthCookie(res, accessToken);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
      accessToken,
    });
  } catch (error) {
    console.error("Error in Register Controller:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Login Controller
 */
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const { user, accessToken } = await loginUser({ email, password });

    setAuthCookie(res, accessToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (error) {
    console.error("Error in Login Controller:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Google Auth Controller
 */
export const googleAuthController = async (req, res) => {
  try {
    const credential = req.body.credential || req.body.token || req.body.idToken;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Missing token" });
    }

    const { user, accessToken } = await googleAuthUser(credential);

    setAuthCookie(res, accessToken);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user,
      accessToken,
    });
  } catch (error) {
    console.error("Error in Google Auth Controller:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Logout Controller
 */
export const logoutController = (req, res) => {
  res.clearCookie("accessToken");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * Get Current User Controller
 */
export const getCurrentUserController = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error in Get Current User Controller:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
