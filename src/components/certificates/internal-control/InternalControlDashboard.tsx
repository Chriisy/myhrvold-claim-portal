
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckSquare, Wrench, Clock, Plus, Calendar, Upload, Eye, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export function InternalControlDashboard() {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'HMS Prosedyre v2.1', type: 'Prosedyre', updated: '2024-01-15', status: 'Aktiv' },
    { id: 2, name: 'Sikkerhetsinstruks', type: 'Instruks', updated: '2024-01-10', status: 'Til godkjenning' },
  ]);

  const [checklists, setChecklists] = useState([
    { id: 1, name: 'Ukentlig sikkerhetskontroll', items: 12, completed: 8, lastCheck: '2024-01-14' },
    { id: 2, name: 'Månedsrapport utstyr', items: 20, completed: 15, lastCheck: '2024-01-12' },
  ]);

  const [maintenanceLog, setMaintenanceLog] = useState([
    { id: 1, equipment: 'Kompressor A1', type: 'Vedlikehold', date: '2024-01-15', technician: 'Ole Hansen', status: 'Fullført' },
    { id: 2, equipment: 'Kjøleaggregat B2', type: 'Inspeksjon', date: '2024-01-16', technician: 'Kari Nordahl', status: 'Planlagt' },
  ]);

  const handleUploadDocument = () => {
    toast({
      title: "Dokument lastet opp",
      description: "Nytt dokument er lagt til i systemet",
    });
  };

  const handleCreateChecklist = () => {
    toast({
      title: "Sjekkliste opprettet",
      description: "Ny sjekkliste er opprettet og klar for bruk",
    });
  };

  const handleAddMaintenance = () => {
    toast({
      title: "Vedlikehold registrert",
      description: "Nytt vedlikehold er registrert i journalen",
    });
  };

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
                <div className="text-2xl font-bold">{documents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {documents.filter(d => d.status === 'Aktiv').length} godkjente
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventende Kontroller</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{checklists.length}</div>
                <p className="text-xs text-muted-foreground">
                  Aktive sjekklister
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vedlikehold</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenanceLog.length}</div>
                <p className="text-xs text-muted-foreground">
                  Registrerte aktiviteter
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
                  Krever oppmerksomhet
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
                {checklists.map(checklist => (
                  <div key={checklist.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{checklist.name}</p>
                      <p className="text-sm text-gray-600">{checklist.completed}/{checklist.items} elementer</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={checklist.completed === checklist.items ? "default" : "secondary"}>
                        {checklist.completed === checklist.items ? "Komplett" : "Pågår"}
                      </Badge>
                      <p className="text-xs text-gray-500">{checklist.lastCheck}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kommende Oppgaver</CardTitle>
                <CardDescription>Planlagte kontroller og vedlikehold</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {maintenanceLog.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.equipment}</p>
                      <p className="text-sm text-gray-600">Ansvarlig: {item.technician}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.status === 'Fullført' ? "default" : "outline"}>
                        {item.status}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {item.date}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Rutinedokumenter</h2>
            <Button onClick={handleUploadDocument}>
              <Plus className="w-4 h-4 mr-2" />
              Last opp dokument
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {documents.length === 0 ? (
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Ingen dokumenter ennå</h3>
                  <p className="text-sm">Last opp ditt første rutinedokument for å komme i gang</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{doc.name}</h3>
                          <p className="text-sm text-gray-600">{doc.type} • Oppdatert {doc.updated}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={doc.status === 'Aktiv' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Vis
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Last ned
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Digitale Sjekklister</h2>
            <Button onClick={handleCreateChecklist}>
              <Plus className="w-4 h-4 mr-2" />
              Ny sjekkliste
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {checklists.length === 0 ? (
                <div className="text-center text-gray-500">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Ingen sjekklister ennå</h3>
                  <p className="text-sm">Opprett din første digitale sjekkliste for å standardisere kontrollprosesser</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {checklists.map(checklist => (
                    <div key={checklist.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckSquare className="w-8 h-8 text-green-500" />
                        <div>
                          <h3 className="font-medium">{checklist.name}</h3>
                          <p className="text-sm text-gray-600">{checklist.items} elementer • Sist sjekket {checklist.lastCheck}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{checklist.completed}/{checklist.items}</div>
                          <div className="text-xs text-gray-500">Fullført</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Utfør kontroll
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Vedlikeholdsjournal</h2>
            <Button onClick={handleAddMaintenance}>
              <Plus className="w-4 h-4 mr-2" />
              Ny vedlikeholdsoppgave
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {maintenanceLog.length === 0 ? (
                <div className="text-center text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Ingen vedlikeholdsoppgaver ennå</h3>
                  <p className="text-sm">Registrer ditt første vedlikehold for å holde oversikt over alle aktiviteter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceLog.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Wrench className="w-8 h-8 text-orange-500" />
                        <div>
                          <h3 className="font-medium">{item.equipment}</h3>
                          <p className="text-sm text-gray-600">{item.type} • {item.technician}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={item.status === 'Fullført' ? 'default' : 'outline'}>
                          {item.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">{item.date}</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Detaljer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
