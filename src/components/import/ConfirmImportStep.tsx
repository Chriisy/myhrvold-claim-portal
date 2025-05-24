
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MappedInvoiceLine } from '@/types/invoice';

interface ConfirmImportStepProps {
  mappedLines: MappedInvoiceLine[];
  onConfirm: () => void;
  isProcessing: boolean;
}

export const ConfirmImportStep: React.FC<ConfirmImportStepProps> = ({
  mappedLines,
  onConfirm,
  isProcessing,
}) => {
  const costLines = mappedLines.filter(line => line.type === 'cost');
  const creditNotes = mappedLines.filter(line => line.type === 'credit');

  const totalCost = costLines.reduce((sum, line) => sum + line.amount, 0);
  const totalCredit = creditNotes.reduce((sum, line) => sum + line.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Bekreft import</h2>
        <p className="text-gray-600">
          Gjennomgå importen før den fullføres. Alle linjer vil bli lagt til i de valgte reklamasjonene.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Kostnadslinjer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{costLines.length}</div>
            <div className="text-sm text-gray-600">Total: {totalCost.toFixed(2)} kr</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Kreditnotaer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditNotes.length}</div>
            <div className="text-sm text-gray-600">Total: {totalCredit.toFixed(2)} kr</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Netto beløp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalCost - totalCredit).toFixed(2)} kr</div>
            <div className="text-sm text-gray-600">Kostnad - Kreditt</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detaljer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mappedLines.map((line, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="font-medium">{line.description}</div>
                  {line.note && (
                    <div className="text-sm text-gray-600">{line.note}</div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={line.type === 'cost' ? 'destructive' : 'secondary'}>
                    {line.type === 'cost' ? 'Kostnad' : 'Kreditt'}
                  </Badge>
                  <span className="font-medium">{line.amount} kr</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={onConfirm} 
          disabled={isProcessing}
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Importerer...
            </>
          ) : (
            'Fullfør import'
          )}
        </Button>
      </div>
    </div>
  );
};
