import mongoose from "mongoose";

// Individual skill entry
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
  },
  { _id: false }
);

// Nested preferences schema
const preferencesSchema = new mongoose.Schema(
  {
    onboardingCompleted: { type: Boolean, default: false },
    onboardingSkipped: { type: Boolean, default: false },

    // Who they are
    currentRole: { type: String, default: "" },
    targetRole: { type: String, default: "" },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", ""],
      default: "",
    },

    // What they want to learn
    goals: { type: [String], default: [] },
    skills: { type: [skillSchema], default: [] },
    interests: { type: [String], default: [] },

    // How they learn
    learningStyle: {
      type: String,
      enum: ["visual", "reading", "hands-on", "mixed", ""],
      default: "",
    },
    weeklyHoursAvailable: { type: Number, default: 0 },
    preferredLanguage: { type: String, default: "" },

    // AI-generated natural language summary (injected into chat prompts)
    aiProfileSummary: { type: String, default: "" },
    lastExtractedAt: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    googleId: { type: String, default: null },

    // Rich learning preferences (populated by AI or manual update)
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// Clean up sensitive fields in JSON output
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
