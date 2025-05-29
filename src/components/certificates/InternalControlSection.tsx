
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoutineDocuments } from './internal-control/RoutineDocuments';
import { DigitalChecklists } from './internal-control/DigitalChecklists';
import { ControlHistory } from './internal-control/ControlHistory';

export const InternalControlSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Internkontroll</h2>
        <p className="text-gray-600">Administrer rutinedokumenter, sjekklister og kontrollhistorikk</p>
      </div>
      
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">Rutinedokumenter</TabsTrigger>
          <TabsTrigger value="checklists">Digitale Sjekklister</TabsTrigger>
          <TabsTrigger value="history">Kontrollhistorikk</TabsTrigger>
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
    </div>
  );
};

export default InternalControlSection;
