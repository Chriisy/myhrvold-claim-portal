
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();

    const systemPrompt = `Du er Myhrvold Mentor, en intelligent assistent for Myhrvold reklamasjonssystem. Du hjelper brukere med:

1. Navigering og bruk av systemet
2. Registrering av nye reklamasjoner
3. Forståelse av data og rapporter
4. Beste praksis for reklamasjonshåndtering

Systemkontekst:
- Dette er et norsk reklamasjonssystem for maskinservice
- Brukere kan registrere reklamasjoner, spore kostnader, og generere rapporter
- Hovedkategorier: Service, Installasjon, Produkt, Del
- Viktige statustyper: Ny, Under behandling, Avsluttet

${context ? `Gjeldende systemdata: ${JSON.stringify(context)}` : ''}

Svar alltid på norsk og vær hjelpsom og profesjonell. Gi konkrete, praktiske råd. Du er Myhrvold Mentor - en vennlig og kompetent veileder.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'AI request failed');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in Myhrvold Mentor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
