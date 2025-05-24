
import { useState } from 'react';
import { useClaimCosts, useAddCostLine } from '@/hooks/useClaimCosts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ClaimCostsProps {
  claimId: string;
}

export function ClaimCosts({ claimId }: ClaimCostsProps) {
  const { data: costs, isLoading, error } = useClaimCosts(claimId);
  const addCost = useAddCostLine();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    konto_nr: ''
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addCost.mutateAsync({
      claim_id: claimId,
      description: formData.description,
      amount: parseFloat(formData.amount),
      konto_nr: formData.konto_nr ? parseInt(formData.konto_nr) : undefined
    });

    setFormData({ description: '', amount: '', konto_nr: '' });
    setOpen(false);
  };

  const handleDelete = async (costId: string) => {
    try {
      const { error } = await supabase
        .from('cost_line')
        .delete()
        .eq('id', costId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['costs', claimId] });
      toast({
        title: "Kostnad slettet",
        description: "Kostnaden har blitt slettet.",
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette kostnaden.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK'
    }).format(amount);
  };

  if (isLoading) return <div>Laster kostnader...</div>;
  if (error) return <div>Kunne ikke hente kostnader</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Kostnader</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Legg til kostnad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Legg til ny kostnad</DialogTitle>
            </DialogHeader>
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
                <Label htmlFor="konto_nr">Kontonummer</Label>
                <Input
                  id="konto_nr"
                  type="number"
                  value={formData.konto_nr}
                  onChange={(e) => setFormData({ ...formData, konto_nr: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={addCost.isPending}>
                  {addCost.isPending ? 'Lagrer...' : 'Legg til'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!costs || costs.length === 0 ? (
        <p className="text-gray-500">Ingen kostnader registrert.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dato</TableHead>
              <TableHead>Beskrivelse</TableHead>
              <TableHead>Beløp</TableHead>
              <TableHead>Konto</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.map((cost) => (
              <TableRow key={cost.id}>
                <TableCell>{new Date(cost.date).toLocaleDateString('nb-NO')}</TableCell>
                <TableCell>{cost.description}</TableCell>
                <TableCell>{formatCurrency(cost.amount)}</TableCell>
                <TableCell>{cost.konto_nr || '-'}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Slett kostnad</AlertDialogTitle>
                        <AlertDialogDescription>
                          Er du sikker på at du vil slette denne kostnaden? Denne handlingen kan ikke angres.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(cost.id)} className="bg-red-600 hover:bg-red-700">
                          Slett
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
