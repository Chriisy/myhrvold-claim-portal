
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClaimFormData } from '@/lib/validations/claim';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useTechnicians, useAllUsers } from '@/hooks/useTechnicians';
import { useSelgere } from '@/hooks/useSelgere';
import { NewSupplierModal } from './NewSupplierModal';

const categoryOptions = [
  { value: 'Service', label: 'Service' },
  { value: 'Installasjon', label: 'Installasjon' },
  { value: 'Produkt', label: 'Produkt' },
  { value: 'Del', label: 'Del' },
];

export function CategorySupplierStep() {
  const form = useFormContext<ClaimFormData>();
  const { data: suppliers = [] } = useSuppliers();
  const { data: technicians = [] } = useTechnicians();
  const { data: selgere = [] } = useSelgere();
  const { data: allUsers = [] } = useAllUsers();
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);

  // Debug logging
  console.log('CategorySupplierStep - All users:', allUsers);
  console.log('CategorySupplierStep - Technicians:', technicians);
  console.log('CategorySupplierStep - Selgere:', selgere);

  const handleSupplierCreated = (supplierId: string) => {
    form.setValue('supplier_id', supplierId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-myhrvold-primary mb-4">
          Kategori og leverandør
        </h3>
        <p className="text-gray-600 mb-6">
          Velg kategori, leverandør og ansvarlige personer for reklamasjonen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplier_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leverandør</FormLabel>
              <div className="flex gap-2">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Velg leverandør" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Ingen valgt</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsNewSupplierModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="technician_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tekniker ({technicians.length} available)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg tekniker" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Ingen valgt</SelectItem>
                  {technicians.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} {user.seller_no ? `(${user.seller_no})` : ''} - {user.user_role || user.role}
                    </SelectItem>
                  ))}
                  {technicians.length === 0 && (
                    <SelectItem value="no-technicians" disabled>
                      Ingen teknikere funnet
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salesperson_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selger ({selgere.length} available)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg selger" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Ingen valgt</SelectItem>
                  {selgere.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} {user.seller_no ? `(${user.seller_no})` : ''} - {user.user_role || user.role}
                    </SelectItem>
                  ))}
                  {selgere.length === 0 && (
                    <SelectItem value="no-salesperson" disabled>
                      Ingen selgere funnet
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <NewSupplierModal
        open={isNewSupplierModalOpen}
        onOpenChange={setIsNewSupplierModalOpen}
        onSupplierCreated={handleSupplierCreated}
      />
    </div>
  );
}
