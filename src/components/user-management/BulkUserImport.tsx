
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const defaultUserList = `Arne Skaugen - arne.skaugen@myhrvold.no - tekniker - oslo
Trond Ryland - trond.ryland@myhrvold.no - tekniker - oslo  
Terje Heggen - terje.heggen@myhrvold.no - tekniker - oslo
Ketil Haugen - ketil.haugen@myhrvold.no - tekniker - oslo
Pål Kristiansen - pal.kristiansen@myhrvold.no - tekniker - oslo
Jan Erik Sølvberg - jan.erik.solvberg@myhrvold.no - tekniker - oslo
Kai Olsen - kai.olsen@myhrvold.no - tekniker - oslo
Morten Løvås - morten.lovas@myhrvold.no - tekniker - oslo
Kjetil Straumland - kjetil.straumland@myhrvold.no - tekniker - oslo
Øystein Sjo - oystein.sjo@myhrvold.no - tekniker - oslo
Ronny Aase - ronny.aase@myhrvold.no - tekniker - oslo
Frank Ryland - frank.ryland@myhrvold.no - tekniker - oslo
Knut Roarsen - knut.roarsen@myhrvold.no - tekniker - oslo
Jan Karstein Svendsen - jan.karstein.svendsen@myhrvold.no - tekniker - oslo
Øystein Roheim - oystein.roheim@myhrvold.no - tekniker - oslo
Andreas Hatlen - andreas.hatlen@myhrvold.no - tekniker - oslo
Trond Kleppe - trond.kleppe@myhrvold.no - tekniker - oslo
Eirik Eide - eirik.eide@myhrvold.no - tekniker - oslo
Johnny Syversen - johnny.syversen@myhrvold.no - tekniker - oslo
Jan Erik Drægebø - jan.erik.dragebo@myhrvold.no - tekniker - oslo`;

interface BulkUserImportProps {
  onImportComplete?: () => void;
}

export function BulkUserImport({ onImportComplete }: BulkUserImportProps) {
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

      // Map old department names to new ones
      let department = parts[3].trim();
      if (department === 'stavanger') {
        department = 'kristiansand'; // Map stavanger to kristiansand
      }

      return {
        name: parts[0].trim(),
        email: parts[1].trim(),
        user_role: parts[2].trim() as 'tekniker' | 'saksbehandler' | 'admin' | 'avdelingsleder',
        department: department as 'oslo' | 'bergen' | 'trondheim' | 'kristiansand' | 'sornorge' | 'nord',
        role: parts[2].trim() === 'tekniker' ? 'technician' : 
              parts[2].trim() === 'saksbehandler' ? 'case_handler' :
              parts[2].trim() === 'admin' ? 'admin' : 'department_manager'
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
          // Check if user already exists
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

          // Create a fake UUID for the user (since we don't have real auth users)
          const fakeUserId = crypto.randomUUID();

          const { error } = await supabase
            .from('users')
            .insert({
              id: fakeUserId,
              name: user.name,
              email: user.email,
              user_role: user.user_role,
              department: user.department,
              role: user.role,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk import av brukere
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
            placeholder="Arne Skaugen - arne.skaugen@myhrvold.no - tekniker - oslo"
            rows={10}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            En bruker per linje. Roller: tekniker, saksbehandler, admin, avdelingsleder. Avdelinger: oslo, bergen, trondheim, kristiansand, sornorge, nord
          </p>
        </div>

        <Button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full"
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
                <ul className="list-disc list-inside text-red-600 text-xs space-y-1">
                  {importResults.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
