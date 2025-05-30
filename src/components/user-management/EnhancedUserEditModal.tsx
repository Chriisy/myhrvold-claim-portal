
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpdateUserRole, useUpdateUserPermissions, UserWithPermissions } from '@/hooks/useUsers';
import { useCreateAuditLog } from '@/hooks/useAuditLog';
import { Database } from '@/integrations/supabase/types';
import { departmentOptions } from '@/lib/constants/departments';
import { AlertCircle, Save, X } from 'lucide-react';

type UserRole = Database['public']['Enums']['user_role'];
type Department = Database['public']['Enums']['department'];
type PermissionType = Database['public']['Enums']['permission_type'];

interface EnhancedUserEditModalProps {
  user: UserWithPermissions | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { 
    value: 'admin', 
    label: 'Administrator', 
    description: 'Full tilgang til alle funksjoner og brukere' 
  },
  { 
    value: 'saksbehandler', 
    label: 'Saksbehandler', 
    description: 'Kan behandle og godkjenne reklamasjoner' 
  },
  { 
    value: 'tekniker', 
    label: 'Tekniker', 
    description: 'Kan opprette og redigere egne reklamasjoner' 
  },
  { 
    value: 'avdelingsleder', 
    label: 'Avdelingsleder', 
    description: 'Kan se rapporter og avdelingsdata' 
  },
];

const permissionOptions: { value: PermissionType; label: string; description: string; category: string }[] = [
  // Reklamasjoner
  { value: 'view_all_claims', label: 'Se alle reklamasjoner', description: 'Kan se alle reklamasjoner i systemet', category: 'Reklamasjoner' },
  { value: 'edit_all_claims', label: 'Redigere alle reklamasjoner', description: 'Kan redigere alle reklamasjoner', category: 'Reklamasjoner' },
  { value: 'delete_claims', label: 'Slette reklamasjoner', description: 'Kan slette reklamasjoner', category: 'Reklamasjoner' },
  { value: 'approve_claims', label: 'Godkjenne reklamasjoner', description: 'Kan godkjenne/avslå reklamasjoner', category: 'Reklamasjoner' },
  { value: 'view_department_claims', label: 'Se avdelingsreklamasjoner', description: 'Kan se reklamasjoner for egen avdeling', category: 'Reklamasjoner' },
  { value: 'edit_own_claims', label: 'Redigere egne reklamasjoner', description: 'Kan redigere egne reklamasjoner', category: 'Reklamasjoner' },
  { value: 'create_claims', label: 'Opprette reklamasjoner', description: 'Kan opprette nye reklamasjoner', category: 'Reklamasjoner' },
  
  // Administrasjon
  { value: 'manage_users', label: 'Administrere brukere', description: 'Kan administrere brukere og roller', category: 'Administrasjon' },
  { value: 'view_reports', label: 'Se rapporter', description: 'Kan se rapporter og statistikk', category: 'Administrasjon' },
  
  // Installasjoner
  { value: 'view_installations', label: 'Se installasjoner', description: 'Kan se installasjonsprosjekter', category: 'Installasjoner' },
  { value: 'manage_installations', label: 'Administrere installasjoner', description: 'Kan opprette og redigere installasjonsprosjekter', category: 'Installasjoner' },
  
  // Leverandører
  { value: 'view_suppliers', label: 'Se leverandører', description: 'Kan se leverandørinformasjon', category: 'Leverandører' },
  { value: 'manage_suppliers', label: 'Administrere leverandører', description: 'Kan legge til og redigere leverandører', category: 'Leverandører' },
  
  // F-gass sertifikater
  { value: 'view_certificates', label: 'Se sertifikater', description: 'Kan se F-gass sertifikater', category: 'Sertifikater' },
  { value: 'manage_certificates', label: 'Administrere sertifikater', description: 'Kan legge til og redigere F-gass sertifikater', category: 'Sertifikater' },
  
  // Import/Export
  { value: 'import_data', label: 'Importere data', description: 'Kan importere fakturaer og annen data', category: 'Import/Export' },
  { value: 'export_data', label: 'Eksportere data', description: 'Kan eksportere data og rapporter', category: 'Import/Export' },
];

const groupedPermissions = permissionOptions.reduce((acc, permission) => {
  if (!acc[permission.category]) {
    acc[permission.category] = [];
  }
  acc[permission.category].push(permission);
  return acc;
}, {} as Record<string, typeof permissionOptions>);

export function EnhancedUserEditModal({ user, open, onOpenChange }: EnhancedUserEditModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('tekniker');
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('oslo');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>([]);
  const [sellerNo, setSellerNo] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  const updateUserRole = useUpdateUserRole();
  const updateUserPermissions = useUpdateUserPermissions();
  const createAuditLog = useCreateAuditLog();

  useEffect(() => {
    if (user) {
      setSelectedRole(user.user_role);
      setSelectedDepartment(user.department);
      setSelectedPermissions(user.permissions || []);
      setSellerNo(user.seller_no?.toString() || '');
      setHasChanges(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const roleChanged = selectedRole !== user.user_role;
      const departmentChanged = selectedDepartment !== user.department;
      const permissionsChanged = JSON.stringify(selectedPermissions.sort()) !== JSON.stringify((user.permissions || []).sort());
      const sellerNoChanged = sellerNo !== (user.seller_no?.toString() || '');
      
      setHasChanges(roleChanged || departmentChanged || permissionsChanged || sellerNoChanged);
    }
  }, [selectedRole, selectedDepartment, selectedPermissions, sellerNo, user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const oldValues = {
        role: user.user_role,
        department: user.department,
        permissions: user.permissions,
        seller_no: user.seller_no,
      };

      const newValues = {
        role: selectedRole,
        department: selectedDepartment,
        permissions: selectedPermissions,
        seller_no: sellerNo ? parseInt(sellerNo) : null,
      };

      // Update role, department and seller_no
      await updateUserRole.mutateAsync({
        userId: user.id,
        role: selectedRole,
        department: selectedDepartment,
        sellerNo: sellerNo ? parseInt(sellerNo) : undefined,
      });

      // Update permissions
      await updateUserPermissions.mutateAsync({
        userId: user.id,
        permissions: selectedPermissions,
      });

      // Create audit log
      await createAuditLog.mutateAsync({
        action: 'update_user',
        tableName: 'users',
        recordId: user.id,
        oldValues,
        newValues,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handlePermissionChange = (permission: PermissionType, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const selectedRoleOption = roleOptions.find(r => r.value === selectedRole);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Rediger bruker: {user.name}
            {hasChanges && (
              <span className="text-sm text-orange-600 font-normal">• Har ulagrede endringer</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grunnleggende informasjon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="role">Rolle</Label>
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRoleOption && (
                <p className="text-xs text-gray-500 mt-1">{selectedRoleOption.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="department">Avdeling</Label>
              <Select value={selectedDepartment} onValueChange={(value: Department) => setSelectedDepartment(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sellerNo">Selger Nr. (valgfritt)</Label>
              <Input
                id="sellerNo"
                type="number"
                value={sellerNo}
                onChange={(e) => setSellerNo(e.target.value)}
                placeholder="F.eks. 123"
              />
            </div>
          </div>

          <Separator />

          {/* Admin-varsel */}
          {selectedRole === 'admin' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Administratorer har automatisk alle tillatelser i systemet, uavhengig av hva som er valgt nedenfor.
              </AlertDescription>
            </Alert>
          )}

          {/* Tillatelser */}
          <div>
            <Label className="text-base font-semibold">Spesifikke tillatelser</Label>
            <p className="text-sm text-gray-600 mb-4">
              Velg spesifikke tillatelser for denne brukeren. Dette gir mer granulær kontroll utover standard rolle-tillatelser.
            </p>
            
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category} className="mb-6">
                <h4 className="font-medium text-sm text-gray-700 mb-3 border-b pb-1">{category}</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {permissions.map(permission => (
                    <div key={permission.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={permission.value}
                        checked={selectedPermissions.includes(permission.value)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.value, checked as boolean)
                        }
                        disabled={selectedRole === 'admin'}
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={permission.value} 
                          className="text-sm font-medium cursor-pointer leading-5"
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-gray-500 mt-1 leading-4">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Handlinger */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-500">
              Sist oppdatert: {new Date(user.created_at).toLocaleDateString('nb-NO')}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                Avbryt
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || updateUserRole.isPending || updateUserPermissions.isPending}
                className="min-w-[120px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateUserRole.isPending || updateUserPermissions.isPending ? 'Lagrer...' : 'Lagre endringer'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
