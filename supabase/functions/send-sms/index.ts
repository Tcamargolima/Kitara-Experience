import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    
    if (!phone) {
      throw new Error('Telefone é obrigatório');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store code in database
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    const { error: insertError } = await supabaseAdmin
      .from('sms_codes')
      .insert({
        phone,
        code,
        expires_at: expiresAt.toISOString(),
        verified: false
      });

    if (insertError) {
      throw insertError;
    }

    // In a real app, you would send SMS here using Twilio, AWS SNS, etc.
    // For demo purposes, we'll just log the code
    console.log(`SMS Code for ${phone}: ${code}`);
    
    // For testing purposes, return the code in development
    const isDev = Deno.env.get('DENO_ENV') === 'development';
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Código SMS enviado com sucesso',
        // Only include code in development
        ...(isDev && { code })
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});