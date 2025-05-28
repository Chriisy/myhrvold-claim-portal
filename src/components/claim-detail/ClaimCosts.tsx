
import { useState } from 'react';
import { useClaimCosts, useAddClaimCost, useUpdateClaimCost, useDeleteClaimCost, type ClaimCost } from '@/hooks/useClaimCosts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { CostForm } from './costs/CostForm';
import { CostTable } from './costs/CostTable';

interface ClaimCostsProps {
  claimId: string;
}

const ClaimCosts = ({ claimId }: ClaimCostsProps) => {
  const { data: costs, isLoading } = useClaimCosts(claimId);
  const addCost = useAddClaimCost();
  const updateCost = useUpdateClaimCost();
  const deleteCost = useDeleteClaimCost();

  const [open, setOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<ClaimCost | null>(null);

  const resetForm = () => {
    setEditingCost(null);
  };

  const handleSubmit = async (costData: {
    claim_id: string;
    description: string;
    amount: number;
    date: string;
    voucher_no?: string | null;
    konto_nr?: number | null;
    source: 'manual';
  }) => {
    try {
      if (editingCost) {
        await updateCost.mutateAsync({ id: editingCost.id, ...costData });
      } else {
        await addCost.mutateAsync(costData);
      }
      resetForm();
      setOpen(false);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  const handleEdit = (cost: ClaimCost) => {
    setEditingCost(cost);
    setOpen(true);
  };

  const handleDelete = async (cost: ClaimCost) => {
    await deleteCost.mutateAsync({ id: cost.id, claimId });
  };

  const totalCosts = costs?.reduce((sum, cost) => sum + cost.amount, 0) || 0;

  if (isLoading) {
    return <div>Laster kostnader...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Kostnader</h3>
          <p className="text-sm text-gray-600">
            Total: kr {totalCosts.toLocaleString('nb-NO', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Legg til kostnad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCost ? 'Rediger kostnad' : 'Legg til ny kostnad'}
              </DialogTitle>
            </DialogHeader>
            <CostForm
              claimId={claimId}
              editingCost={editingCost}
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
              isLoading={addCost.isPending || updateCost.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CostTable
        costs={costs || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ClaimCosts;
