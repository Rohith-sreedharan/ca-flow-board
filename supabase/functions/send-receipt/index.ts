import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[SEND-RECEIPT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const { paymentId, receiptData } = await req.json();
    logStep("Request data", { paymentId });

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        clients (
          id, name, email, phone
        ),
        quotations (
          quotation_number
        )
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      throw new Error(`Error fetching payment: ${paymentError.message}`);
    }

    logStep("Payment fetched", { id: payment.id, amount: payment.amount });

    // Generate receipt content
    const receiptContent = `🧾 Payment Receipt\n\n` +
      `Receipt for: ${payment.clients?.name || 'Customer'}\n` +
      `Payment ID: ${payment.payment_id}\n` +
      `Amount: ₹${payment.amount}\n` +
      `Payment Method: ${payment.payment_method || 'Online'}\n` +
      `Date: ${new Date(payment.paid_at || payment.created_at).toLocaleDateString()}\n\n` +
      `Thank you for your payment!`;

    // Create receipt URL (placeholder for actual receipt generation)
    const receiptUrl = receiptData?.receipt_url || `${req.headers.get("origin")}/receipt/${payment.id}`;

    // Update payment with receipt information
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        receipt_sent: true,
        receipt_sent_at: new Date().toISOString(),
        receipt_url: receiptUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (updateError) {
      logStep("Error updating payment", updateError);
    }

    // Log communication
    const communicationData = {
      communication_type: 'receipt',
      client_id: payment.client_id,
      message: receiptContent,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        payment_id: payment.id,
        receipt_url: receiptUrl,
        amount: payment.amount
      }
    };

    const { error: commError } = await supabaseClient
      .from('client_communications')
      .insert(communicationData);

    if (commError) {
      logStep("Error logging communication", commError);
    }

    // Generate WhatsApp link if phone available
    let whatsappUrl = null;
    if (payment.clients?.phone) {
      const cleanPhone = payment.clients.phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(receiptContent)}`;
    }

    logStep("Receipt processed successfully", { receiptUrl, whatsappUrl });

    return new Response(JSON.stringify({ 
      success: true, 
      receipt_url: receiptUrl,
      whatsapp_url: whatsappUrl,
      message: 'Receipt sent successfully'
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