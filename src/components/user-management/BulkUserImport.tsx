
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const defaultUserList = `Eirik Jarl Wangberg - eirik.jarl.wangberg@myhrvold.no - tekniker - oslo
Indupriya Jayasundera - indupriya.jayasundera@myhrvold.no - tekniker - oslo
Rizwan Bakhsh - rizwan.bakhsh@myhrvold.no - tekniker - oslo
Erik Lomsdal - erik.lomsdal@myhrvold.no - tekniker - oslo
Christopher Strøm - christopher.strom@myhrvold.no - tekniker - oslo
Arild Opsal - arild.opsal@myhrvold.no - tekniker - oslo
Toan Duc Tran - toan.duc.tran@myhrvold.no - tekniker - oslo
Bjørn Slettebø - bjorn.slettebo@myhrvold.no - tekniker - oslo
Eirik Carlos Aker - eirik.carlos.aker@myhrvold.no - tekniker - oslo
Kjell-Åge Solhaug - kjell.aage.solhaug@myhrvold.no - tekniker - oslo
Glenn Thapper - glenn.thapper@myhrvold.no - tekniker - oslo
Kristian Rambol - kristian.rambol@myhrvold.no - tekniker - oslo
Rune Jørgensen - rune.jorgensen@myhrvold.no - tekniker - oslo
Johannes Sandberg - johannes.sandberg@myhrvold.no - tekniker - oslo
Nikolai Bull-Steinsland - nikolai.bull.steinsland@myhrvold.no - tekniker - oslo
Louis A. I. Johansen - louis.johansen@myhrvold.no - tekniker - oslo
Sander Gundersen Akne - sander.gundersen.akne@myhrvold.no - tekniker - oslo
Maksym Yarovyi - maksym.yarovyi@myhrvold.no - tekniker - oslo
Roy Abrahamsen - roy.abrahamsen@myhrvold.no - tekniker - bergen
Sebastian Opheim - sebastian.opheim@myhrvold.no - tekniker - bergen
Øyvind Knutsen - oyvind.knutsen@myhrvold.no - tekniker - bergen
Ruben Vørås - ruben.voras@myhrvold.no - tekniker - bergen
Henrik Osberg-Jacobsen - henrik.osberg.jacobsen@myhrvold.no - tekniker - bergen
Ole Brakstad - ole.brakstad@myhrvold.no - tekniker - bergen
Hans Hanman Chan - hans.hanman.chan@myhrvold.no - tekniker - trondheim
Knut Narve Skogland - knut.narve.skogland@myhrvold.no - tekniker - trondheim
Petter Antonsen - petter.antonsen@myhrvold.no - tekniker - trondheim
Bendik Selvik - bendik.selvik@myhrvold.no - tekniker - trondheim
Gunvald Lund - gunvald.lund@myhrvold.no - tekniker - trondheim
Tom K. Karlsmoen - tom.karlsmoen@myhrvold.no - tekniker - trondheim
David Farstad - david.farstad@myhrvold.no - tekniker - trondheim
Alexander Kristoffersen - alexander.kristoffersen@myhrvold.no - tekniker - kristiansand
Anders Lødemel - anders.lodemel@myhrvold.no - tekniker - kristiansand
Mats Østberg Løkken - mats.ostberg.lokken@myhrvold.no - tekniker - kristiansand
Trond Erik Moe - trond.erik.moe@myhrvold.no - tekniker - sornorge
Morten Hamre - morten.hamre@myhrvold.no - tekniker - sornorge
Jacob Torgersen - jacob.torgersen@myhrvold.no - tekniker - sornorge
Petter O. Helgevold - petter.helgevold@myhrvold.no - tekniker - sornorge
Morten Bertheussen - morten.bertheussen@myhrvold.no - tekniker - nord
Øivind Brandt - oivind.brandt@myhrvold.no - saksbehandler - oslo
Erling Saksvoll - erling.saksvoll@myhrvold.no - saksbehandler - oslo
Morten Andresen - morten.andresen@myhrvold.no - saksbehandler - oslo
Jonas Åttemahn - jonas.attemahn@myhrvold.no - saksbehandler - oslo
Asbjørn Johansen - asbjorn.johansen@myhrvold.no - saksbehandler - oslo
Harald Kvist - harald.kvist@myhrvold.no - saksbehandler - oslo
Vidar Sagnes - vidar.sagnes@myhrvold.no - saksbehandler - oslo
Reidar Skartveit - reidar.skartveit@myhrvold.no - saksbehandler - oslo
Morten Olsen - morten.olsen@myhrvold.no - saksbehandler - oslo
Rune Torsvik - rune.torsvik@myhrvold.no - saksbehandler - oslo
Kåre Rønningen - kare.ronningen@myhrvold.no - saksbehandler - oslo
Frode Svedhaug - frode.svedhaug@myhrvold.no - saksbehandler - oslo
Stein Vollan - stein.vollan@myhrvold.no - saksbehandler - oslo
Thomas Bongard - thomas.bongard@myhrvold.no - saksbehandler - oslo
Jørn G. Nerlien - jorn.nerlien@myhrvold.no - saksbehandler - oslo
Per-Christian Sveen - per.christian.sveen@myhrvold.no - saksbehandler - oslo
Christian Holter - christian.holter@myhrvold.no - saksbehandler - oslo
Håkon Ruud - hakon.ruud@myhrvold.no - saksbehandler - oslo
Kjetil Sveum - kjetil.sveum@myhrvold.no - saksbehandler - oslo
Ragni N. Hansen - ragni.hansen@myhrvold.no - saksbehandler - oslo
Kent Eivind Vorland - kent.eivind.vorland@myhrvold.no - saksbehandler - oslo
Kjetil Wiik - kjetil.wiik@myhrvold.no - saksbehandler - oslo
Johan Brendmoe - johan.brendmoe@myhrvold.no - saksbehandler - oslo
Helge Oksnes - helge.oksnes@myhrvold.no - saksbehandler - oslo
Anette Dyhre - anette.dyhre@myhrvold.no - saksbehandler - oslo
Kjell Gunnar Wiik - kjell.gunnar.wiik@myhrvold.no - saksbehandler - oslo
Ioannis Olav Llandris - ioannis.olav.llandris@myhrvold.no - tekniker - oslo
Elise Tomter - elise.tomter@myhrvold.no - tekniker - oslo
Peder K. Wirsching - peder.wirsching@myhrvold.no - tekniker - oslo
Marius Sunde - marius.sunde@myhrvold.no - tekniker - oslo
Gry Mosebekk - gry.mosebekk@myhrvold.no - tekniker - oslo
Tor Midtskog - tor.midtskog@myhrvold.no - tekniker - oslo
Johnny Gulbrandsen - johnny.gulbrandsen@myhrvold.no - tekniker - oslo
Tomas Dvorak - tomas.dvorak@myhrvold.no - tekniker - oslo
Eduard Sulzer - eduard.sulzer@myhrvold.no - tekniker - oslo
Mark Rasmussen - mark.rasmussen@myhrvold.no - tekniker - oslo
Frank Henriksen - frank.henriksen@myhrvold.no - tekniker - oslo
Lukasz Laszczyk - lukasz.laszczyk@myhrvold.no - tekniker - oslo
Per Roger Rud - per.roger.rud@myhrvold.no - tekniker - oslo
Svein Smestad - svein.smestad@myhrvold.no - tekniker - oslo
Håkon Syversen - hakon.syversen@myhrvold.no - tekniker - oslo
Zdravko Milosavljevic - zdravko.milosavljevic@myhrvold.no - tekniker - oslo
Benny Nilsson - benny.nilsson@myhrvold.no - tekniker - oslo
Erlend Thomassen - erlend.thomassen@myhrvold.no - tekniker - oslo
Jan Erik Espeland - jan.erik.espeland@myhrvold.no - tekniker - oslo
Glenn Rasmussen - glenn.rasmussen@myhrvold.no - tekniker - oslo
Thomas Thoresen - thomas.thoresen@myhrvold.no - tekniker - oslo
Kine Tveråbakk - kine.tverabakk@myhrvold.no - tekniker - oslo
Åshild Selastdal - ashild.selastdal@myhrvold.no - tekniker - oslo
Frida Mansrud - frida.mansrud@myhrvold.no - tekniker - oslo
Anita Berg - anita.berg@myhrvold.no - tekniker - oslo
Kjell Henriksen - kjell.henriksen@myhrvold.no - tekniker - oslo
Irina Henriksen - irina.henriksen@myhrvold.no - tekniker - oslo
Lise Brunsberg - lise.brunsberg@myhrvold.no - tekniker - oslo
Terje Andersen - terje.andersen@myhrvold.no - tekniker - oslo
Ole-Viggo Sten - ole.viggo.sten@myhrvold.no - tekniker - oslo
Rolf-Espen Vegsund - rolf.espen.vegsund@myhrvold.no - tekniker - oslo
Kyrre Madsen - kyrre.madsen@myhrvold.no - tekniker - oslo
Jennie Brunbäck - jennie.brunback@myhrvold.no - tekniker - oslo`;

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

      const userRole = parts[2].trim();
      
      // Fix the role mapping - remove the problematic 'role' field for now
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

          // Map user_role to role for the legacy role field
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
            console.error('Insert error for user:', user.name, error);
            results.errors.push(`${user.name}: ${error.message}`);
            results.failed++;
          } else {
            results.success++;
          }
        } catch (error) {
          console.error('Catch error for user:', user.name, error);
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
      console.error('Parse error:', error);
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
            placeholder="Eirik Jarl Wangberg - eirik.jarl.wangberg@myhrvold.no - tekniker - oslo"
            rows={15}
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
