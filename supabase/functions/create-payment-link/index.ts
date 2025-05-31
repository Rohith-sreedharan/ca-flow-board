
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT-LINK] ${step}${detailsStr}`);
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

    const { quotationId, gatewayType } = await req.json();
    logStep("Request received", { quotationId, gatewayType });

    // Get quotation details
    const { data: quotation, error: quotationError } = await supabaseClient
      .from('quotations')
      .select(`
        *,
        clients(name, email, phone),
        payment_configurations(*)
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError) throw quotationError;
    logStep("Quotation retrieved", { quotationNumber: quotation.quotation_number });

    let paymentLink = '';
    let paymentLinkId = '';

    if (gatewayType.startsWith('razorpay')) {
      // Determine which Razorpay config to use
      const configKey = quotation.payment_type === 'payable_task_1' ? '1' : '2';
      const keyId = Deno.env.get(`RAZORPAY_KEY_${configKey}`);
      const keySecret = Deno.env.get(`RAZORPAY_SECRET_${configKey}`);

      if (!keyId || !keySecret) {
        throw new Error(`Razorpay configuration ${configKey} not found`);
      }

      // Create Razorpay payment link
      const razorpayData = {
        amount: Math.round(quotation.total_amount * 100), // Convert to paise
        currency: 'INR',
        accept_partial: false,
        description: `Payment for quotation ${quotation.quotation_number}`,
        customer: {
          name: quotation.clients?.name || 'Customer',
          email: quotation.clients?.email || '',
          contact: quotation.clients?.phone || '',
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        callback_url: `${req.headers.get("origin")}/payment-success`,
        callback_method: 'get',
      };

      const razorpayResponse = await fetch('https://api.razorpay.com/v1/payment_links', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(razorpayData),
      });

      const razorpayResult = await razorpayResponse.json();
      logStep("Razorpay response", razorpayResult);

      if (razorpayResult.error) {
        throw new Error(`Razorpay error: ${razorpayResult.error.description}`);
      }

      paymentLink = razorpayResult.short_url;
      paymentLinkId = razorpayResult.id;

    } else if (gatewayType.startsWith('stripe')) {
      // Determine which Stripe config to use
      const configKey = quotation.payment_type === 'payable_task_1' ? '1' : '2';
      const stripeKey = Deno.env.get(`STRIPE_SECRET_KEY_${configKey}`);

      if (!stripeKey) {
        throw new Error(`Stripe configuration ${configKey} not found`);
      }

      // Create Stripe payment link
      const stripeData = {
        line_items: [{
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Quotation ${quotation.quotation_number}`,
            },
            unit_amount: Math.round(quotation.total_amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
        customer_email: quotation.clients?.email,
      };

      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(stripeData as any).toString(),
      });

      const stripeResult = await stripeResponse.json();
      logStep("Stripe response", stripeResult);

      if (stripeResult.error) {
        throw new Error(`Stripe error: ${stripeResult.error.message}`);
      }

      paymentLink = stripeResult.url;
      paymentLinkId = stripeResult.id;
    }

    // Update quotation with payment link
    const { error: updateError } = await supabaseClient
      .from('quotations')
      .update({
        payment_link_url: paymentLink,
        payment_link_id: paymentLinkId,
        status: 'sent',
      })
      .eq('id', quotationId);

    if (updateError) throw updateError;

    logStep("Payment link created successfully", { paymentLink });

    return new Response(JSON.stringify({ 
      success: true, 
      payment_link: paymentLink,
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
