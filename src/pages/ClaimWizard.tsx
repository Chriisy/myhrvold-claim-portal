
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
import { useOptimizedCreateClaim } from '@/hooks/optimized/useOptimizedMutations';
import { CustomerEquipmentStep } from '@/components/claim-wizard/CustomerEquipmentStep';
import { CategorySupplierStep } from '@/components/claim-wizard/CategorySupplierStep';
import { DescriptionStep } from '@/components/claim-wizard/DescriptionStep';
import { FileUploadStep } from '@/components/claim-wizard/FileUploadStep';
import { ReviewStep } from '@/components/claim-wizard/ReviewStep';

interface FileWithPreview extends File {
  preview?: string;
}

const steps = [
  { id: 1, title: 'Kunde og utstyr', component: CustomerEquipmentStep },
  { id: 2, title: 'Kategori og leverandør', component: CategorySupplierStep },
  { id: 3, title: 'Beskrivelse', component: DescriptionStep },
  { id: 4, title: 'Vedlegg', component: FileUploadStep },
  { id: 5, title: 'Oppsummering', component: ReviewStep },
] as const;

const ClaimWizard = React.memo(() => {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const createClaim = useOptimizedCreateClaim();

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

  // Memoized validation and navigation
  const { validateCurrentStep, handleNext, handlePrevious } = useMemo(() => {
    const getFieldsForStep = (step: number): (keyof ClaimFormData)[] => {
      switch (step) {
        case 1: return ['customer_name'];
        case 2: return [];
        case 3: return ['description'];
        case 4:
        case 5: return [];
        default: return [];
      }
    };

    const validateCurrentStep = async () => {
      const fieldsToValidate = getFieldsForStep(currentStep);
      return await form.trigger(fieldsToValidate);
    };

    const handleNext = async () => {
      const isValid = await validateCurrentStep();
      if (isValid && currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
      }
    };

    const handlePrevious = () => {
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
      }
    };

    return { validateCurrentStep, handleNext, handlePrevious };
  }, [currentStep, form]);

  const handleSubmit = useCallback(async (data: ClaimFormData) => {
    await createClaim.mutateAsync({
      ...data,
      files
    });
  }, [createClaim, files]);

  const handleFilesChange = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(newFiles);
  }, []);

  // Memoized current step data
  const { currentStepData, progress } = useMemo(() => {
    const currentStepData = steps.find(step => step.id === currentStep);
    const progress = (currentStep / steps.length) * 100;
    return { currentStepData, progress };
  }, [currentStep]);

  const CurrentStepComponent = currentStepData?.component;

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
});

ClaimWizard.displayName = 'ClaimWizard';

export default ClaimWizard;
