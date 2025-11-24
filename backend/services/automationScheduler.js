import cron from 'node-cron';
import Settings from '../models/Settings.js';
import RecurrencePattern from '../models/RecurrencePattern.js';
import TaskTemplate from '../models/TaskTemplate.js';
import Task from '../models/Task.js';

class AutomationScheduler {
  constructor() {
    this.scheduledJobs = new Map();
    this.isRunning = false;
  }

  /**
   * Initialize the automation scheduler
   * Loads settings from database and schedules jobs
   */
  async initialize() {
    try {
      console.log('🤖 Initializing Automation Scheduler...');
      
      // Get all firms with automation enabled
      const allSettings = await Settings.find({}).lean();
      
      for (const setting of allSettings) {
        const automation = setting.data?.automation;
        if (automation?.enabled) {
          await this.scheduleJobForFirm(setting.firm, automation.autoRunTime || '09:00');
        }
      }
      
      this.isRunning = true;
      console.log('✅ Automation Scheduler initialized successfully');
      console.log(`📊 Active schedules: ${this.scheduledJobs.size}`);
    } catch (error) {
      console.error('❌ Failed to initialize Automation Scheduler:', error);
    }
  }

  /**
   * Schedule a cron job for a specific firm
   * @param {ObjectId} firmId - Firm ID
   * @param {string} time - Time in HH:mm format (e.g., "09:00")
   */
  async scheduleJobForFirm(firmId, time = '09:00') {
    try {
      // Cancel existing job if any
      this.cancelJobForFirm(firmId);

      // Parse time (format: HH:mm)
      const [hours, minutes] = time.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error(`Invalid time format for firm ${firmId}: ${time}`);
        return;
      }

      // Create cron expression: "minute hour * * *" (every day at specified time)
      const cronExpression = `${minutes} ${hours} * * *`;

      // Schedule the job
      const job = cron.schedule(cronExpression, async () => {
        console.log(`🔄 Running automated task generation for firm ${firmId} at ${time}`);
        await this.generateTasksForFirm(firmId);
      }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Indian timezone
      });

      this.scheduledJobs.set(firmId.toString(), {
        job,
        time,
        cronExpression
      });

      console.log(`✅ Scheduled automation for firm ${firmId} at ${time} (${cronExpression})`);
    } catch (error) {
      console.error(`Failed to schedule job for firm ${firmId}:`, error);
    }
  }

  /**
   * Cancel scheduled job for a firm
   * @param {ObjectId} firmId - Firm ID
   */
  cancelJobForFirm(firmId) {
    const jobInfo = this.scheduledJobs.get(firmId.toString());
    if (jobInfo) {
      jobInfo.job.stop();
      this.scheduledJobs.delete(firmId.toString());
      console.log(`🛑 Cancelled automation schedule for firm ${firmId}`);
    }
  }

  /**
   * Generate recurring tasks for a specific firm
   * @param {ObjectId} firmId - Firm ID
   */
  async generateTasksForFirm(firmId) {
    try {
      // Get all active patterns for this firm
      const patterns = await RecurrencePattern.find({ 
        firm: firmId,
        isActive: true 
      });

      if (patterns.length === 0) {
        console.log(`ℹ️ No active recurrence patterns for firm ${firmId}`);
        return { count: 0, tasks: [] };
      }

      // Get templates associated with these patterns
      const templates = await TaskTemplate.find({
        firm: firmId,
        recurrencePattern: { $in: patterns.map(p => p._id) }
      }).populate('client').populate('assignedTo');

      let generatedCount = 0;
      const createdTasks = [];

      for (const template of templates) {
        try {
          const pattern = await RecurrencePattern.findById(template.recurrencePattern);
          if (!pattern) continue;

          const nextDate = pattern.getNextOccurrence();
          if (!nextDate) continue;

          // Check if task for this date already exists
          const startOfDay = new Date(nextDate);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(nextDate);
          endOfDay.setHours(23, 59, 59, 999);

          const existing = await Task.findOne({
            template: template._id,
            firm: firmId,
            dueDate: { 
              $gte: startOfDay,
              $lt: endOfDay
            }
          });

          if (existing) {
            console.log(`⏭️ Task already exists for template ${template.title} on ${nextDate.toDateString()}`);
            continue;
          }

          // Create new task from template
          const task = await Task.create({
            title: template.title,
            description: template.description,
            category: template.category,
            priority: template.priority,
            status: 'todo',
            dueDate: nextDate,
            client: template.client?._id || template.client,
            assignedTo: template.assignedTo?.map(u => u._id || u) || [],
            template: template._id,
            firm: firmId,
            createdBy: template.createdBy,
            tags: [...(template.tags || []), 'auto-generated'],
            isRecurring: true
          });

          createdTasks.push(task);
          generatedCount++;

          // Update template last generated date
          template.lastGenerated = new Date();
          await template.save();

          console.log(`✅ Generated task: ${task.title} (due: ${nextDate.toDateString()})`);
        } catch (error) {
          console.error(`Failed to generate task from template ${template._id}:`, error);
        }
      }

      console.log(`🎉 Generated ${generatedCount} tasks for firm ${firmId}`);
      return { count: generatedCount, tasks: createdTasks };
    } catch (error) {
      console.error(`Error generating tasks for firm ${firmId}:`, error);
      return { count: 0, tasks: [], error: error.message };
    }
  }

  /**
   * Update schedule when settings change
   * @param {ObjectId} firmId - Firm ID
   * @param {boolean} enabled - Whether automation is enabled
   * @param {string} time - Time in HH:mm format
   */
  async updateSchedule(firmId, enabled, time) {
    if (enabled) {
      await this.scheduleJobForFirm(firmId, time);
    } else {
      this.cancelJobForFirm(firmId);
    }
  }

  /**
   * Get status of all scheduled jobs
   */
  getStatus() {
    const status = [];
    for (const [firmId, jobInfo] of this.scheduledJobs.entries()) {
      status.push({
        firmId,
        time: jobInfo.time,
        cronExpression: jobInfo.cronExpression,
        isActive: true
      });
    }
    return {
      isRunning: this.isRunning,
      activeJobs: status.length,
      jobs: status
    };
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    for (const [firmId, jobInfo] of this.scheduledJobs.entries()) {
      jobInfo.job.stop();
    }
    this.scheduledJobs.clear();
    this.isRunning = false;
    console.log('🛑 All automation schedules stopped');
  }
}

// Create singleton instance
const automationScheduler = new AutomationScheduler();

export default automationScheduler;
