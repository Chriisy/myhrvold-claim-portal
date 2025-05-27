
import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { claimFormSchema, type ClaimFormData } from '@/lib/validations/claim';
import { useCreateClaim } from '@/hooks/useClaims';
import { CustomerEquipmentStep } from '@/components/claim-wizard/CustomerEquipmentStep';
import { CategorySupplierStep } from '@/components/claim-wizard/CategorySupplierStep';
import { DescriptionStep } from '@/components/claim-wizard/DescriptionStep';
import { FileUploadStep } from '@/components/claim-wizard/FileUploadStep';
import { ReviewStep } from '@/components/claim-wizard/ReviewStep';

interface FileWithPreview extends File {
  preview?: string;
}

type Step = {
  id: number;
  title: string;
  component: React.ComponentType<any>;
};

const steps: Step[] = [
  { id: 1, title: 'Kunde og utstyr', component: CustomerEquipmentStep },
  { id: 2, title: 'Kategori og leverandør', component: CategorySupplierStep },
  { id: 3, title: 'Beskrivelse', component: DescriptionStep },
  { id: 4, title: 'Vedlegg', component: FileUploadStep },
  { id: 5, title: 'Oppsummering', component: ReviewStep },
];

const ClaimWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const createClaim = useCreateClaim();

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      customer_name: '',
      customer_no: '',
      customer_address: '',
      customer_postal_code: '',
      customer_city: '',
      department: '',
      machine_model: '',
      machine_serial: '',
      warranty: false,
      quantity: undefined,
      category: undefined,
      supplier_id: undefined,
      technician_id: undefined,
      salesperson_id: undefined,
      description: '',
      visma_order_no: '',
      customer_po: '',
      reported_by: '',
      internal_note: '',
    },
  });

  // Memoize the current step data
  const currentStepData = useMemo(() => 
    steps.find(step => step.id === currentStep), 
    [currentStep]
  );
  
  const CurrentStepComponent = currentStepData?.component as React.ComponentType<any>;

  // Memoize field validation function
  const getFieldsForStep = useCallback((step: number): (keyof ClaimFormData)[] => {
    switch (step) {
      case 1:
        return ['customer_name'];
      case 2:
        return [];
      case 3:
        return ['description'];
      case 4:
        return [];
      case 5:
        return [];
      default:
        return [];
    }
  }, []);

  // Memoize validation function
  const validateCurrentStep = useCallback(async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    return isValid;
  }, [currentStep, form, getFieldsForStep]);

  // Memoize navigation handlers
  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Memoize submit handler
  const handleSubmit = useCallback(async (data: ClaimFormData) => {
    try {
      await createClaim.mutateAsync({
        ...data,
        files: files // Include files in the submission
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  }, [createClaim, files]);

  // Memoize progress calculation
  const progress = useMemo(() => (currentStep / steps.length) * 100, [currentStep]);

  // Memoize files change handler
  const handleFilesChange = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(newFiles);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Link to="/claims">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-myhrvold-primary">Ny Reklamasjon</h1>
          <p className="text-gray-600">Opprett en ny reklamasjon</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Steg {currentStep} av {steps.length}: {currentStepData?.title}
            </CardTitle>
            <div className="text-sm text-gray-600">
              {Math.round(progress)}% fullført
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {currentStep === 4 ? (
                <FileUploadStep files={files} onFilesChange={handleFilesChange} />
              ) : currentStep === 5 ? (
                <ReviewStep />
              ) : (
                CurrentStepComponent && <CurrentStepComponent />
              )}

              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Forrige
                </Button>

                {currentStep < steps.length ? (
                  <Button type="button" onClick={handleNext}>
                    Neste
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createClaim.isPending}
                    className="bg-myhrvold-primary hover:bg-myhrvold-primary/90"
                  >
                    {createClaim.isPending ? (
                      'Oppretter...'
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Opprett reklamasjon
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimWizard;
