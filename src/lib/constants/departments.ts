
import { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Enums']['department'];

export interface DepartmentOption {
  value: Department;
  label: string;
}

export const departmentOptions: DepartmentOption[] = [
  { value: 'oslo', label: 'Oslo' },
  { value: 'bergen', label: 'Bergen' },
  { value: 'trondheim', label: 'Trondheim' },
  { value: 'kristiansand', label: 'Kristiansand' },
  { value: 'sornorge', label: 'Sør-Norge' },
  { value: 'nord', label: 'Nord' },
];

export const getDepartmentLabel = (value: Department | string): string => {
  const option = departmentOptions.find(dept => dept.value === value);
  return option?.label || value || 'Ikke angitt';
};
