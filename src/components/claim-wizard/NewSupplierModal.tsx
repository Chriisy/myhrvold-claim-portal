
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { newSupplierSchema, type NewSupplierData } from '@/lib/validations/claim';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

interface NewSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierCreated?: (supplierId: string) => void;
  supplier?: Supplier | null;
  mode?: 'create' | 'edit';
}

export function NewSupplierModal({
  open,
  onOpenChange,
  onSupplierCreated,
  supplier = null,
  mode = 'create',
}: NewSupplierModalProps) {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const form = useForm<NewSupplierData>({
    resolver: zodResolver(newSupplierSchema),
    defaultValues: {
      name: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
    },
  });

  // Reset form when supplier prop changes or modal opens/closes
  useEffect(() => {
    if (open && supplier && mode === 'edit') {
      form.reset({
        name: supplier.name,
        contact_name: supplier.contact_name || '',
        contact_phone: supplier.contact_phone || '',
        contact_email: supplier.contact_email || '',
      });
    } else if (open && mode === 'create') {
      form.reset({
        name: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
      });
    }
  }, [open, supplier, mode, form]);

  const onSubmit = async (data: NewSupplierData) => {
    try {
      if (mode === 'edit' && supplier) {
        await updateSupplier.mutateAsync({ id: supplier.id, data });
      } else {
        const newSupplier = await createSupplier.mutateAsync(data);
        onSupplierCreated?.(newSupplier.id);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const isLoading = createSupplier.isPending || updateSupplier.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Rediger leverandør' : 'Legg til ny leverandør'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Oppdater leverandørinformasjonen nedenfor.'
              : 'Opprett en ny leverandør som kan brukes i reklamasjoner.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leverandørnavn *</FormLabel>
                  <FormControl>
                    <Input placeholder="Skriv inn leverandørnavn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontaktperson</FormLabel>
                  <FormControl>
                    <Input placeholder="Navn på kontaktperson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="+47 123 45 678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="kontakt@leverandor.no"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (mode === 'edit' ? 'Oppdaterer...' : 'Oppretter...') 
                  : (mode === 'edit' ? 'Oppdater leverandør' : 'Opprett leverandør')
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
