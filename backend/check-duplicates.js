import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/Task.js';

dotenv.config({ path: '../.env' });

async function checkDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all TSK0011 tasks
    const duplicates = await Task.find({ taskId: 'TSK0011' })
      .select('taskId title createdAt');
    
    console.log(`\n📊 Found ${duplicates.length} task(s) with ID TSK0011:`);
    duplicates.forEach((t, i) => {
      console.log(`\n  ${i + 1}. ${t.taskId} - ${t.title}`);
      console.log(`     Created: ${t.createdAt}`);
      console.log(`     _id: ${t._id}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDuplicates();
