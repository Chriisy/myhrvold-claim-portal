
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { newSupplierSchema, type NewSupplierData } from '@/lib/validations/claim';
import { useCreateSupplier } from '@/hooks/useSuppliers';

interface NewSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierCreated: (supplierId: string) => void;
}

export function NewSupplierModal({
  open,
  onOpenChange,
  onSupplierCreated,
}: NewSupplierModalProps) {
  const createSupplier = useCreateSupplier();

  const form = useForm<NewSupplierData>({
    resolver: zodResolver(newSupplierSchema),
    defaultValues: {
      name: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
    },
  });

  const handleSubmit = async (data: NewSupplierData) => {
    try {
      const supplier = await createSupplier.mutateAsync(data);
      onSupplierCreated(supplier.id);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ny leverandør</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    <Input placeholder="Telefonnummer" {...field} />
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={createSupplier.isPending}
                className="bg-myhrvold-primary hover:bg-myhrvold-primary/90"
              >
                {createSupplier.isPending ? 'Oppretter...' : 'Opprett leverandør'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
