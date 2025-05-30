
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckSquare, Wrench, Clock, Plus, Calendar } from 'lucide-react';

export function InternalControlDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-myhrvold-primary">Internkontroll</h1>
            <p className="text-gray-600">Administrer rutinedokumenter, sjekklister og vedlikeholdsjournaler</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="documents">Rutinedokumenter</TabsTrigger>
          <TabsTrigger value="checklists">Digitale Sjekklister</TabsTrigger>
          <TabsTrigger value="maintenance">Vedlikeholdsjournal</TabsTrigger>
          <TabsTrigger value="history">Kontrollhistorikk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Dokumenter</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +2 fra forrige måned
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventende Kontroller</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  3 forfaller denne uken
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vedlikehold</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Planlagte aktiviteter
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forfalte Oppgaver</CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">3</div>
                <p className="text-xs text-muted-foreground">
                  Krever umiddelbar oppmerksomhet
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Nylige Kontroller</CardTitle>
                <CardDescription>Siste gjennomførte internkontroller</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ukentlig sikkerhetskontroll</p>
                    <p className="text-sm text-gray-600">Utført av: Ole Hansen</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Godkjent</Badge>
                    <p className="text-xs text-gray-500">2 timer siden</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Månedsrapport utstyr</p>
                    <p className="text-sm text-gray-600">Utført av: Kari Nordahl</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Avvik funnet</Badge>
                    <p className="text-xs text-gray-500">1 dag siden</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Brannsikkerhet kontroll</p>
                    <p className="text-sm text-gray-600">Utført av: Lars Olsen</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Godkjent</Badge>
                    <p className="text-xs text-gray-500">3 dager siden</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kommende Oppgaver</CardTitle>
                <CardDescription>Planlagte kontroller og vedlikehold</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Årlig kalibrering målutstyr</p>
                    <p className="text-sm text-gray-600">Ansvarlig: Teknisk avdeling</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">Om 2 dager</Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      15. jan
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Kvartalsvis HMS-gjennomgang</p>
                    <p className="text-sm text-gray-600">Ansvarlig: HMS-koordinator</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">Om 1 uke</Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      20. jan
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Revisjon av prosedyrer</p>
                    <p className="text-sm text-gray-600">Ansvarlig: Kvalitetsleder</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">Forfallt</Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      10. jan
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Rutinedokumenter</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nytt dokument
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Ingen dokumenter ennå</h3>
                <p className="text-sm">Last opp ditt første rutinedokument for å komme i gang</p>
                <Button className="mt-4" variant="outline">
                  Last opp dokument
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Digitale Sjekklister</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ny sjekkliste
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Ingen sjekklister ennå</h3>
                <p className="text-sm">Opprett din første digitale sjekkliste for å standardisere kontrollprosesser</p>
                <Button className="mt-4" variant="outline">
                  Opprett sjekkliste
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Vedlikeholdsjournal</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ny vedlikeholdsoppgave
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Ingen vedlikeholdsoppgaver ennå</h3>
                <p className="text-sm">Registrer ditt første vedlikehold for å holde oversikt over alle aktiviteter</p>
                <Button className="mt-4" variant="outline">
                  Registrer vedlikehold
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Kontrollhistorikk</h2>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Ingen historikk ennå</h3>
                <p className="text-sm">Når du utfører kontroller vil historikken vises her</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
