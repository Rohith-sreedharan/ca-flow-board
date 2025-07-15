import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[WHATSAPP-NOTIFICATION] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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

    const { phoneNumber, message, quotationId, type = 'quotation' } = await req.json();
    logStep("Request data", { phoneNumber, type, quotationId });

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Ensure phone number starts with country code
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    // Create WhatsApp deep link
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    // Log communication in database
    const communicationData = {
      communication_type: 'whatsapp',
      recipient_phone: phoneNumber,
      message: message,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        whatsapp_url: whatsappUrl,
        quotation_id: quotationId,
        type: type
      }
    };

    if (quotationId) {
      // Get quotation to find client_id
      const { data: quotation } = await supabaseClient
        .from('quotations')
        .select('client_id')
        .eq('id', quotationId)
        .single();
      
      if (quotation) {
        communicationData.client_id = quotation.client_id;
      }
    }

    const { error: commError } = await supabaseClient
      .from('client_communications')
      .insert(communicationData);

    if (commError) {
      logStep("Error logging communication", commError);
    }

    // If quotation, update quotation status
    if (quotationId) {
      const { error: updateError } = await supabaseClient
        .from('quotations')
        .update({
          sent_via_whatsapp: true,
          whatsapp_sent_at: new Date().toISOString()
        })
        .eq('id', quotationId);

      if (updateError) {
        logStep("Error updating quotation", updateError);
      }
    }

    logStep("WhatsApp link generated successfully", { url: whatsappUrl });

    return new Response(JSON.stringify({ 
      success: true, 
      whatsapp_url: whatsappUrl,
      message: 'WhatsApp link generated successfully'
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