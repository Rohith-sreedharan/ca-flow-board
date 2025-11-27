import cron from 'node-cron';
import Task from '../models/Task.js';

class RecurringTaskService {
  constructor() {
    this.scheduledJobs = new Map();
    this.isRunning = false;
  }

  /**
   * Initialize the recurring task service
   * Schedule a daily cron job to check and generate recurring tasks
   */
  async initialize() {
    try {
      console.log('🔄 Initializing Recurring Task Service...');
      
      // Run every day at 2:00 AM to check for tasks that need to be created
      const job = cron.schedule('0 2 * * *', async () => {
        console.log('🔄 Running recurring task generation check...');
        await this.checkAndGenerateRecurringTasks();
      }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
      });

      this.scheduledJobs.set('main', job);
      this.isRunning = true;
      
      console.log('✅ Recurring Task Service initialized successfully');
      console.log('📅 Daily check scheduled at 2:00 AM IST');
    } catch (error) {
      console.error('❌ Failed to initialize Recurring Task Service:', error);
    }
  }

  /**
   * Check all recurring tasks and generate new instances if needed
   */
  async checkAndGenerateRecurringTasks() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all recurring tasks
      const recurringTasks = await Task.find({
        isRecurring: true,
        recurrence_interval: { $exists: true, $ne: null }
      }).populate('client').populate('assignedTo').populate('collaborators');

      console.log(`📊 Found ${recurringTasks.length} recurring tasks to check`);

      let generatedCount = 0;
      const createdTasks = [];

      for (const task of recurringTasks) {
        try {
          // Calculate next due date based on recurrence_interval
          const nextDueDate = this.calculateNextDueDate(task);
          
          if (!nextDueDate) {
            continue;
          }

          // Check if we should generate task today
          const shouldGenerate = this.shouldGenerateToday(task, nextDueDate, today);
          
          if (!shouldGenerate) {
            continue;
          }

          // Check if task for this date already exists
          const existingTask = await Task.findOne({
            title: task.title,
            client: task.client?._id,
            category: task.category,
            sub_category: task.sub_category,
            dueDate: {
              $gte: nextDueDate,
              $lt: new Date(nextDueDate.getTime() + 24 * 60 * 60 * 1000)
            },
            firm: task.firm
          });

          if (existingTask) {
            console.log(`⏭️ Task already exists: ${task.title} for ${nextDueDate.toDateString()}`);
            continue;
          }

          // Create new task instance
          const newTask = await Task.create({
            title: task.title,
            description: task.description,
            type: task.type,
            category: task.category,
            sub_category: task.sub_category,
            priority: task.priority,
            status: 'todo',
            dueDate: nextDueDate,
            client: task.client?._id,
            assignedTo: task.assignedTo?._id,
            collaborators: task.collaborators?.map(c => c._id) || [],
            assignedBy: task.assignedBy,
            firm: task.firm,
            isRecurring: false, // Generated tasks are not recurring themselves
            parentTask: task._id,
            tags: [...(task.tags || []), 'auto-generated', 'recurring'],
            billable: task.billable,
            estimatedHours: task.estimatedHours,
            hourlyRate: task.hourlyRate,
            fixedPrice: task.fixedPrice,
            subtasks: task.subtasks || []
          });

          createdTasks.push(newTask);
          generatedCount++;

          console.log(`✅ Generated recurring task: ${newTask.title} (due: ${nextDueDate.toDateString()})`);
        } catch (error) {
          console.error(`Failed to generate task from ${task._id}:`, error);
        }
      }

      console.log(`🎉 Generated ${generatedCount} recurring tasks`);
      return { count: generatedCount, tasks: createdTasks };
    } catch (error) {
      console.error('Error checking recurring tasks:', error);
      return { count: 0, tasks: [], error: error.message };
    }
  }

  /**
   * Calculate next due date for a recurring task
   */
  calculateNextDueDate(task) {
    const today = new Date();
    const originalDueDate = new Date(task.dueDate);
    
    if (!task.recurrence_interval) {
      return null;
    }

    // If task has monthly date specified (e.g., 10 for 10th of every month)
    if (task.recurrence_monthly_date) {
      const nextDate = new Date(today);
      nextDate.setDate(task.recurrence_monthly_date);
      nextDate.setHours(0, 0, 0, 0);
      
      // If the date has passed this month, move to next month
      if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      
      return nextDate;
    }

    // Otherwise, use interval-based calculation
    const daysSinceOriginal = Math.floor((today - originalDueDate) / (24 * 60 * 60 * 1000));
    const cycles = Math.floor(daysSinceOriginal / task.recurrence_interval);
    const nextDate = new Date(originalDueDate);
    nextDate.setDate(nextDate.getDate() + (cycles + 1) * task.recurrence_interval);
    
    return nextDate;
  }

  /**
   * Check if task should be generated today
   * Generate tasks 7 days in advance
   */
  shouldGenerateToday(task, nextDueDate, today) {
    const daysUntilDue = Math.floor((nextDueDate - today) / (24 * 60 * 60 * 1000));
    
    // Generate tasks 7 days before due date
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    for (const [key, job] of this.scheduledJobs.entries()) {
      job.stop();
    }
    this.scheduledJobs.clear();
    this.isRunning = false;
    console.log('🛑 Recurring Task Service stopped');
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.scheduledJobs.size
    };
  }
}

// Create singleton instance
const recurringTaskService = new RecurringTaskService();

export default recurringTaskService;
