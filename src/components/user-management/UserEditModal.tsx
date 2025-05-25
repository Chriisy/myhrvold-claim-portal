
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateUserRole, useUpdateUserPermissions, UserWithPermissions } from '@/hooks/useUsers';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
type Department = Database['public']['Enums']['department'];
type PermissionType = Database['public']['Enums']['permission_type'];

interface UserEditModalProps {
  user: UserWithPermissions | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'saksbehandler', label: 'Saksbehandler' },
  { value: 'tekniker', label: 'Tekniker' },
  { value: 'avdelingsleder', label: 'Avdelingsleder' },
];

const departmentOptions: { value: Department; label: string }[] = [
  { value: 'oslo', label: 'Oslo' },
  { value: 'bergen', label: 'Bergen' },
  { value: 'trondheim', label: 'Trondheim' },
  { value: 'kristiansand', label: 'Kristiansand' },
  { value: 'sornorge', label: 'Sør-Norge' },
  { value: 'nord', label: 'Nord' },
];

const permissionOptions: { value: PermissionType; label: string; description: string }[] = [
  { value: 'view_all_claims', label: 'Se alle reklamasjoner', description: 'Kan se alle reklamasjoner i systemet' },
  { value: 'edit_all_claims', label: 'Redigere alle reklamasjoner', description: 'Kan redigere alle reklamasjoner' },
  { value: 'delete_claims', label: 'Slette reklamasjoner', description: 'Kan slette reklamasjoner' },
  { value: 'manage_users', label: 'Administrere brukere', description: 'Kan administrere brukere og roller' },
  { value: 'view_reports', label: 'Se rapporter', description: 'Kan se rapporter og statistikk' },
  { value: 'approve_claims', label: 'Godkjenne reklamasjoner', description: 'Kan godkjenne/avslå reklamasjoner' },
  { value: 'view_department_claims', label: 'Se avdelingsreklamasjoner', description: 'Kan se reklamasjoner for egen avdeling' },
  { value: 'edit_own_claims', label: 'Redigere egne reklamasjoner', description: 'Kan redigere egne reklamasjoner' },
  { value: 'create_claims', label: 'Opprette reklamasjoner', description: 'Kan opprette nye reklamasjoner' },
];

export function UserEditModal({ user, open, onOpenChange }: UserEditModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('tekniker');
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('oslo');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>([]);

  const updateUserRole = useUpdateUserRole();
  const updateUserPermissions = useUpdateUserPermissions();

  useEffect(() => {
    if (user) {
      setSelectedRole(user.user_role);
      setSelectedDepartment(user.department);
      setSelectedPermissions(user.permissions || []);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      // Update role and department
      await updateUserRole.mutateAsync({
        userId: user.id,
        role: selectedRole,
        department: selectedDepartment,
      });

      // Update permissions
      await updateUserPermissions.mutateAsync({
        userId: user.id,
        permissions: selectedPermissions,
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

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger bruker: {user.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <Label className="text-base font-semibold">Tillatelser</Label>
            <p className="text-sm text-gray-600 mb-4">
              Velg spesifikke tillatelser for denne brukeren. Admin-rollen har automatisk alle tillatelser.
            </p>
            <div className="space-y-3">
              {permissionOptions.map(permission => (
                <div key={permission.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={permission.value}
                    checked={selectedPermissions.includes(permission.value)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission.value, checked as boolean)
                    }
                    disabled={selectedRole === 'admin'}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={permission.value} 
                      className="text-sm font-medium cursor-pointer"
                    >
                      {permission.label}
                    </Label>
                    <p className="text-xs text-gray-500">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateUserRole.isPending || updateUserPermissions.isPending}
            >
              {updateUserRole.isPending || updateUserPermissions.isPending ? 'Lagrer...' : 'Lagre endringer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
