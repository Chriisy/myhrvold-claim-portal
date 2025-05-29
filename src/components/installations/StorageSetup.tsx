
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Database } from 'lucide-react';

export const StorageSetup = () => {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <AlertTriangle className="w-5 h-5" />
          <span>Lagring ikke konfigurert</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-orange-700">
            Bildeopplasting krever at lagringsbøtte er konfigurert i Supabase.
          </p>
          <div className="bg-white p-3 rounded border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Nødvendige steg:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700">
              <li>Opprett lagringsbøtte "installation-photos" i Supabase</li>
              <li>Konfigurer tilgangspolicyer for bøtten</li>
              <li>Test bildeopplasting funksjonalitet</li>
            </ol>
          </div>
          <Button variant="outline" className="w-full">
            <Database className="w-4 h-4 mr-2" />
            Åpne Supabase Storage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
