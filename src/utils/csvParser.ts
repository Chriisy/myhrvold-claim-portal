import Papa from 'papaparse';
import { ParsedInvoiceLine } from '@/types/invoice';

export const parseCSVFile = (file: File): Promise<ParsedInvoiceLine[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const lines: ParsedInvoiceLine[] = results.data.map((row: any) => ({
            description: row.description || row.beskrivelse || '',
            amount: parseFloat(row.amount || row.beløp || row.belop || '0') || 0,
            konto: parseInt(row.konto || row.account || '0') || 0,
            voucher: row.voucher || row.bilag || '',
          }));
          resolve(lines);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
