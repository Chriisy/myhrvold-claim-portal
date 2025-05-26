
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
    console.log('Starting invoice analysis...');
    console.log('OpenAI API Key available:', !!openAIApiKey);
    
    const { image, filename } = await req.json();

    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API-nøkkel er ikke konfigurert. Vennligst legg til OPENAI_API_KEY i Supabase secrets.');
    }

    if (!image) {
      throw new Error('Ingen bilde data mottatt');
    }

    console.log('Making request to OpenAI API...');

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
            content: `Du er ekspert på å analysere T.Myhrvold fakturaer for reklamasjonssystemer. 
            
            Analyser bildet nøye og trekk ut følgende informasjon:
            
            FAKTISKE KUNDE (svært viktig):
            - Finn den faktiske kunden jobben er gjort hos (ikke bare "T. Myhrvold AS")
            - Se etter leveringsadresse, prosjektadresse, eller annen kunde-referanse
            - Selv om fakturaen er intern til T.Myhrvold, finn hvem sluttbrukeren/kunden er
            
            TEKNISK INFORMASJON:
            - Prosjektnummer (hvis oppgitt)
            - Detaljert jobbeskrivelse (hva som faktisk ble gjort)
            - Konkrete deler/produkter som ble brukt (ikke bare koder som T1, S1)
            - Serienummer på utstyr/maskin
            - Produkt-/modellnavn
            - Leverandør av delene
            - Maskinmodell og serienummer hvis oppgitt
            
            FAKTURALINJER:
            - Beskrivelse av hver linje
            - Beløp
            - Bilagsnummer/voucher
            
            OBS: Ikke prøv å gjette kontokoder eller garantistatus - det setter brukeren selv.
            
            Returner resultatet som JSON med denne strukturen:
            {
              "lines": [{"description": "...", "amount": 123.45, "voucher": "..."}],
              "claimData": {
                "customer_name": "faktisk kunde (ikke T.Myhrvold)",
                "customer_address": "kundens adresse",
                "description": "detaljert jobbeskrivelse",
                "machine_model": "maskinmodell",
                "machine_serial": "serienummer",
                "part_number": "konkret delnummer",
                "project_number": "prosjektnummer",
                "supplier_info": "leverandør av deler",
                "work_description": "hva som ble gjort"
              }
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyser denne T.Myhrvold fakturaen og trekk ut relevant informasjon for reklamasjonssystemet. 
                Focus spesielt på å finne den faktiske kunden (ikke bare T.Myhrvold), tekniske detaljer om jobben, 
                og konkrete deler som ble brukt. Fil: ${filename}`
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
        max_tokens: 1500,
        temperature: 0.1
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API feil (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    const content = data.choices[0].message.content;

    try {
      const parsedResult = JSON.parse(content);
      console.log('Successfully parsed T.Myhrvold invoice data');
      
      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      console.error('Parse error:', parseError);
      throw new Error('AI kunne ikke analysere T.Myhrvold fakturaen som forventet. Prøv med et klarere bilde.');
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
