
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ClaimFormData } from '@/lib/validations/claim';

export function DescriptionStep() {
  const form = useFormContext<ClaimFormData>();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-myhrvold-primary mb-4">
          Beskrivelse og referanser
        </h3>
        <p className="text-gray-600 mb-6">
          Beskriv problemet og legg til eventuelle referanser.
        </p>
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Beskrivelse av reklamasjon *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Beskriv problemet, hva som skjedde, og andre relevante detaljer..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="visma_order_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visma ordrenummer</FormLabel>
              <FormControl>
                <Input placeholder="Ordrenummer i Visma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_po"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kunde PO</FormLabel>
              <FormControl>
                <Input placeholder="Kundens innkjøpsordre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reported_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rapportert av</FormLabel>
              <FormControl>
                <Input placeholder="Hvem rapporterte feilen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="internal_note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intern merknad</FormLabel>
              <FormControl>
                <Input placeholder="Interne notater" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
