
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, X, Calendar, User, CheckCircle } from 'lucide-react';
import { useEditClaim } from '@/hooks/useEditClaim';
import { usePermissions } from '@/hooks/usePermissions';
import { useTechnicians } from '@/hooks/useTechnicians';
import { Database } from '@/integrations/supabase/types';

type ActionStatus = Database['public']['Enums']['action_status'];

interface ClaimData {
  id: string;
  status?: string;
  created_by?: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  action_owner?: string;
  action_due_date?: string;
  action_status?: ActionStatus;
  action_completed_at?: string;
  action_effectiveness?: string;
}

interface ImprovementTabProps {
  claim: ClaimData;
}

const actionStatusOptions = [
  { value: 'Planlagt', label: 'Planlagt', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Pågår', label: 'Pågår', color: 'bg-blue-100 text-blue-800' },
  { value: 'Ferdig', label: 'Ferdig', color: 'bg-green-100 text-green-800' },
];

export function ImprovementTab({ claim }: ImprovementTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(claim);
  const editClaim = useEditClaim();
  const { canEditAllClaims, canEditOwnClaims, user } = usePermissions();
  const { data: technicians } = useTechnicians();

  const canEdit = canEditAllClaims() || (canEditOwnClaims() && claim.created_by === user?.id);

  const handleSave = async () => {
    const updateData = {
      id: formData.id,
      root_cause: formData.root_cause || null,
      corrective_action: formData.corrective_action || null,
      preventive_action: formData.preventive_action || null,
      action_owner: formData.action_owner || null,
      action_due_date: formData.action_due_date || null,
      action_status: formData.action_status || 'Planlagt',
      action_completed_at: formData.action_status === 'Ferdig' ? formData.action_completed_at || new Date().toISOString() : null,
      action_effectiveness: formData.action_effectiveness || null,
    };
    
    console.log('ImprovementTab handleSave - Final updateData:', updateData);
    
    await editClaim.mutateAsync(updateData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(claim);
    setIsEditing(false);
  };

  const getStatusBadgeColor = (status?: ActionStatus) => {
    const option = actionStatusOptions.find(opt => opt.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Tiltak & Forbedring
          </CardTitle>
          {!isEditing && canEdit ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Rediger
            </Button>
          ) : isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Avbryt
              </Button>
              <Button onClick={handleSave} disabled={editClaim.isPending}>
                {editClaim.isPending ? 'Lagrer...' : 'Lagre'}
              </Button>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-6">
            {/* View Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Analyse
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm text-gray-600">Rotårsak:</span>
                      <p className="text-gray-900 mt-1">{claim.root_cause || 'Ikke angitt'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tiltak</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm text-gray-600">Korrigerende tiltak:</span>
                      <p className="text-gray-900 mt-1">{claim.corrective_action || 'Ikke angitt'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-600">Forebyggende tiltak:</span>
                      <p className="text-gray-900 mt-1">{claim.preventive_action || 'Ikke angitt'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Oppfølging
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(claim.action_status)}`}>
                        {claim.action_status || 'Planlagt'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-600">Ansvarlig:</span>
                      <p className="text-gray-900 mt-1">
                        {technicians?.find(t => t.id === claim.action_owner)?.name || 'Ikke tildelt'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-600">Frist:</span>
                      <p className="text-gray-900 mt-1">
                        {claim.action_due_date ? new Date(claim.action_due_date).toLocaleDateString('nb-NO') : 'Ikke satt'}
                      </p>
                    </div>
                    {claim.action_status === 'Ferdig' && (
                      <>
                        <div>
                          <span className="font-medium text-sm text-gray-600">Fullført:</span>
                          <p className="text-gray-900 mt-1">
                            {claim.action_completed_at ? new Date(claim.action_completed_at).toLocaleDateString('nb-NO') : 'Ikke angitt'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-sm text-gray-600">Effektkontroll:</span>
                          <p className="text-gray-900 mt-1">{claim.action_effectiveness || 'Ikke angitt'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Edit Mode */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="root_cause">Rotårsak</Label>
                <Textarea
                  id="root_cause"
                  value={formData.root_cause || ''}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  placeholder="Beskriv rotårsaken til problemet..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="corrective_action">Korrigerende tiltak</Label>
                <Textarea
                  id="corrective_action"
                  value={formData.corrective_action || ''}
                  onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                  placeholder="Beskriv korrigerende tiltak som er iverksatt..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="preventive_action">Forebyggende tiltak</Label>
                <Textarea
                  id="preventive_action"
                  value={formData.preventive_action || ''}
                  onChange={(e) => setFormData({ ...formData, preventive_action: e.target.value })}
                  placeholder="Beskriv forebyggende tiltak for å unngå lignende problemer..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="action_owner">Ansvarlig</Label>
                  <Select 
                    value={formData.action_owner || ''} 
                    onValueChange={(value) => setFormData({ ...formData, action_owner: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg ansvarlig person" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians?.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="action_due_date">Frist</Label>
                  <Input
                    id="action_due_date"
                    type="date"
                    value={formData.action_due_date || ''}
                    onChange={(e) => setFormData({ ...formData, action_due_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="action_status">Tiltaksstatus</Label>
                <Select 
                  value={formData.action_status || 'Planlagt'} 
                  onValueChange={(value: ActionStatus) => setFormData({ ...formData, action_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg status" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.action_status === 'Ferdig' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="action_completed_at">Fullført dato</Label>
                    <Input
                      id="action_completed_at"
                      type="date"
                      value={formData.action_completed_at ? formData.action_completed_at.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, action_completed_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="action_effectiveness">Effektkontroll / Kommentar</Label>
                    <Textarea
                      id="action_effectiveness"
                      value={formData.action_effectiveness || ''}
                      onChange={(e) => setFormData({ ...formData, action_effectiveness: e.target.value })}
                      placeholder="Beskriv effekten av tiltaket og eventuelle oppfølgingskommentarer..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
