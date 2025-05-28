
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, ClipboardCheck, Upload, History, AlertTriangle } from 'lucide-react';
import { RoutineDocuments } from './internal-control/RoutineDocuments';
import { DigitalChecklists } from './internal-control/DigitalChecklists';
import { ControlHistory } from './internal-control/ControlHistory';

export const InternalControlSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-myhrvold-primary" />
            Internkontroll for F-gass
          </CardTitle>
          <CardDescription>
            Digital håndtering av rutinedokumentasjon, sjekklister og kontrollhistorikk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Rutinedokumenter
              </TabsTrigger>
              <TabsTrigger value="checklists" className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Sjekklister
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Historikk
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <RoutineDocuments />
            </TabsContent>

            <TabsContent value="checklists">
              <DigitalChecklists />
            </TabsContent>

            <TabsContent value="history">
              <ControlHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
