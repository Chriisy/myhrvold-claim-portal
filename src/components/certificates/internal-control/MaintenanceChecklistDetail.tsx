
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
  const [addControlOpen, setAddControlOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string>('');
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
          Tilbake
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">{checklist.name}</h2>
          {checklist.location && (
            <p className="text-gray-600">{checklist.location}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Utstyr og kontroller</CardTitle>
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
                  <DialogTitle>Legg til utstyr</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEquipment} className="space-y-4">
                  <div>
                    <Label htmlFor="equipment">Utstyr</Label>
                    <Select 
                      value={equipmentFormData.equipmentId}
                      onValueChange={(value) => setEquipmentFormData(prev => ({ ...prev, equipmentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Velg utstyr" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.name} (ID: {eq.default_id_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="idNumber">ID-nummer (valgfritt override)</Label>
                    <Input
                      id="idNumber"
                      value={equipmentFormData.idNumberOverride}
                      onChange={(e) => setEquipmentFormData(prev => ({ ...prev, idNumberOverride: e.target.value }))}
                      placeholder="Overstyr standard ID-nummer"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setAddEquipmentOpen(false)}>
                      Avbryt
                    </Button>
                    <Button type="submit" disabled={addEquipment.isPending}>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Utstyr</TableHead>
                  <TableHead className="min-w-[100px]">ID</TableHead>
                  {allControlNumbers.map(controlNo => (
                    <TableHead key={controlNo} className="min-w-[200px]">
                      Kontroll {controlNo}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.equipment?.name}
                    </TableCell>
                    <TableCell>
                      {row.id_number_override || row.equipment?.default_id_number}
                    </TableCell>
                    {allControlNumbers.map(controlNo => {
                      const control = controlsByRow[row.id]?.[controlNo];
                      return (
                        <TableCell key={controlNo}>
                          {control ? (
                            <div className="space-y-2">
                              <Input
                                type="date"
                                value={control.control_date || ''}
                                onChange={(e) => handleUpdateControl(control.id, 'control_date', e.target.value)}
                                className="w-full"
                              />
                              <Input
                                placeholder="Signatur/initialer"
                                value={control.signature || ''}
                                onChange={(e) => handleUpdateControl(control.id, 'signature', e.target.value)}
                                className="w-full"
                              />
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">Ingen kontroll</div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceChecklistDetail;
