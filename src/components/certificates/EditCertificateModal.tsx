
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const certificateSchema = z.object({
  certificate_type: z.enum(['personal', 'company']),
  certificate_number: z.string().min(1, 'Sertifikatnummer er påkrevd'),
  holder_name: z.string().min(1, 'Navn på innehaver er påkrevd'),
  issue_date: z.string().min(1, 'Utstedelsesdato er påkrevd'),
  expiry_date: z.string().min(1, 'Utløpsdato er påkrevd'),
  issuing_authority: z.string().optional(),
  category: z.string().optional(),
  birth_date: z.string().optional(),
  notes: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

interface EditCertificateModalProps {
  open: boolean;
  onClose: () => void;
  certificate: any;
}

export function EditCertificateModal({ open, onClose, certificate }: EditCertificateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificate_type: 'personal',
      category: 'I',
    },
  });

  // Get certificate ID from URL if not provided
  const getCertificateId = () => {
    if (certificate?.id) return certificate.id;
    const urlParts = window.location.pathname.split('/');
    const editIndex = urlParts.indexOf('edit');
    return editIndex !== -1 && urlParts[editIndex + 1] ? urlParts[editIndex + 1] : null;
  };

  useEffect(() => {
    const loadCertificate = async () => {
      const certificateId = getCertificateId();
      if (!certificateId || !open) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('f_gas_certificates')
          .select('*')
          .eq('id', certificateId)
          .single();

        if (error) throw error;

        setCertificateData(data);
        
        // Populate form with certificate data
        form.reset({
          certificate_type: data.certificate_type,
          certificate_number: data.certificate_number,
          holder_name: data.holder_name || '',
          issue_date: data.issue_date,
          expiry_date: data.expiry_date,
          issuing_authority: data.issuing_authority || '',
          category: data.category || 'I',
          birth_date: data.birth_date || '',
          notes: data.notes || '',
        });
      } catch (error) {
        console.error('Error loading certificate:', error);
        toast({
          title: "Feil",
          description: "Kunne ikke laste sertifikat",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCertificate();
  }, [open, certificate, form, toast]);

  const onSubmit = async (data: CertificateFormData) => {
    const certificateId = getCertificateId();
    if (!certificateId || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('f_gas_certificates')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', certificateId);

      if (error) throw error;

      toast({
        title: "Sertifikat oppdatert",
        description: "F-gass sertifikatet har blitt oppdatert",
      });
      onClose();
    } catch (error: any) {
      console.error('Error updating certificate:', error);
      toast({
        title: "Feil",
        description: error.message || "Kunne ikke oppdatere sertifikat",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger F-gass sertifikat</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="text-gray-600">Laster sertifikat...</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="certificate_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type sertifikat</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personlig</SelectItem>
                        <SelectItem value="company">Bedrift</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certificate_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sertifikatnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="Skriv inn sertifikatnummer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="holder_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navn på innehaver</FormLabel>
                    <FormControl>
                      <Input placeholder="Skriv inn navn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="I">Kategori I</SelectItem>
                        <SelectItem value="II">Kategori II</SelectItem>
                        <SelectItem value="III">Kategori III</SelectItem>
                        <SelectItem value="IV">Kategori IV</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utstedelsesdato</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utløpsdato</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fødselsdato (valgfritt)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issuing_authority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utstedende myndighet (valgfritt)</FormLabel>
                    <FormControl>
                      <Input placeholder="F.eks. Direktoratet for samfunnssikkerhet og beredskap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notater (valgfritt)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Eventuelle notater..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
