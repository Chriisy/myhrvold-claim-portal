
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
    console.log('Starting AI assistant request...');
    console.log('OpenAI API Key available:', !!openAIApiKey);

    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      return new Response(JSON.stringify({ 
        error: 'AI-tjenesten er ikke konfigurert riktig. Kontakt administrator.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages, context } = await req.json();
    console.log('Request payload received, messages count:', messages?.length || 0);

    const systemPrompt = `Du er Myhrvold Mentor, en intelligent assistent for Myhrvold reklamasjonssystem. Du hjelper brukere med:

1. Navigering og bruk av systemet
2. Registrering av nye reklamasjoner
3. Forståelse av data og rapporter
4. Beste praksis for reklamasjonshåndtering
5. Analyse av trends og mønstre

Systemkontekst:
- Dette er et norsk reklamasjonssystem for maskinservice
- Brukere kan registrere reklamasjoner, spore kostnader, og generere rapporter
- Hovedkategorier: Service, Installasjon, Produkt, Del
- Viktige statustyper: Ny, Under behandling, Avsluttet

Du har tilgang til live data og kan hjelpe med:
- Smart kategorisering av reklamasjoner
- Leverandør-anbefalinger
- Kostnadsestimater
- Trend-analyse
- Rapportgenerering

${context ? `Gjeldende systemdata: ${JSON.stringify(context)}` : ''}

Svar alltid på norsk og vær hjelpsom og profesjonell. Gi konkrete, praktiske råd. Du er Myhrvold Mentor - en vennlig og kompetent veileder som kjenner systemet inne og ut.`;

    console.log('Making request to OpenAI with model gpt-4o');

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

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      
      let userMessage = 'En uventet feil oppstod. Prøv igjen om litt.';
      
      if (errorData.error?.code === 'insufficient_quota') {
        userMessage = 'OpenAI API har nådd sin kvotegrense. Kontakt administrator for å oppgradere planen.';
      } else if (errorData.error?.code === 'rate_limit_exceeded') {
        userMessage = 'For mange forespørsler til AI-tjenesten. Vent litt og prøv igjen.';
      } else if (errorData.error?.code === 'invalid_api_key') {
        userMessage = 'Problem med AI-tjenestens konfigurasjon. Kontakt administrator.';
      }
      
      return new Response(JSON.stringify({ error: userMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response structure:', data);
      return new Response(JSON.stringify({ 
        error: 'Uventet svar fra AI-tjenesten. Prøv igjen.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = data.choices[0].message.content;
    console.log('Successfully generated AI response');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in Myhrvold Mentor:', error);
    
    let errorMessage = 'En uventet feil oppstod. Prøv igjen om litt.';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Problem med AI-tjenesten. Kontakt administrator.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Nettverksfeil. Sjekk internettforbindelsen og prøv igjen.';
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
