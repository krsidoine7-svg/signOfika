import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer un client Supabase avec la clé de service
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { to, subject, template, data } = await req.json()

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Destinataire et sujet sont obligatoires' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Envoyer l'email via l'API d'authentification de Supabase
    const { data: emailData, error } = await supabaseClient.auth.admin.generateLink({
      type: 'signup',
      email: to,
      options: {
        emailRedirectTo: data?.redirect_to,
        data: {
          custom_subject: subject,
          template: template || 'default',
          ...data,
        },
      },
    })

    if (error) {
      console.error('Erreur Supabase Auth:', error)
      throw error
    }

    // Si vous utilisez Supabase Edge Functions avec un fournisseur d'email externe
    // (comme SendGrid, Mailgun, etc.), vous pouvez l'appeler ici
    // Par exemple, avec SendGrid :
    /*
    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          dynamic_template_data: data
        }],
        from: { 
          email: Deno.env.get('EMAIL_FROM') || 'noreply@votredomaine.com',
          name: data.app_name || 'SignOfika'
        },
        template_id: template
      })
    })
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email envoyé avec succès',
        data: emailData 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors de l\'envoi de l\'email' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
