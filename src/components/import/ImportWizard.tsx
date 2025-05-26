import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Plus, Building, MapPin, Wrench } from 'lucide-react';
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
            title: '🤖 T.Myhrvold faktura analysert',
            description: `Kunde: ${claimData.customer_name} | Jobb: ${claimData.work_description || claimData.description}`,
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
        customer_address: detectedClaimData.customer_address,
        description: detectedClaimData.work_description || detectedClaimData.description,
        machine_model: detectedClaimData.machine_model,
        machine_serial: detectedClaimData.machine_serial,
        part_number: detectedClaimData.part_number,
        visma_order_no: detectedClaimData.project_number,
        internal_note: `Automatisk opprettet fra T.Myhrvold faktura. Leverandør: ${detectedClaimData.supplier_info || 'Ikke oppgitt'}`,
        warranty: false,
        category: 'Service',
        source: 'ai_import'
      });
      
      toast({
        title: '✅ Reklamasjon opprettet fra T.Myhrvold faktura',
        description: 'Reklamasjon opprettet basert på fakturaanalysen. Husk å sette kontokode og garantistatus manuelt.',
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
          <CardTitle>Import av T.Myhrvold faktura</CardTitle>
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

      {/* Enhanced AI-detected claim data notification for T.Myhrvold */}
      {detectedClaimData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    🤖 T.Myhrvold faktura analysert
                  </h4>
                  <p className="text-sm text-blue-700 mt-2">
                    AI har tolket fakturaen og funnet relevant informasjon for reklamasjonssystem
                  </p>
                </div>
                <Button onClick={handleCreateNewClaim} disabled={createClaim.isPending}>
                  <Plus className="w-4 h-4 mr-2" />
                  {createClaim.isPending ? 'Oppretter...' : 'Opprett reklamasjon'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Building className="w-4 h-4" />
                    Kunde
                  </div>
                  <p className="text-sm">{detectedClaimData.customer_name}</p>
                  {detectedClaimData.customer_address && (
                    <p className="text-xs text-gray-600 mt-1">{detectedClaimData.customer_address}</p>
                  )}
                </div>
                
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Wrench className="w-4 h-4" />
                    Jobb
                  </div>
                  <p className="text-sm">{detectedClaimData.work_description || detectedClaimData.description}</p>
                  {detectedClaimData.project_number && (
                    <p className="text-xs text-gray-600 mt-1">Prosjekt: {detectedClaimData.project_number}</p>
                  )}
                </div>
                
                <div className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4" />
                    Teknisk info
                  </div>
                  {detectedClaimData.machine_model && (
                    <p className="text-xs">Modell: {detectedClaimData.machine_model}</p>
                  )}
                  {detectedClaimData.machine_serial && (
                    <p className="text-xs">Serie: {detectedClaimData.machine_serial}</p>
                  )}
                  {detectedClaimData.part_number && (
                    <p className="text-xs">Del: {detectedClaimData.part_number}</p>
                  )}
                  {detectedClaimData.supplier_info && (
                    <p className="text-xs">Leverandør: {detectedClaimData.supplier_info}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Husk:</strong> Du må sette kontokode og garantistatus manuelt etter at reklamasjonen er opprettet.
                </p>
              </div>
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
