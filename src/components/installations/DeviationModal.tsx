import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, X } from 'lucide-react';

interface Deviation {
  id: string;
  category: string;
  severity: 'lav' | 'medium' | 'høy' | 'kritisk';
  description: string;
  action_required: string;
  created_at: string;
}

interface DeviationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviations: Deviation[];
  onAddDeviation: (deviation: Omit<Deviation, 'id' | 'created_at'>) => void;
  onRemoveDeviation: (deviationId: string) => void;
}

export const DeviationModal = ({ 
  open, 
  onOpenChange, 
  deviations, 
  onAddDeviation, 
  onRemoveDeviation 
}: DeviationModalProps) => {
  const [newDeviation, setNewDeviation] = useState({
    category: '',
    severity: 'medium' as const,
    description: '',
    action_required: ''
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'lav': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'høy': return 'bg-orange-100 text-orange-800';
      case 'kritisk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddDeviation = () => {
    if (!newDeviation.category || !newDeviation.description) return;

    onAddDeviation(newDeviation);
    setNewDeviation({
      category: '',
      severity: 'medium',
      description: '',
      action_required: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Avviksnotater
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing deviations */}
          {deviations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Registrerte avvik</h4>
              {deviations.map((deviation) => (
                <div key={deviation.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{deviation.category}</span>
                      <Badge className={getSeverityColor(deviation.severity)}>
                        {deviation.severity}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveDeviation(deviation.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{deviation.description}</p>
                  {deviation.action_required && (
                    <div className="text-sm">
                      <span className="font-medium">Tiltak: </span>
                      <span className="text-gray-600">{deviation.action_required}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add new deviation */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Legg til nytt avvik</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={newDeviation.category}
                  onChange={(e) => setNewDeviation({ ...newDeviation, category: e.target.value })}
                  placeholder="F.eks. Installasjon, Sikkerhet, Dokumentasjon"
                />
              </div>

              <div>
                <Label htmlFor="severity">Alvorlighetsgrad</Label>
                <Select 
                  value={newDeviation.severity} 
                  onValueChange={(value) => setNewDeviation({ ...newDeviation, severity: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lav">Lav</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="høy">Høy</SelectItem>
                    <SelectItem value="kritisk">Kritisk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  value={newDeviation.description}
                  onChange={(e) => setNewDeviation({ ...newDeviation, description: e.target.value })}
                  placeholder="Beskriv avviket i detalj..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="action">Foreslått tiltak</Label>
                <Textarea
                  id="action"
                  value={newDeviation.action_required}
                  onChange={(e) => setNewDeviation({ ...newDeviation, action_required: e.target.value })}
                  placeholder="Hva må gjøres for å rette opp avviket?"
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleAddDeviation}
                disabled={!newDeviation.category || !newDeviation.description}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Legg til avvik
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
