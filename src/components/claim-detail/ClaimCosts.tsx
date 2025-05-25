
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { useClaimCosts, useAddCostLine } from '@/hooks/useClaimCosts';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { format } from 'date-fns';

interface ClaimCostsProps {
  claimId: string;
}

const ClaimCosts = ({ claimId }: ClaimCostsProps) => {
  const { data: costs, isLoading } = useClaimCosts(claimId);
  const { data: accountCodes } = useAccountCodes();
  const addCostLine = useAddCostLine();
  
  const [newCost, setNewCost] = useState({
    description: '',
    amount: '',
    konto_nr: ''
  });

  const handleAddCost = async () => {
    if (!newCost.description || !newCost.amount) return;

    try {
      await addCostLine.mutateAsync({
        claim_id: claimId,
        description: newCost.description,
        amount: parseFloat(newCost.amount),
        konto_nr: newCost.konto_nr && newCost.konto_nr !== 'none' ? parseInt(newCost.konto_nr) : undefined
      });
      
      setNewCost({ description: '', amount: '', konto_nr: '' });
    } catch (error) {
      console.error('Error adding cost:', error);
    }
  };

  const getAccountType = (konto_nr: number | null) => {
    if (!konto_nr || !accountCodes) return 'Ukjent konto';
    const account = accountCodes.find(acc => acc.konto_nr === konto_nr);
    return account ? `${account.konto_nr} - ${account.type}` : `${konto_nr} - Ukjent`;
  };

  const totalCost = costs?.reduce((sum, cost) => sum + Number(cost.amount), 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-myhrvold-primary" />
            Kostnader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-myhrvold-primary" />
          Kostnader
        </CardTitle>
        <CardDescription>
          Totalt: {totalCost.toLocaleString('nb-NO')} kr
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new cost form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <Input
            placeholder="Beskrivelse"
            value={newCost.description}
            onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Beløp"
            value={newCost.amount}
            onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
          />
          <Select 
            value={newCost.konto_nr} 
            onValueChange={(value) => setNewCost({ ...newCost, konto_nr: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg konto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ingen konto</SelectItem>
              {accountCodes?.map(account => (
                <SelectItem key={account.konto_nr} value={account.konto_nr.toString()}>
                  {account.konto_nr} - {account.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddCost}
            disabled={!newCost.description || !newCost.amount || addCostLine.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Legg til
          </Button>
        </div>

        {/* Cost lines list */}
        <div className="space-y-3">
          {costs?.map((cost) => (
            <div key={cost.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{cost.description}</p>
                  {cost.konto_nr && (
                    <Badge variant="outline" className="text-xs">
                      {getAccountType(cost.konto_nr)}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {format(new Date(cost.created_at), 'dd.MM.yyyy')}
                  {cost.voucher_no && ` • Bilag: ${cost.voucher_no}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{Number(cost.amount).toLocaleString('nb-NO')} kr</p>
                <p className="text-xs text-gray-500">{cost.source}</p>
              </div>
            </div>
          ))}
        </div>

        {costs?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Ingen kostnader registrert ennå.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimCosts;
