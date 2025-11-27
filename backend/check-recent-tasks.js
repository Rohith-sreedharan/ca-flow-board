import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/Task.js';

dotenv.config({ path: '../.env' });

async function checkRecentTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find tasks from TSK0012 onwards
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('taskId title createdAt');
    
    console.log(`\n📊 Found ${tasks.length} recent task(s):\n`);
    tasks.forEach((t) => {
      console.log(`  ${t.taskId} - ${t.title}`);
      console.log(`     Created: ${t.createdAt}`);
      console.log(`     _id: ${t._id}\n`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRecentTasks();
