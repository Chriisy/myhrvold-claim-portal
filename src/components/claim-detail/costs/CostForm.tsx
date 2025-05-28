
import { useState } from 'react';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { type ClaimCost } from '@/hooks/useClaimCosts';

interface CostFormProps {
  claimId: string;
  editingCost?: ClaimCost | null;
  onSubmit: (data: {
    claim_id: string;
    description: string;
    amount: number;
    date: string;
    voucher_no?: string | null;
    konto_nr?: number | null;
    source: 'manual';
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function CostForm({ claimId, editingCost, onSubmit, onCancel, isLoading }: CostFormProps) {
  const { data: accountCodes } = useAccountCodes();
  const [formData, setFormData] = useState({
    description: editingCost?.description || '',
    amount: editingCost?.amount.toString() || '',
    date: editingCost?.date || new Date().toISOString().split('T')[0],
    voucher_no: editingCost?.voucher_no || '',
    konto_nr: editingCost?.konto_nr?.toString() || 'none',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const costData = {
      claim_id: claimId,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      voucher_no: formData.voucher_no || null,
      konto_nr: formData.konto_nr === 'none' ? null : parseInt(formData.konto_nr),
      source: 'manual' as const,
    };

    await onSubmit(costData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Beskrivelse</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="amount">Beløp</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="date">Dato</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="voucher_no">Bilagsnummer</Label>
        <Input
          id="voucher_no"
          value={formData.voucher_no}
          onChange={(e) => setFormData({ ...formData, voucher_no: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="konto_nr">Konto</Label>
        <Select value={formData.konto_nr} onValueChange={(value) => setFormData({ ...formData, konto_nr: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Velg konto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Ingen konto</SelectItem>
            {accountCodes?.map((account) => (
              <SelectItem key={account.konto_nr} value={account.konto_nr.toString()}>
                {account.konto_nr} - {account.comment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit" disabled={isLoading}>
          {editingCost ? 'Oppdater' : 'Legg til'}
        </Button>
      </div>
    </form>
  );
}
