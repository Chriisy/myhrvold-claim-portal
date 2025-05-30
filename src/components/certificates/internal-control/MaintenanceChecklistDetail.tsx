
import { useState } from 'react';
import { useMaintenanceChecklist, useMaintenanceEquipment, useAddEquipmentToChecklist, useAddMaintenanceControl, useUpdateMaintenanceControl } from '@/hooks/useMaintenance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Calendar, Download } from 'lucide-react';

interface MaintenanceChecklistDetailProps {
  checklistId: string;
  onBack: () => void;
}

export const MaintenanceChecklistDetail = ({ checklistId, onBack }: MaintenanceChecklistDetailProps) => {
  const { data, isLoading } = useMaintenanceChecklist(checklistId);
  const { data: equipment = [] } = useMaintenanceEquipment();
  const addEquipment = useAddEquipmentToChecklist();
  const addControl = useAddMaintenanceControl();
  const updateControl = useUpdateMaintenanceControl();
  
  const [addEquipmentOpen, setAddEquipmentOpen] = useState(false);
  const [equipmentFormData, setEquipmentFormData] = useState({
    equipmentId: '',
    idNumberOverride: ''
  });

  if (isLoading || !data) {
    return <div className="flex justify-center p-8">Laster vedlikeholdsjournal...</div>;
  }

  const { checklist, rows, controls } = data;

  // Group controls by row_id and control_no
  const controlsByRow = controls.reduce((acc, control) => {
    if (!acc[control.row_id]) acc[control.row_id] = {};
    acc[control.row_id][control.control_no] = control;
    return acc;
  }, {} as Record<string, Record<number, any>>);

  // Get all unique control numbers
  const allControlNumbers = [...new Set(controls.map(c => c.control_no))].sort((a, b) => a - b);
  const maxControlNo = Math.max(0, ...allControlNumbers);

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEquipment.mutateAsync({
        checklistId,
        equipmentId: equipmentFormData.equipmentId,
        idNumberOverride: equipmentFormData.idNumberOverride || undefined
      });
      setAddEquipmentOpen(false);
      setEquipmentFormData({ equipmentId: '', idNumberOverride: '' });
    } catch (error) {
      console.error('Add equipment failed:', error);
    }
  };

  const handleAddNewControl = async () => {
    const newControlNo = maxControlNo + 1;
    
    // Add a new control column for all existing rows
    for (const row of rows) {
      try {
        await addControl.mutateAsync({
          rowId: row.id,
          controlNo: newControlNo
        });
      } catch (error) {
        console.error('Failed to add control for row:', row.id);
      }
    }
  };

  const handleUpdateControl = async (controlId: string, field: 'control_date' | 'signature', value: string) => {
    const existingControl = controls.find(c => c.id === controlId);
    if (!existingControl) return;

    const updateData = {
      controlId,
      controlDate: field === 'control_date' ? value : existingControl.control_date,
      signature: field === 'signature' ? value : existingControl.signature
    };

    try {
      await updateControl.mutateAsync(updateData);
    } catch (error) {
      console.error('Update control failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbake til oversikt
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">{checklist.name}</h2>
          {checklist.location && (
            <p className="text-gray-600">{checklist.location}</p>
          )}
          <p className="text-sm text-gray-500">
            Opprettet: {new Date(checklist.created_at).toLocaleDateString('nb-NO')}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Slik fungerer vedlikeholdsjournalen:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Hver rad representerer et utstyr med ID-nummer</li>
          <li>• Hver kolonne representerer en kontrollrunde (Kontroll 1, Kontroll 2, osv.)</li>
          <li>• Fyll inn dato og signatur for hver gjennomførte kontroll</li>
          <li>• Legg til nye kontrollrunder ved å klikke "Legg til kontroll"</li>
        </ul>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vedlikeholdsmatrise</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddNewControl}>
              <Plus className="w-4 h-4 mr-2" />
              Legg til kontroll
            </Button>
            <Dialog open={addEquipmentOpen} onOpenChange={setAddEquipmentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Legg til utstyr
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Legg til utstyr i journal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEquipment} className="space-y-4">
                  <div>
                    <Label htmlFor="equipment">Velg utstyr</Label>
                    <Select 
                      value={equipmentFormData.equipmentId}
                      onValueChange={(value) => setEquipmentFormData(prev => ({ ...prev, equipmentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Velg utstyr fra listen" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.name} (Standard ID: {eq.default_id_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="idNumber">Overstyr ID-nummer (valgfritt)</Label>
                    <Input
                      id="idNumber"
                      value={equipmentFormData.idNumberOverride}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, idNumberOverride: e.target.value }))}
                      placeholder="La stå tom for å bruke standard ID"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setAddEquipmentOpen(false)}>
                      Avbryt
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={addEquipment.isPending || !equipmentFormData.equipmentId}
                    >
                      {addEquipment.isPending ? 'Legger til...' : 'Legg til'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Eksporter
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {rows.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Ingen utstyr lagt til ennå
              </h3>
              <p className="text-gray-500 mb-6">
                Legg til utstyr for å starte med vedlikeholdsjournalen.
              </p>
              <Button onClick={() => setAddEquipmentOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Legg til første utstyr
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px] font-semibold">Utstyr</TableHead>
                    <TableHead className="min-w-[80px] font-semibold">ID</TableHead>
                    {allControlNumbers.map(controlNo => (
                      <TableHead key={controlNo} className="min-w-[200px] font-semibold text-center">
                        Kontroll {controlNo}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} className="border-b">
                      <TableCell className="font-medium">
                        {row.equipment?.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {row.id_number_override || row.equipment?.default_id_number}
                      </TableCell>
                      {allControlNumbers.map(controlNo => {
                        const control = controlsByRow[row.id]?.[controlNo];
                        return (
                          <TableCell key={controlNo} className="p-2">
                            {control ? (
                              <div className="space-y-2">
                                <Input
                                  type="date"
                                  value={control.control_date || ''}
                                  onChange={(e) => handleUpdateControl(control.id, 'control_date', e.target.value)}
                                  className="w-full text-sm"
                                  placeholder="Velg dato"
                                />
                                <Input
                                  placeholder="Signatur/initialer"
                                  value={control.signature || ''}
                                  onChange={(e) => handleUpdateControl(control.id, 'signature', e.target.value)}
                                  className="w-full text-sm"
                                />
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm text-center py-4">
                                Ingen kontroll
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceChecklistDetail;
