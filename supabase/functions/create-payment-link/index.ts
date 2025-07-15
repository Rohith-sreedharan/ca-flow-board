import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-PAYMENT-LINK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const { quotationId, paymentType = 'payable_task_1' } = await req.json();
    logStep("Request data", { quotationId, paymentType });

    // Get quotation details
    const { data: quotation, error: quotationError } = await supabaseClient
      .from('quotations')
      .select(`
        *,
        clients (
          id, name, email, phone
        )
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError) throw new Error(`Error fetching quotation: ${quotationError.message}`);
    logStep("Quotation fetched", { id: quotation.id, amount: quotation.total_amount });

    // Get payment configuration
    const { data: paymentConfig, error: configError } = await supabaseClient
      .from('payment_configurations')
      .select('*')
      .eq('gateway_type', paymentType === 'payable_task_1' ? 'razorpay' : 'stripe')
      .eq('is_active', true)
      .single();

    if (configError) throw new Error(`Error fetching payment config: ${configError.message}`);

    let paymentLinkUrl = '';
    let paymentLinkId = '';

    if (paymentConfig.gateway_type === 'razorpay') {
      // Razorpay implementation
      const razorpayKey = Deno.env.get(paymentType === 'payable_task_1' ? 'RAZORPAY_KEY_1' : 'RAZORPAY_KEY_2');
      const razorpaySecret = Deno.env.get(paymentType === 'payable_task_1' ? 'RAZORPAY_SECRET_1' : 'RAZORPAY_SECRET_2');
      
      if (!razorpayKey || !razorpaySecret) {
        throw new Error(`Razorpay credentials not configured for ${paymentType}`);
      }

      const razorpayAuth = btoa(`${razorpayKey}:${razorpaySecret}`);
      
      const paymentLinkData = {
        amount: Math.round(quotation.total_amount * 100), // Convert to paise
        currency: 'INR',
        accept_partial: false,
        description: `Payment for ${quotation.quotation_number}`,
        customer: {
          name: quotation.clients?.name || 'Customer',
          email: quotation.clients?.email,
          contact: quotation.clients?.phone,
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        callback_url: `${req.headers.get("origin")}/payment-success`,
        callback_method: 'get'
      };

      const razorpayResponse = await fetch('https://api.razorpay.com/v1/payment_links', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${razorpayAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentLinkData),
      });

      if (!razorpayResponse.ok) {
        const errorData = await razorpayResponse.text();
        throw new Error(`Razorpay API error: ${errorData}`);
      }

      const razorpayResult = await razorpayResponse.json();
      paymentLinkUrl = razorpayResult.short_url;
      paymentLinkId = razorpayResult.id;

    } else if (paymentConfig.gateway_type === 'stripe') {
      // Stripe implementation
      const stripeKey = Deno.env.get(paymentType === 'payable_task_1' ? 'STRIPE_SECRET_KEY_1' : 'STRIPE_SECRET_KEY_2');
      
      if (!stripeKey) {
        throw new Error(`Stripe credentials not configured for ${paymentType}`);
      }

      const stripeData = {
        line_items: [{
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Payment for ${quotation.quotation_number}`,
            },
            unit_amount: Math.round(quotation.total_amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/payment-canceled`,
        customer_email: quotation.clients?.email,
      };

      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(Object.entries(stripeData).map(([key, value]) => 
          [key, typeof value === 'object' ? JSON.stringify(value) : String(value)]
        )).toString(),
      });

      if (!stripeResponse.ok) {
        const errorData = await stripeResponse.text();
        throw new Error(`Stripe API error: ${errorData}`);
      }

      const stripeResult = await stripeResponse.json();
      paymentLinkUrl = stripeResult.url;
      paymentLinkId = stripeResult.id;
    }

    // Update quotation with payment link details
    const { error: updateError } = await supabaseClient
      .from('quotations')
      .update({
        payment_link_url: paymentLinkUrl,
        payment_link_id: paymentLinkId,
        payment_type: paymentType,
        updated_at: new Date().toISOString()
      })
      .eq('id', quotationId);

    if (updateError) {
      logStep("Error updating quotation", updateError);
    }

    logStep("Payment link created successfully", { url: paymentLinkUrl });

    return new Response(JSON.stringify({ 
      success: true, 
      payment_link_url: paymentLinkUrl,
      payment_link_id: paymentLinkId 
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