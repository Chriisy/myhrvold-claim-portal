import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import { FileUploadStep } from './FileUploadStep';
import { LineMappingStep } from './LineMappingStep';
import { ConfirmImportStep } from './ConfirmImportStep';
import { useUploadFile, useCreateInvoiceImport, useProcessImport } from '@/hooks/useInvoiceImport';
import { useCreateClaim } from '@/hooks/useClaims';
import { parseCSVFile } from '@/utils/csvParser';
import { parseImageInvoice } from '@/utils/imageInvoiceParser';
import { ParsedInvoiceLine, MappedInvoiceLine } from '@/types/invoice';
import { toast } from '@/hooks/use-toast';

const steps = [
  { id: 1, title: 'Last opp fil', description: 'Velg faktura-fil' },
  { id: 2, title: 'Koble linjer', description: 'Knytt til reklamasjoner' },
  { id: 3, title: 'Bekreft', description: 'Fullfør import' },
];

export const ImportWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [parsedLines, setParsedLines] = useState<ParsedInvoiceLine[]>([]);
  const [mappedLines, setMappedLines] = useState<MappedInvoiceLine[]>([]);
  const [importId, setImportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedClaimData, setDetectedClaimData] = useState<any>(null);

  const uploadFile = useUploadFile();
  const createImport = useCreateInvoiceImport();
  const processImport = useProcessImport();
  const createClaim = useCreateClaim();

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    try {
      let lines: ParsedInvoiceLine[];
      let claimData: any = null;
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        lines = await parseCSVFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        throw new Error('Excel-filer støttes ikke ennå. Bruk CSV-format.');
      } else if (file.name.endsWith('.pdf')) {
        throw new Error('PDF-filer støttes ikke ennå. Bruk CSV-format.');
      } else if (file.type.startsWith('image/')) {
        const result = await parseImageInvoice(file);
        lines = result.lines;
        claimData = result.claimData;
        
        if (claimData) {
          setDetectedClaimData(claimData);
          toast({
            title: 'AI-analyse fullført',
            description: 'Fakturaen ble analysert og reklamasjonsdata ble funnet. Du kan nå opprette en ny reklamasjon automatisk.',
          });
        }
      } else {
        throw new Error('Ukjent filformat. Støttede formater: CSV, JPG, PNG');
      }

      if (lines.length === 0) {
        throw new Error('Ingen gyldige linjer funnet i filen.');
      }

      // Upload the file
      const uploadResult = await uploadFile.mutateAsync(file);
      
      // Create import record
      const importRecord = await createImport.mutateAsync({
        file_id: uploadResult.file_id,
        filename: uploadResult.filename,
        lines,
      });

      setParsedLines(lines);
      setImportId(importRecord.id);
      setCurrentStep(2);
      
      toast({
        title: 'Fil lastet opp',
        description: `${lines.length} linjer funnet og klar for kobling.`,
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCreateNewClaim = async () => {
    if (!detectedClaimData) return;
    
    try {
      await createClaim.mutateAsync({
        customer_name: detectedClaimData.customer_name,
        description: detectedClaimData.description,
        machine_model: detectedClaimData.machine_model,
        part_number: detectedClaimData.part_number,
        warranty: false,
        category: 'Produkt',
        source: 'ai_import'
      });
      
      toast({
        title: 'Reklamasjon opprettet',
        description: 'En ny reklamasjon ble opprettet basert på fakturaanalysen.',
      });
      
      setDetectedClaimData(null);
    } catch (error: any) {
      toast({
        title: 'Feil',
        description: `Kunne ikke opprette reklamasjon: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleMappingComplete = (mapped: MappedInvoiceLine[]) => {
    setMappedLines(mapped);
  };

  const handleConfirmImport = async () => {
    if (!importId) return;
    
    try {
      await processImport.mutateAsync({
        importId,
        mappedLines,
      });
      
      // Reset wizard
      setCurrentStep(1);
      setParsedLines([]);
      setMappedLines([]);
      setImportId(null);
      setError(null);
      setDetectedClaimData(null);
      
    } catch (error: any) {
      setError(error.message);
    }
  };

  const canGoBack = currentStep > 1 && !uploadFile.isPending && !createImport.isPending && !processImport.isPending;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Progress indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Import av faktura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.id < currentStep
                        ? 'bg-green-600 text-white'
                        : step.id === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-px bg-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI-detected claim data notification */}
      {detectedClaimData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">🤖 AI fant reklamasjonsdata</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Kunde: {detectedClaimData.customer_name} | Beskrivelse: {detectedClaimData.description}
                </p>
              </div>
              <Button onClick={handleCreateNewClaim} disabled={createClaim.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {createClaim.isPending ? 'Oppretter...' : 'Opprett reklamasjon'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {canGoBack && (
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbake
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <FileUploadStep
              onFileSelect={handleFileSelect}
              isUploading={uploadFile.isPending || createImport.isPending}
              error={error || undefined}
            />
          )}

          {currentStep === 2 && (
            <LineMappingStep
              lines={parsedLines}
              onMappingComplete={handleMappingComplete}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <ConfirmImportStep
              mappedLines={mappedLines}
              onConfirm={handleConfirmImport}
              isProcessing={processImport.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
