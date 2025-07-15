import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[GENERATE-RECURRING-TASKS] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const today = new Date();
    logStep("Checking for due recurring schedules", { today: today.toISOString() });

    // Get all active recurring schedules that are due
    const { data: dueSchedules, error: scheduleError } = await supabaseClient
      .from('recurring_schedules')
      .select(`
        *,
        task_templates!recurring_schedules_template_id_fkey (
          id, title, description, category, subtasks, price, 
          is_payable_task, payable_task_type, deadline
        ),
        clients (
          id, name, email, phone
        )
      `)
      .eq('is_active', true)
      .lte('next_generation_date', today.toISOString());

    if (scheduleError) {
      throw new Error(`Error fetching schedules: ${scheduleError.message}`);
    }

    logStep("Found due schedules", { count: dueSchedules?.length || 0 });

    let generatedCount = 0;

    for (const schedule of dueSchedules || []) {
      try {
        const template = schedule.task_templates;
        if (!template) {
          logStep("Skipping schedule without template", { scheduleId: schedule.id });
          continue;
        }

        // Calculate due date based on template and category
        let dueDate = new Date();
        if (template.category === 'gst') {
          // GST deadlines: 10th for GSTR-1, 20th for GSTR-3B
          dueDate.setDate(template.deadline?.includes('3B') ? 20 : 10);
          dueDate.setMonth(dueDate.getMonth() + 1); // Next month
        } else if (template.category === 'itr') {
          // ITR deadline: July 31st of next year
          dueDate = new Date(dueDate.getFullYear() + 1, 6, 31); // July 31st
        } else if (template.category === 'roc') {
          // ROC deadline: 30 days from generation
          dueDate.setDate(dueDate.getDate() + 30);
        } else {
          // Default: 30 days
          dueDate.setDate(dueDate.getDate() + 30);
        }

        // Create task from template
        const taskData = {
          title: template.title,
          description: template.description,
          category: template.category,
          client_id: schedule.client_id,
          client_name: schedule.clients?.name,
          assigned_to: schedule.assigned_to || [],
          due_date: dueDate.toISOString(),
          priority: 'high',
          status: 'todo',
          subtasks: template.subtasks || [],
          is_payable_task: template.is_payable_task || false,
          price: template.price,
          payable_task_type: template.payable_task_type,
          template_id: template.id,
          is_recurring: true,
          recurrence_pattern: schedule.task_templates?.recurrence_pattern || 'monthly',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newTask, error: taskError } = await supabaseClient
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

        if (taskError) {
          logStep("Error creating task", { error: taskError, scheduleId: schedule.id });
          continue;
        }

        // Calculate next generation date
        let nextDate = new Date();
        if (template.category === 'gst') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (template.category === 'itr' || template.category === 'roc') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }

        // Update recurring schedule
        const { error: updateError } = await supabaseClient
          .from('recurring_schedules')
          .update({
            last_generated_at: new Date().toISOString(),
            next_generation_date: nextDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);

        if (updateError) {
          logStep("Error updating schedule", { error: updateError, scheduleId: schedule.id });
        } else {
          generatedCount++;
          logStep("Task generated successfully", { 
            taskId: newTask.id, 
            scheduleId: schedule.id,
            nextDate: nextDate.toISOString()
          });
        }

      } catch (taskError) {
        logStep("Error processing schedule", { error: taskError, scheduleId: schedule.id });
      }
    }

    logStep("Function completed", { generatedTasks: generatedCount });

    return new Response(JSON.stringify({ 
      success: true, 
      generated_tasks: generatedCount,
      message: `Generated ${generatedCount} recurring tasks`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});