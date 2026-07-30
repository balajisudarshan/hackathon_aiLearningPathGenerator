import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Roadmap from './models/Roadmap.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const roadmaps = await Roadmap.find().limit(1);
  if (roadmaps.length > 0) {
    const rm = roadmaps[0];
    console.log("Roadmap ID:", rm._id);
    if (rm.sections && rm.sections[0] && rm.sections[0].topics) {
      console.log("First Topic in First Section:", rm.sections[0].topics[0].title, "| isCompleted:", rm.sections[0].topics[0].isCompleted, "| ID:", rm.sections[0].topics[0]._id);
    }
  } else {
    console.log("No roadmaps found");
  }

  mongoose.disconnect();
};

run().catch(console.error);
