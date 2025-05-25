
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard } from 'lucide-react';
import { useClaimCredits, useAddCreditNote } from '@/hooks/useClaimCredits';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { format } from 'date-fns';

interface ClaimCreditsProps {
  claimId: string;
}

const ClaimCredits = ({ claimId }: ClaimCreditsProps) => {
  const { data: credits, isLoading } = useClaimCredits(claimId);
  const { data: accountCodes } = useAccountCodes();
  const addCreditNote = useAddCreditNote();
  
  const [newCredit, setNewCredit] = useState({
    description: '',
    amount: '',
    konto_nr: '',
    voucher_no: ''
  });

  const handleAddCredit = async () => {
    if (!newCredit.description || !newCredit.amount) return;

    try {
      await addCreditNote.mutateAsync({
        claim_id: claimId,
        description: newCredit.description,
        amount: parseFloat(newCredit.amount),
        konto_nr: newCredit.konto_nr && newCredit.konto_nr !== 'none' ? parseInt(newCredit.konto_nr) : undefined,
        voucher_no: newCredit.voucher_no || undefined
      });
      
      setNewCredit({ description: '', amount: '', konto_nr: '', voucher_no: '' });
    } catch (error) {
      console.error('Error adding credit note:', error);
    }
  };

  const getAccountType = (konto_nr: number | null) => {
    if (!konto_nr || !accountCodes) return 'Ukjent konto';
    const account = accountCodes.find(acc => acc.konto_nr === konto_nr);
    return account ? `${account.konto_nr} - ${account.type}` : `${konto_nr} - Ukjent`;
  };

  const totalCredit = credits?.reduce((sum, credit) => sum + Number(credit.amount), 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-myhrvold-primary" />
            Kreditnotaer
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
          <CreditCard className="w-5 h-5 text-myhrvold-primary" />
          Kreditnotaer
        </CardTitle>
        <CardDescription>
          Totalt: {totalCredit.toLocaleString('nb-NO')} kr
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new credit form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <Input
            placeholder="Beskrivelse"
            value={newCredit.description}
            onChange={(e) => setNewCredit({ ...newCredit, description: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Beløp"
            value={newCredit.amount}
            onChange={(e) => setNewCredit({ ...newCredit, amount: e.target.value })}
          />
          <Select 
            value={newCredit.konto_nr} 
            onValueChange={(value) => setNewCredit({ ...newCredit, konto_nr: value })}
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
          <Input
            placeholder="Bilagsnr (valgfritt)"
            value={newCredit.voucher_no}
            onChange={(e) => setNewCredit({ ...newCredit, voucher_no: e.target.value })}
          />
          <Button 
            onClick={handleAddCredit}
            disabled={!newCredit.description || !newCredit.amount || addCreditNote.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Legg til
          </Button>
        </div>

        {/* Credit notes list */}
        <div className="space-y-3">
          {credits?.map((credit) => (
            <div key={credit.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{credit.description}</p>
                  {credit.konto_nr && (
                    <Badge variant="outline" className="text-xs">
                      {getAccountType(credit.konto_nr)}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {format(new Date(credit.created_at), 'dd.MM.yyyy')}
                  {credit.voucher_no && ` • Bilag: ${credit.voucher_no}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{Number(credit.amount).toLocaleString('nb-NO')} kr</p>
                <p className="text-xs text-gray-500">{credit.source}</p>
              </div>
            </div>
          ))}
        </div>

        {credits?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Ingen kreditnotaer registrert ennå.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimCredits;
