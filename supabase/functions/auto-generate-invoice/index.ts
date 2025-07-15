import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[AUTO-GENERATE-INVOICE] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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
      .select('auto_invoice_generation')
      .single();

    if (settingsError || !settings?.auto_invoice_generation) {
      logStep("Auto invoice generation disabled");
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Auto invoice generation is disabled' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get completed payable tasks without invoices
    const { data: completedTasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select(`
        id, title, client_id, client_name, price, completed_at,
        clients (
          id, name, email
        )
      `)
      .eq('status', 'completed')
      .eq('is_payable_task', true)
      .is('payment_status', null)
      .not('price', 'is', null);

    if (tasksError) {
      throw new Error(`Error fetching completed tasks: ${tasksError.message}`);
    }

    logStep("Found completed payable tasks", { count: completedTasks?.length || 0 });

    let invoicesGenerated = 0;

    for (const task of completedTasks || []) {
      try {
        // Check if invoice already exists for this task
        const { data: existingInvoice } = await supabaseClient
          .from('invoices')
          .select('id')
          .eq('task_id', task.id)
          .single();

        if (existingInvoice) {
          logStep("Invoice already exists for task", { taskId: task.id });
          continue;
        }

        // Generate invoice number
        const { data: invoiceNumber, error: numberError } = await supabaseClient
          .rpc('generate_series_number', { series_type: 'invoice', prefix: 'INV' });

        if (numberError) {
          logStep("Error generating invoice number", numberError);
          continue;
        }

        // Calculate tax
        const amount = parseFloat(task.price.toString());
        const taxRate = 18; // 18% GST
        const taxAmount = (amount * taxRate) / 100;
        const totalAmount = amount + taxAmount;

        // Create invoice
        const invoiceData = {
          invoice_number: invoiceNumber,
          task_id: task.id,
          client_id: task.client_id,
          amount: amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          status: 'sent',
          issued_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newInvoice, error: invoiceError } = await supabaseClient
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();

        if (invoiceError) {
          logStep("Error creating invoice", { error: invoiceError, taskId: task.id });
          continue;
        }

        // Update task payment status
        const { error: taskUpdateError } = await supabaseClient
          .from('tasks')
          .update({ 
            payment_status: 'invoiced',
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (taskUpdateError) {
          logStep("Error updating task payment status", taskUpdateError);
        }

        invoicesGenerated++;
        logStep("Invoice generated successfully", { 
          invoiceId: newInvoice.id, 
          taskId: task.id,
          amount: totalAmount
        });

      } catch (taskError) {
        logStep("Error processing task", { error: taskError, taskId: task.id });
      }
    }

    logStep("Function completed", { invoicesGenerated });

    return new Response(JSON.stringify({ 
      success: true, 
      invoices_generated: invoicesGenerated,
      message: `Generated ${invoicesGenerated} invoices`
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