
import { ParsedInvoiceLine } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';

export const parseImageInvoice = async (file: File): Promise<{
  lines: ParsedInvoiceLine[];
  claimData?: {
    customer_name: string;
    description: string;
    machine_model?: string;
    part_number?: string;
  };
}> => {
  try {
    // Convert image to base64
    const base64 = await convertFileToBase64(file);
    
    // Call our edge function to analyze the invoice image
    const { data, error } = await supabase.functions.invoke('analyze-invoice-image', {
      body: { 
        image: base64,
        filename: file.name 
      }
    });

    if (error) {
      throw new Error(`Bildeanalyse feilet: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error parsing image invoice:', error);
    throw new Error('Kunne ikke analysere fakturabildет. Prøv med en klarere faktura eller bruk PDF/CSV-format.');
  }
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
