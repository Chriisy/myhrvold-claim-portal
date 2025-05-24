
import React, { useState, useEffect } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ParsedInvoiceLine, MappedInvoiceLine } from '@/types/invoice';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LineMappingStepProps {
  lines: ParsedInvoiceLine[];
  onMappingComplete: (mappedLines: MappedInvoiceLine[]) => void;
  onNext: () => void;
}

export const LineMappingStep: React.FC<LineMappingStepProps> = ({
  lines,
  onMappingComplete,
  onNext,
}) => {
  const [mappedLines, setMappedLines] = useState<MappedInvoiceLine[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch claims for the dropdown
  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('id, description, customer_name, created_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Initialize mapped lines
  useEffect(() => {
    if (lines.length > 0 && mappedLines.length === 0) {
      setMappedLines(
        lines.map(line => ({
          ...line,
          type: 'cost' as const,
        }))
      );
    }
  }, [lines, mappedLines.length]);

  const updateMappedLine = (index: number, updates: Partial<MappedInvoiceLine>) => {
    setMappedLines(prev => 
      prev.map((line, i) => i === index ? { ...line, ...updates } : line)
    );
  };

  const validateMapping = () => {
    const errors: string[] = [];
    
    mappedLines.forEach((line, index) => {
      if (!line.claim_id) {
        errors.push(`Linje ${index + 1}: Reklamasjon må velges`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateMapping()) {
      onMappingComplete(mappedLines as MappedInvoiceLine[]);
      onNext();
    }
  };

  if (claimsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Laster reklamasjoner...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Kople fakturalinjer</h2>
        <p className="text-gray-600">
          Velg hvilken reklamasjon hver linje skal knyttes til og om det er en kostnad eller kreditnota.
        </p>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {mappedLines.map((line, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Linje {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Beskrivelse:</span> {line.description}
                </div>
                <div>
                  <span className="font-medium">Beløp:</span> {line.amount} kr
                </div>
                {line.voucher && (
                  <div>
                    <span className="font-medium">Bilag:</span> {line.voucher}
                  </div>
                )}
                {line.konto && (
                  <div>
                    <span className="font-medium">Konto:</span> {line.konto}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Reklamasjon</Label>
                  <Select
                    value={line.claim_id || ''}
                    onValueChange={(value) => updateMappedLine(index, { claim_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg reklamasjon" />
                    </SelectTrigger>
                    <SelectContent>
                      {claims?.map((claim) => (
                        <SelectItem key={claim.id} value={claim.id}>
                          {claim.description || claim.customer_name || claim.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <RadioGroup
                    value={line.type}
                    onValueChange={(value: 'cost' | 'credit') => updateMappedLine(index, { type: value })}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cost" id={`cost-${index}`} />
                      <Label htmlFor={`cost-${index}`}>Kostnad</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit" id={`credit-${index}`} />
                      <Label htmlFor={`credit-${index}`}>Kreditnota</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Tilleggsnotat (valgfritt)</Label>
                  <Input
                    value={line.note || ''}
                    onChange={(e) => updateMappedLine(index, { note: e.target.value })}
                    placeholder="Ekstra beskrivelse..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={validationErrors.length > 0}>
          Neste: Bekreft import
        </Button>
      </div>
    </div>
  );
};
