
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Upload, CheckCircle, AlertCircle, Download } from 'lucide-react';

const defaultUserList = `Eirik Jarl Wangberg - eirik.jarl.wangberg@myhrvold.no - tekniker - oslo
Indupriya Jayasundera - indupriya.jayasundera@myhrvold.no - tekniker - oslo`;

interface BulkImportStepProps {
  onImportComplete?: () => void;
}

export function BulkImportStep({ onImportComplete }: BulkImportStepProps) {
  const [userList, setUserList] = useState(defaultUserList);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const parseUserList = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const parts = line.split(' - ');
      if (parts.length !== 4) {
        throw new Error(`Linje ${index + 1}: Ugyldig format. Forventet: "Navn - epost - rolle - avdeling"`);
      }

      let department = parts[3].trim();
      if (department === 'stavanger') {
        department = 'kristiansand';
      }

      const userRole = parts[2].trim();
      
      return {
        name: parts[0].trim(),
        email: parts[1].trim(),
        user_role: userRole as 'tekniker' | 'saksbehandler' | 'admin' | 'avdelingsleder',
        department: department as 'oslo' | 'bergen' | 'trondheim' | 'kristiansand' | 'sornorge' | 'nord'
      };
    });
  };

  const handleImport = async () => {
    if (!userList.trim()) {
      toast({
        title: 'Feil',
        description: 'Vennligst legg til brukere å importere',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      const users = parseUserList(userList);
      const results = { success: 0, failed: 0, errors: [] as string[] };

      for (const user of users) {
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();

          if (existingUser) {
            results.errors.push(`${user.name}: Brukeren finnes allerede`);
            results.failed++;
            continue;
          }

          const fakeUserId = crypto.randomUUID();
          let legacyRole;
          switch (user.user_role) {
            case 'tekniker':
              legacyRole = 'technician';
              break;
            case 'saksbehandler':
              legacyRole = 'case_handler';
              break;
            case 'admin':
              legacyRole = 'admin';
              break;
            case 'avdelingsleder':
              legacyRole = 'department_manager';
              break;
            default:
              legacyRole = 'technician';
          }

          const { error } = await supabase
            .from('users')
            .insert({
              id: fakeUserId,
              name: user.name,
              email: user.email,
              user_role: user.user_role,
              department: user.department,
              role: legacyRole,
            });

          if (error) {
            results.errors.push(`${user.name}: ${error.message}`);
            results.failed++;
          } else {
            results.success++;
          }
        } catch (error) {
          results.errors.push(`${user.name}: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
          results.failed++;
        }
      }

      setImportResults(results);

      if (results.success > 0) {
        toast({
          title: 'Import fullført',
          description: `${results.success} brukere importert. ${results.failed} feilet.`,
        });
        onImportComplete?.();
      } else {
        toast({
          title: 'Import feilet',
          description: 'Ingen brukere ble importert',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Feil',
        description: error instanceof Error ? error.message : 'Ukjent feil under import',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Navn - epost - rolle - avdeling
Ola Nordmann - ola.nordmann@myhrvold.no - tekniker - oslo
Kari Hansen - kari.hansen@myhrvold.no - saksbehandler - bergen`;
    
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bruker-import-mal.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk import av brukere
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Last ned mal
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">
            Brukerliste (format: Navn - epost - rolle - avdeling)
          </label>
          <Textarea
            value={userList}
            onChange={(e) => setUserList(e.target.value)}
            placeholder="Eirik Jarl Wangberg - eirik.jarl.wangberg@myhrvold.no - tekniker - oslo"
            rows={15}
            className="mt-2 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            En bruker per linje. Roller: tekniker, saksbehandler, admin, avdelingsleder. Avdelinger: oslo, bergen, trondheim, kristiansand, sornorge, nord
          </p>
        </div>

        <Button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isImporting ? 'Importerer...' : 'Importer brukere'}
        </Button>

        {importResults && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {importResults.success} vellykket
              </Badge>
              {importResults.failed > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {importResults.failed} feilet
                </Badge>
              )}
            </div>
            
            {importResults.errors.length > 0 && (
              <div className="text-sm">
                <p className="font-medium text-red-600">Feil:</p>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc list-inside text-red-600 text-xs space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
