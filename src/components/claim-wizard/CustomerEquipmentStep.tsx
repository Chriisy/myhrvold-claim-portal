
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClaimFormData } from '@/lib/validations/claim';
import { departmentOptions } from '@/lib/constants/departments';

export function CustomerEquipmentStep() {
  const form = useFormContext<ClaimFormData>();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-myhrvold-primary mb-4">
          Kunde og utstyr informasjon
        </h3>
        <p className="text-gray-600 mb-6">
          Fyll inn informasjon om kunden og det aktuelle utstyret.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kundenavn *</FormLabel>
              <FormControl>
                <Input placeholder="Navn på kunde" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kundenummer</FormLabel>
              <FormControl>
                <Input placeholder="Kundens nummer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Customer Address Section */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Kundens adresse</h4>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="customer_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gateadresse</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Gatenavn og husnummer"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="customer_postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postnummer</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0000"
                      maxLength={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customer_city"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Poststed</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Poststed"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avdeling</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg avdeling" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departmentOptions.map((option) => (
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Antall</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Antall enheter"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="machine_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maskinmodell</FormLabel>
              <FormControl>
                <Input placeholder="Modell av maskinen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="machine_serial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serienummer</FormLabel>
              <FormControl>
                <Input placeholder="Maskinens serienummer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="part_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delenummer</FormLabel>
              <FormControl>
                <Input placeholder="Delenummer for aktuell del" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="warranty"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Under garanti
              </FormLabel>
              <p className="text-sm text-gray-600">
                Kryss av dersom utstyret fortsatt er under garanti
              </p>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
