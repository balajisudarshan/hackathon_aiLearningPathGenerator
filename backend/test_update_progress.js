import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Roadmap from './models/Roadmap.js';
import { updateTopicProgress } from './services/roadmap.service.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const roadmap = await Roadmap.findOne();
  if (!roadmap) {
    console.log("No roadmap found");
    process.exit(0);
  }

  console.log("Roadmap ID:", roadmap._id.toString());
  console.log("User ID:", roadmap.userId.toString());

  const section = roadmap.sections[0];
  const topic = section.topics[0];

  console.log("Target Topic ID:", topic._id ? topic._id.toString() : topic.id);
  console.log("Initial isCompleted:", topic.isCompleted);

  const updated = await updateTopicProgress(
    roadmap._id.toString(),
    section._id ? section._id.toString() : "",
    topic._id ? topic._id.toString() : topic.id,
    true,
    roadmap.userId
  );

  console.log("Updated Topic isCompleted in returned doc:", updated.sections[0].topics[0].isCompleted);

  // Fetch fresh from DB to verify persistence!
  const fresh = await Roadmap.findById(roadmap._id);
  console.log("Fresh DB query isCompleted:", fresh.sections[0].topics[0].isCompleted);

  // Reset back to false
  await updateTopicProgress(
    roadmap._id.toString(),
    section._id ? section._id.toString() : "",
    topic._id ? topic._id.toString() : topic.id,
    false,
    roadmap.userId
  );
  const freshReset = await Roadmap.findById(roadmap._id);
  console.log("Fresh DB query after reset:", freshReset.sections[0].topics[0].isCompleted);

  mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
