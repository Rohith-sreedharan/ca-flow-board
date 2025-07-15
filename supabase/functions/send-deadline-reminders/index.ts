import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[SEND-DEADLINE-REMINDERS] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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

    // Check automation settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('automation_settings')
      .select('deadline_reminders_enabled, reminder_days_before, whatsapp_notifications')
      .single();

    if (settingsError || !settings?.deadline_reminders_enabled) {
      logStep("Deadline reminders disabled");
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Deadline reminders are disabled' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const reminderDays = settings.reminder_days_before || 3;
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + reminderDays);

    logStep("Checking for tasks due in", { days: reminderDays, date: reminderDate.toISOString() });

    // Get tasks that are due soon
    const { data: dueTasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select(`
        id, title, description, due_date, priority, assigned_to,
        client_id, client_name,
        clients (
          id, name, email, phone
        )
      `)
      .eq('status', 'todo')
      .lte('due_date', reminderDate.toISOString())
      .gt('due_date', new Date().toISOString());

    if (tasksError) {
      throw new Error(`Error fetching due tasks: ${tasksError.message}`);
    }

    logStep("Found tasks due soon", { count: dueTasks?.length || 0 });

    let remindersGenerated = 0;

    for (const task of dueTasks || []) {
      try {
        const dueDate = new Date(task.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        // Check if reminder already sent today
        const today = new Date().toISOString().split('T')[0];
        const { data: existingReminder } = await supabaseClient
          .from('client_communications')
          .select('id')
          .eq('communication_type', 'reminder')
          .eq('client_id', task.client_id)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lte('created_at', `${today}T23:59:59.999Z`)
          .contains('metadata', { task_id: task.id })
          .single();

        if (existingReminder) {
          logStep("Reminder already sent today", { taskId: task.id });
          continue;
        }

        // Create reminder message
        const message = `📅 Task Reminder\n\n` +
          `Task: ${task.title}\n` +
          `Due Date: ${dueDate.toLocaleDateString()}\n` +
          `Days Until Due: ${daysUntilDue}\n` +
          `Priority: ${task.priority.toUpperCase()}\n\n` +
          `Please ensure completion before the deadline.`;

        // Log reminder communication
        const communicationData = {
          communication_type: 'reminder',
          client_id: task.client_id,
          message: message,
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: {
            task_id: task.id,
            days_until_due: daysUntilDue,
            reminder_type: 'deadline'
          }
        };

        const { error: commError } = await supabaseClient
          .from('client_communications')
          .insert(communicationData);

        if (commError) {
          logStep("Error logging reminder", { error: commError, taskId: task.id });
          continue;
        }

        // If WhatsApp notifications enabled and client has phone, generate WhatsApp link
        if (settings.whatsapp_notifications && task.clients?.phone) {
          try {
            const cleanPhone = task.clients.phone.replace(/\D/g, '');
            const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
            const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
            
            logStep("WhatsApp reminder generated", { 
              taskId: task.id, 
              phone: formattedPhone,
              url: whatsappUrl
            });
          } catch (whatsappError) {
            logStep("Error generating WhatsApp reminder", { error: whatsappError, taskId: task.id });
          }
        }

        remindersGenerated++;
        logStep("Reminder generated successfully", { 
          taskId: task.id, 
          clientId: task.client_id,
          daysUntilDue
        });

      } catch (taskError) {
        logStep("Error processing task reminder", { error: taskError, taskId: task.id });
      }
    }

    logStep("Function completed", { remindersGenerated });

    return new Response(JSON.stringify({ 
      success: true, 
      reminders_generated: remindersGenerated,
      message: `Generated ${remindersGenerated} deadline reminders`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
});