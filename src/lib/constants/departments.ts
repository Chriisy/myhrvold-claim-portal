
import { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Enums']['department'];

export const departmentOptions: Array<{ value: Department; label: string }> = [
  { value: 'oslo', label: 'Oslo' },
  { value: 'bergen', label: 'Bergen' },
  { value: 'trondheim', label: 'Trondheim' },
  { value: 'kristiansand', label: 'Kristiansand' },
  { value: 'sornorge', label: 'Sørnorge' },
  { value: 'nord', label: 'Nord' },
];

export const getDepartmentLabel = (department?: Department): string => {
  const option = departmentOptions.find(opt => opt.value === department);
  return option?.label || 'Ukjent avdeling';
};
