import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Resource from '../models/Resource.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = [
  // React / Frontend
  {
    title: "React Official Documentation",
    description: "The best place to start learning React. Comprehensive guide on components, state, hooks, and advanced patterns.",
    type: "documentation",
    url: "https://react.dev/",
    technology: "React",
    category: "frontend",
    tags: ["hooks", "components", "state", "ui"],
    difficulty: "beginner"
  },
  {
    title: "Advanced React Patterns",
    description: "Master React by learning advanced design patterns like render props, compound components, and custom hooks.",
    type: "course",
    url: "https://advancedreact.com/",
    technology: "React",
    category: "frontend",
    tags: ["patterns", "architecture", "advanced hooks"],
    difficulty: "advanced"
  },
  
  // Python / Data
  {
    title: "Automate the Boring Stuff with Python",
    description: "Practical programming for total beginners. Learn Python by writing scripts that automate tedious tasks.",
    type: "article",
    url: "https://automatetheboringstuff.com/",
    technology: "Python",
    category: "backend",
    tags: ["automation", "scripting", "basics"],
    difficulty: "beginner"
  },
  {
    title: "Machine Learning Crash Course",
    description: "Google's fast-paced, practical introduction to machine learning using TensorFlow.",
    type: "course",
    url: "https://developers.google.com/machine-learning/crash-course",
    technology: "Machine Learning",
    category: "data science",
    tags: ["ai", "tensorflow", "neural networks", "models"],
    difficulty: "intermediate"
  },

  // System Design
  {
    title: "System Design Primer",
    description: "Learn how to design large-scale systems. Prep for the system design interview.",
    type: "github",
    url: "https://github.com/donnemartin/system-design-primer",
    technology: "System Design",
    category: "architecture",
    tags: ["scalability", "databases", "caching", "load balancing"],
    difficulty: "advanced"
  },
  
  // Backend / Node
  {
    title: "Node.js Best Practices",
    description: "Comprehensive guide to Node.js best practices, style guide, and architectural patterns.",
    type: "github",
    url: "https://github.com/goldbergyoni/nodebestpractices",
    technology: "Node.js",
    category: "backend",
    tags: ["best practices", "express", "architecture", "security"],
    difficulty: "intermediate"
  },
  
  // General Web / HTML / CSS
  {
    title: "MDN Web Docs",
    description: "Resources for developers, by developers. The ultimate resource for HTML, CSS, and JS.",
    type: "documentation",
    url: "https://developer.mozilla.org/en-US/",
    technology: "Web Development",
    category: "frontend",
    tags: ["html", "css", "javascript", "browser"],
    difficulty: "all"
  },

  // Databases
  {
    title: "PostgreSQL Tutorial",
    description: "Learn PostgreSQL fast and easy. Detailed tutorials with practical examples.",
    type: "article",
    url: "https://www.postgresqltutorial.com/",
    technology: "SQL",
    category: "database",
    tags: ["postgres", "relational", "queries"],
    difficulty: "beginner"
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing curated resources (optional, but good for resetting)
    await Resource.deleteMany({});
    console.log('Cleared existing resources.');

    // Insert seeds
    await Resource.insertMany(seedData);
    console.log(`Successfully seeded ${seedData.length} resources.`);

    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exit(1);
  }
};

seedDB();
