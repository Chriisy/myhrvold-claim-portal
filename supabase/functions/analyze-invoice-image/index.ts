
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
    const { image, filename } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key ikke konfigurert');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Du er en ekspert på å analysere fakturaer og trekke ut informasjon for reklamasjonssystemer. 
            Analyser bildet og trekk ut følgende informasjon:
            1. Fakturalinjер med beskrivelse, beløp, og eventuelle kontokoder
            2. Kundeinformasjon (navn, adresse)
            3. Produktinformasjon (modell, serienummer, delnummer)
            4. Feilbeskrivelse eller årsak til reklamasjon
            
            Returner resultatet som JSON med denne strukturen:
            {
              "lines": [{"description": "...", "amount": 123.45, "konto": 1234, "voucher": "..."}],
              "claimData": {
                "customer_name": "...",
                "description": "...",
                "machine_model": "...",
                "part_number": "..."
              }
            }
            
            Hvis du ikke kan finne noe informasjon, returner tomme arrays/objekter.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyser denne fakturaen og trekk ut relevant informasjon for et reklamasjonssystem. Fil: ${filename}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const parsedResult = JSON.parse(content);
      console.log('Parsed invoice data:', parsedResult);
      
      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('AI kunne ikke analysere fakturaen som forventet');
    }

  } catch (error) {
    console.error('Error in analyze-invoice-image:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      lines: [],
      claimData: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
