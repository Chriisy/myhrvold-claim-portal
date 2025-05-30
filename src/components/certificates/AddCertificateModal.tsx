
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateFGasCertificate } from '@/hooks/useFGasCertificates';
import { useToast } from '@/hooks/use-toast';

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

interface AddCertificateModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddCertificateModal({ open, onClose }: AddCertificateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: createCertificate } = useCreateFGasCertificate();
  const { toast } = useToast();

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      certificate_type: 'personal',
      category: 'I',
    },
  });

  const onSubmit = async (data: CertificateFormData) => {
    setIsSubmitting(true);
    try {
      createCertificate(data, {
        onSuccess: () => {
          toast({
            title: "Sertifikat opprettet",
            description: "F-gass sertifikatet har blitt opprettet",
          });
          form.reset();
          onClose();
        },
        onError: (error: any) => {
          toast({
            title: "Feil",
            description: error.message || "Kunne ikke opprette sertifikat",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error('Error creating certificate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legg til nytt F-gass sertifikat</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="certificate_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type sertifikat</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                {isSubmitting ? 'Lagrer...' : 'Lagre sertifikat'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
