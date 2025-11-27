import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/Task.js';
import Counter from './models/Counter.js';

dotenv.config({ path: '../.env' });

async function checkCounters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the highest taskId number
    const tasks = await Task.find({ taskId: /^TSK\d+$/ })
      .sort({ taskId: -1 })
      .limit(5)
      .select('taskId');
    
    console.log('\n📊 Last 5 tasks:');
    tasks.forEach(t => console.log(`  ${t.taskId}`));
    
    if (tasks.length > 0) {
      const lastTaskId = tasks[0].taskId;
      const lastNumber = parseInt(lastTaskId.replace('TSK', ''));
      console.log(`\n🔢 Highest task number: ${lastNumber}`);
    }

    // Check counters
    const counters = await Counter.find();
    console.log('\n🔢 Counters in database:');
    counters.forEach(c => console.log(`  ${c._id}: ${c.seq}`));

    // Count total tasks
    const count = await Task.countDocuments();
    console.log(`\n📝 Total tasks: ${count}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCounters();
