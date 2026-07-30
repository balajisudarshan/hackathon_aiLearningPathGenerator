import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "../models/Resource.js";

// Load env vars
dotenv.config({ path: "../.env" });

const seedData = [
  // React
  { title: "React Official Documentation", description: "The best place to learn React.", type: "documentation", url: "https://react.dev/", provider: "React", technology: "react", category: "frontend", tags: ["basics", "hooks", "components", "jsx"], difficulty: "all", isCurated: true },
  { title: "React in 100 Seconds", description: "Lightning-fast overview of React.", type: "video", url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM", provider: "Fireship", technology: "react", category: "frontend", tags: ["intro", "overview"], difficulty: "beginner", isCurated: true },
  { title: "React Course - Beginner's Tutorial", description: "Full React Course for Beginners.", type: "video", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", provider: "FreeCodeCamp", technology: "react", category: "frontend", tags: ["tutorial", "hooks", "basics"], difficulty: "beginner", isCurated: true },
  { title: "Advanced React Patterns", description: "Learn advanced patterns in React.", type: "course", url: "https://advancedreact.com/", provider: "Wes Bos", technology: "react", category: "frontend", tags: ["advanced", "patterns", "performance"], difficulty: "advanced", isCurated: true },

  // Node.js
  { title: "Node.js Crash Course", description: "Fundamentals of Node.js.", type: "video", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", provider: "Traversy Media", technology: "node.js", category: "backend", tags: ["intro", "api", "server"], difficulty: "beginner", isCurated: true },
  { title: "Node.js Official Docs", description: "Node.js reference documentation.", type: "documentation", url: "https://nodejs.org/en/docs/", provider: "Node.js", technology: "node.js", category: "backend", tags: ["reference", "api"], difficulty: "intermediate", isCurated: true },
  { title: "Learn Node.js - Full Course", description: "Node.js tutorial for beginners.", type: "video", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", provider: "FreeCodeCamp", technology: "node.js", category: "backend", tags: ["tutorial", "express", "server"], difficulty: "beginner", isCurated: true },

  // Python
  { title: "Learn Python - Full Course", description: "Comprehensive Python course.", type: "video", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", provider: "FreeCodeCamp", technology: "python", category: "backend", tags: ["intro", "programming"], difficulty: "beginner", isCurated: true },
  { title: "Python Official Documentation", description: "The official Python docs.", type: "documentation", url: "https://docs.python.org/3/", provider: "Python Foundation", technology: "python", category: "backend", tags: ["reference", "standard library"], difficulty: "all", isCurated: true },
  { title: "Python OOP Tutorial", description: "Object Oriented Programming in Python.", type: "video", url: "https://www.youtube.com/watch?v=JeznW_7DlB0", provider: "Corey Schafer", technology: "python", category: "backend", tags: ["oop", "classes"], difficulty: "intermediate", isCurated: true },

  // JavaScript
  { title: "JavaScript Info", description: "The Modern JavaScript Tutorial.", type: "documentation", url: "https://javascript.info/", provider: "Ilya Kantor", technology: "javascript", category: "frontend", tags: ["es6", "dom", "functions"], difficulty: "all", isCurated: true },
  { title: "JavaScript Crash Course", description: "Learn JS basics fast.", type: "video", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c", provider: "Traversy Media", technology: "javascript", category: "frontend", tags: ["basics", "syntax"], difficulty: "beginner", isCurated: true },
  { title: "Eloquent JavaScript", description: "A Modern Introduction to Programming.", type: "book", url: "https://eloquentjavascript.net/", provider: "Marijn Haverbeke", technology: "javascript", category: "frontend", tags: ["book", "deep dive", "fundamentals"], difficulty: "intermediate", isCurated: true },

  // HTML & CSS
  { title: "MDN Web Docs: HTML", description: "Ultimate reference for HTML.", type: "documentation", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", provider: "Mozilla", technology: "html", category: "frontend", tags: ["web", "basics"], difficulty: "beginner", isCurated: true },
  { title: "CSS Tricks", description: "Tips, tricks, and techniques on CSS.", type: "article", url: "https://css-tricks.com/", provider: "CSS Tricks", technology: "css", category: "frontend", tags: ["styling", "flexbox", "grid"], difficulty: "intermediate", isCurated: true },
  { title: "Tailwind CSS Crash Course", description: "Utility-first CSS styling.", type: "video", url: "https://www.youtube.com/watch?v=UBOj6rqRUME", provider: "Traversy Media", technology: "tailwindcss", category: "frontend", tags: ["css", "styling", "ui"], difficulty: "intermediate", isCurated: true },

  // MongoDB
  { title: "MongoDB Crash Course", description: "Learn NoSQL database basics.", type: "video", url: "https://www.youtube.com/watch?v=-56x56UppqQ", provider: "Traversy Media", technology: "mongodb", category: "database", tags: ["nosql", "database", "mongoose"], difficulty: "beginner", isCurated: true },
  { title: "Mongoose ODM Documentation", description: "Elegant mongodb object modeling.", type: "documentation", url: "https://mongoosejs.com/docs/", provider: "Mongoose", technology: "mongodb", category: "database", tags: ["node.js", "schema", "models"], difficulty: "intermediate", isCurated: true },

  // Machine Learning / Data Science
  { title: "Machine Learning for Everybody", description: "ML basics with Python.", type: "video", url: "https://www.youtube.com/watch?v=i_LwzRmA_08", provider: "FreeCodeCamp", technology: "machine learning", category: "ai", tags: ["python", "data science"], difficulty: "beginner", isCurated: true },
  { title: "TensorFlow Documentation", description: "An end-to-end open source machine learning platform.", type: "documentation", url: "https://www.tensorflow.org/learn", provider: "Google", technology: "tensorflow", category: "ai", tags: ["deep learning", "neural networks"], difficulty: "advanced", isCurated: true },
  { title: "Pandas Data Analysis", description: "Data analysis in Python.", type: "video", url: "https://www.youtube.com/watch?v=zyGcbOU12XQ", provider: "Corey Schafer", technology: "pandas", category: "data science", tags: ["python", "data manipulation"], difficulty: "intermediate", isCurated: true },

  // DevOps & Docker
  { title: "Docker Tutorial for Beginners", description: "Learn Docker fast.", type: "video", url: "https://www.youtube.com/watch?v=pTFZFxd4hOI", provider: "TechWorld with Nana", technology: "docker", category: "devops", tags: ["containers", "deployment"], difficulty: "beginner", isCurated: true },
  { title: "Git and GitHub for Beginners", description: "Version control crash course.", type: "video", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", provider: "FreeCodeCamp", technology: "git", category: "devops", tags: ["version control", "collaboration"], difficulty: "beginner", isCurated: true },

  // TypeScript
  { title: "TypeScript Crash Course", description: "Static typing for JavaScript.", type: "video", url: "https://www.youtube.com/watch?v=BCg4U1FzODs", provider: "Traversy Media", technology: "typescript", category: "frontend", tags: ["types", "interfaces"], difficulty: "intermediate", isCurated: true },
  { title: "TypeScript Handbook", description: "Official TS guide.", type: "documentation", url: "https://www.typescriptlang.org/docs/handbook/intro.html", provider: "Microsoft", technology: "typescript", category: "frontend", tags: ["types", "compiler"], difficulty: "all", isCurated: true },

  // Java
  { title: "Java Tutorial for Beginners", description: "Complete Java course.", type: "video", url: "https://www.youtube.com/watch?v=eIrMbAQSU34", provider: "Programming with Mosh", technology: "java", category: "backend", tags: ["oop", "enterprise"], difficulty: "beginner", isCurated: true },

  // SQL
  { title: "SQL Tutorial - Full Database Course", description: "Learn SQL from scratch.", type: "video", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", provider: "FreeCodeCamp", technology: "sql", category: "database", tags: ["relational", "queries", "joins"], difficulty: "beginner", isCurated: true },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai_learning_path";
    console.log(`Connecting to MongoDB at ${mongoUri}...`);

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected.");

    console.log("Clearing old resources...");
    await Resource.deleteMany();

    console.log("Inserting seed data...");
    await Resource.insertMany(seedData);

    console.log(`Successfully inserted ${seedData.length} resources!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding DB:", error);
    process.exit(1);
  }
};

seedDB();
