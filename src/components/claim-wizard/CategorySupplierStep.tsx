
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClaimFormData } from '@/lib/validations/claim';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useTechnicians } from '@/hooks/useTechnicians';
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
                <NewSupplierModal />
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
              <FormLabel>Tekniker</FormLabel>
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
                      {user.name}
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
          name="salesperson_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selger</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg selger" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Ingen valgt</SelectItem>
                  {technicians.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
