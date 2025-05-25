
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAccountCodes } from '@/hooks/useAccountCodes';
import { Search } from 'lucide-react';

interface AccountCode {
  konto_nr: number;
  type: string;
  seller_flag: boolean;
  comment: string | null;
}

interface AccountCodeSelectorProps {
  selectedAccountCodeId?: number;
  onAccountCodeChange: (accountCodeId: number | undefined) => void;
  isEditing: boolean;
}

export function AccountCodeSelector({ selectedAccountCodeId, onAccountCodeChange, isEditing }: AccountCodeSelectorProps) {
  const { data: accountCodes = [], isLoading } = useAccountCodes();
  const [searchTerm, setSearchTerm] = useState('');

  const selectedAccountCode = accountCodes.find(code => code.konto_nr === selectedAccountCodeId);

  const filteredAccountCodes = accountCodes.filter(code => 
    code.konto_nr.toString().includes(searchTerm) ||
    code.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (code.comment && code.comment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div>Laster kontokoder...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Kontokode</h4>
        {!isEditing ? (
          <div className="space-y-2">
            {selectedAccountCode ? (
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Konto:</span>
                  <Badge variant="outline">{selectedAccountCode.konto_nr}</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Type:</span> {selectedAccountCode.type}</div>
                  {selectedAccountCode.seller_flag && (
                    <Badge className="bg-blue-100 text-blue-800">Selger</Badge>
                  )}
                  {selectedAccountCode.comment && (
                    <div><span className="font-medium">Kommentar:</span> {selectedAccountCode.comment}</div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Ingen kontokode valgt</span>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="account_code">Velg kontokode</Label>
              <Select 
                value={selectedAccountCodeId ? selectedAccountCodeId.toString() : ''} 
                onValueChange={(value) => onAccountCodeChange(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg kontokode" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="">Ingen kontokode</SelectItem>
                  {accountCodes.map((code) => (
                    <SelectItem key={code.konto_nr} value={code.konto_nr.toString()}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{code.konto_nr}</Badge>
                        <span>{code.type}</span>
                        {code.seller_flag && <Badge className="bg-blue-100 text-blue-800 text-xs">S</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Søk i kontokoder</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Søk etter kontonummer, type eller kommentar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kontonr</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Selger</TableHead>
                    <TableHead>Kommentar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccountCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                        {searchTerm ? 'Ingen kontokoder funnet' : 'Ingen kontokoder tilgjengelig'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccountCodes.map((code) => (
                      <TableRow 
                        key={code.konto_nr}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedAccountCodeId === code.konto_nr ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => onAccountCodeChange(code.konto_nr)}
                      >
                        <TableCell>
                          <Badge variant="outline">{code.konto_nr}</Badge>
                        </TableCell>
                        <TableCell>{code.type}</TableCell>
                        <TableCell>
                          {code.seller_flag && <Badge className="bg-blue-100 text-blue-800">Ja</Badge>}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={code.comment || ''}>
                          {code.comment || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
