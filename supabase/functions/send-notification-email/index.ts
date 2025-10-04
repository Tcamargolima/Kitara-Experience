import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'approval' | 'rejection' | 'new_signup';
  user_email: string;
  user_name: string;
  admin_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, user_email, user_name, admin_email }: NotificationRequest = await req.json();
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || admin_email;

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    let emailData: { to: string[]; subject: string; html: string };

    switch (type) {
      case 'approval':
        emailData = {
          to: [user_email],
          subject: "🎪 Seu acesso foi aprovado - MOSKINO",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px;">🎪 MOSKINO</h1>
              </div>
              <div style="background: white; padding: 30px; border: 2px solid #e0e0e0; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">Olá, ${user_name}!</h2>
                <p style="font-size: 16px;">
                  Temos uma ótima notícia! 🎉
                </p>
                <p style="font-size: 16px;">
                  Seu cadastro no aplicativo MOSKINO foi <strong>aprovado</strong>! 
                  Você agora tem acesso completo à plataforma.
                </p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #667eea;">O que você pode fazer agora:</h3>
                  <ul style="padding-left: 20px;">
                    <li>Comprar ingressos para os espetáculos</li>
                    <li>Assinar planos exclusivos</li>
                    <li>Acessar benefícios especiais</li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${Deno.env.get('APP_URL') || 'https://moskino.lovable.app'}/auth" 
                     style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; 
                            text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Acessar o Aplicativo
                  </a>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Bem-vindo ao circo! 🎪<br>
                  Equipe MOSKINO
                </p>
              </div>
            </body>
            </html>
          `,
        };
        break;

      case 'rejection':
        emailData = {
          to: [user_email],
          subject: "Sobre seu cadastro - MOSKINO",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px;">🎪 MOSKINO</h1>
              </div>
              <div style="background: white; padding: 30px; border: 2px solid #e0e0e0; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">Olá, ${user_name}</h2>
                <p style="font-size: 16px;">
                  Agradecemos seu interesse no aplicativo MOSKINO.
                </p>
                <p style="font-size: 16px;">
                  Infelizmente, não foi possível aprovar seu cadastro neste momento.
                </p>
                <p style="font-size: 16px;">
                  Se você acredita que houve um erro ou deseja mais informações, 
                  entre em contato conosco através do email ${ADMIN_EMAIL}.
                </p>
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Atenciosamente,<br>
                  Equipe MOSKINO
                </p>
              </div>
            </body>
            </html>
          `,
        };
        break;

      case 'new_signup':
        if (!ADMIN_EMAIL) {
          throw new Error("ADMIN_EMAIL not configured");
        }
        emailData = {
          to: [ADMIN_EMAIL],
          subject: "🔔 Novo cadastro aguardando aprovação - MOSKINO",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px;">🎪 MOSKINO Admin</h1>
              </div>
              <div style="background: white; padding: 30px; border: 2px solid #e0e0e0; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">Novo Cadastro</h2>
                <p style="font-size: 16px;">
                  Um novo usuário se cadastrou e está aguardando aprovação:
                </p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Nome:</strong> ${user_name}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${user_email}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${Deno.env.get('APP_URL') || 'https://moskino.lovable.app'}/dashboard" 
                     style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; 
                            text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Revisar Cadastro
                  </a>
                </div>
              </div>
            </body>
            </html>
          `,
        };
        break;

      default:
        throw new Error("Invalid notification type");
    }

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MOSKINO <onboarding@resend.dev>",
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await resendResponse.json();

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
