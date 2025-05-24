
import Papa from 'papaparse';
import { ParsedInvoiceLine } from '@/types/invoice';
import { parsedInvoiceLineSchema } from '@/lib/validations/invoice';

export const parseCSVFile = (file: File): Promise<ParsedInvoiceLine[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedLines: ParsedInvoiceLine[] = results.data.map((row: any) => {
            // Map common CSV column names to our schema
            const line = {
              description: row.description || row.Beskrivelse || row.Description || '',
              amount: parseFloat(row.amount || row.Beløp || row.Amount || '0'),
              voucher: row.voucher || row.Bilag || row.Voucher || undefined,
              konto: row.konto ? parseInt(row.konto) : (row.Konto ? parseInt(row.Konto) : undefined),
            };

            // Validate the line
            return parsedInvoiceLineSchema.parse(line);
          });

          resolve(parsedLines);
        } catch (error) {
          reject(new Error(`CSV parsing error: ${error}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV file error: ${error.message}`));
      },
    });
  });
};
