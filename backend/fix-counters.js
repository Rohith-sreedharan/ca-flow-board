import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/Task.js';
import Counter from './models/Counter.js';

dotenv.config({ path: '../.env' });

async function fixCounters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all firms that have tasks
    const firms = await Task.distinct('firm');
    console.log(`\n📊 Found ${firms.length} firms with tasks`);

    for (const firmId of firms) {
      // Find the highest taskId for this firm
      const tasks = await Task.find({ 
        firm: firmId,
        taskId: /^TSK\d+$/ 
      })
        .sort({ taskId: -1 })
        .limit(1)
        .select('taskId');
      
      if (tasks.length > 0) {
        const lastTaskId = tasks[0].taskId;
        const lastNumber = parseInt(lastTaskId.replace(/^[A-Z]+/, ''));
        
        console.log(`\n🏢 Firm ${firmId}:`);
        console.log(`  Last task: ${lastTaskId}`);
        console.log(`  Last number: ${lastNumber}`);
        
        // Update or create counter with the correct sequence
        const counterId = `task_${firmId}`;
        await Counter.findOneAndUpdate(
          { _id: counterId },
          { $set: { seq: lastNumber } },
          { upsert: true }
        );
        
        console.log(`  ✅ Counter set to: ${lastNumber}`);
      }
    }

    // Show all counters
    const counters = await Counter.find();
    console.log('\n\n🔢 Updated counters:');
    counters.forEach(c => console.log(`  ${c._id}: ${c.seq}`));

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCounters();
