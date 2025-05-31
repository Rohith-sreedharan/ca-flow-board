
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-RECEIPT] ${step}${detailsStr}`);
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

    const { paymentId, sendVia } = await req.json();
    logStep("Request received", { paymentId, sendVia });

    // Get payment details with related data
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        clients(name, email, phone),
        quotations(quotation_number, amount, tax_amount, total_amount)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) throw paymentError;
    logStep("Payment retrieved", { paymentId: payment.payment_id });

    // Generate receipt content
    const receiptContent = `
🧾 PAYMENT RECEIPT
==================
Receipt #: ${payment.payment_id}
Quotation: ${payment.quotations?.quotation_number}
Client: ${payment.clients?.name}

Amount: ₹${payment.amount}
Status: ${payment.status}
Date: ${new Date(payment.paid_at || payment.created_at).toLocaleDateString()}

Thank you for your payment!
    `.trim();

    if (sendVia === 'whatsapp' && payment.clients?.phone) {
      // Send via WhatsApp using deep link
      const phoneNumber = payment.clients.phone.replace(/[^\d]/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(receiptContent)}`;
      
      logStep("WhatsApp receipt prepared", { phoneNumber, url: whatsappUrl });

      // Update payment as receipt sent
      await supabaseClient
        .from('payments')
        .update({ 
          receipt_sent: true, 
          receipt_sent_at: new Date().toISOString() 
        })
        .eq('id', paymentId);

      return new Response(JSON.stringify({ 
        success: true, 
        whatsapp_url: whatsappUrl,
        message: 'Receipt prepared for WhatsApp sending' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (sendVia === 'email' && payment.clients?.email) {
      // For email sending, you would integrate with an email service
      // For now, we'll just mark as sent
      logStep("Email receipt prepared", { email: payment.clients.email });

      await supabaseClient
        .from('payments')
        .update({ 
          receipt_sent: true, 
          receipt_sent_at: new Date().toISOString() 
        })
        .eq('id', paymentId);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email receipt functionality to be implemented' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      throw new Error('Invalid sending method or missing contact information');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
