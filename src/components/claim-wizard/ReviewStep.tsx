
import { useFormContext } from 'react-hook-form';
import { ClaimFormData } from '@/lib/validations/claim';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Badge } from '@/components/ui/badge';

const categoryLabels = {
  'ServiceJobb': 'Servicejobb',
  'Installasjon': 'Installasjon',
  'Montasje': 'Montasje',
  'Produkt': 'Produkt',
  'Del': 'Del',
};

export function ReviewStep() {
  const form = useFormContext<ClaimFormData>();
  const { data: suppliers } = useSuppliers();
  const formData = form.getValues();

  const selectedSupplier = suppliers?.find(s => s.id === formData.supplier_id);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-myhrvold-primary mb-4">
          Oppsummering
        </h3>
        <p className="text-gray-600 mb-6">
          Gjennomgå informasjonen før du sender inn reklamasjonen.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Kunde og utstyr</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Kundenavn:</span>
              <p className="font-medium">{formData.customer_name || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Kundenummer:</span>
              <p className="font-medium">{formData.customer_no || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Avdeling:</span>
              <p className="font-medium">{formData.department || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Maskinmodell:</span>
              <p className="font-medium">{formData.machine_model || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Serienummer:</span>
              <p className="font-medium">{formData.machine_serial || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Antall:</span>
              <p className="font-medium">{formData.quantity || '-'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Garanti:</span>
              <div className="mt-1">
                {formData.warranty ? (
                  <Badge variant="secondary">Ja</Badge>
                ) : (
                  <Badge variant="outline">Nei</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Kategori og leverandør</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Kategori:</span>
              <p className="font-medium">
                {formData.category ? categoryLabels[formData.category] : '-'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Leverandør:</span>
              <p className="font-medium">{selectedSupplier?.name || '-'}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Beskrivelse og referanser</h4>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-gray-600">Beskrivelse:</span>
              <p className="font-medium mt-1">{formData.description || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Visma ordrenummer:</span>
                <p className="font-medium">{formData.visma_order_no || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Kunde PO:</span>
                <p className="font-medium">{formData.customer_po || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Rapportert av:</span>
                <p className="font-medium">{formData.reported_by || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Intern merknad:</span>
                <p className="font-medium">{formData.internal_note || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
