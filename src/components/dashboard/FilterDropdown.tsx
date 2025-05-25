
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

export const FilterDropdown = ({ label, value, options, onSelect, placeholder = "Velg..." }: FilterDropdownProps) => {
  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {selectedLabel}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px] bg-white">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSelect(option.value)}
              className="cursor-pointer"
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
</DropdownMenuTrigger>
</DropdownMenu>
```
</DropdownMenuContent>

<lov-write file_path="src/types/dashboard.ts">
export interface DashboardFilters {
  supplier_id?: string;
  machine_model?: string;
  konto_nr?: number;
  technician_id?: string;
  date_range: {
    start: Date;
    end: Date;
  };
}

export interface TrendData {
  percentage: number;
  direction: 'up' | 'down' | 'stable';
}

export interface KpiData {
  newClaims: number;
  openClaims: number;
  overdueClaims: number;
  closedThisMonth: number;
  totalWarrantyCost: number;
  avgLeadTime: number;
  trends: {
    newClaims: TrendData;
    openClaims: TrendData;
    overdueClaims: TrendData;
    closedThisMonth: TrendData;
    totalWarrantyCost: TrendData;
    avgLeadTime: TrendData;
  };
}

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

export interface StackedBarData {
  month: string;
  [key: string]: string | number;
}

export interface SupplierDistributionData {
  name: string;
  value: number;
  amount: number;
  color: string;
}

export interface RecentClaimData {
  id: string;
  created_at: string;
  customer_name: string;
  machine_model: string;
  status: string;
  supplier_id: string;
  technician_id: string;
  suppliers?: { name: string } | null;
  technician?: { name: string } | null;
  totalCost: number;
}

export interface CostByAccountData {
  account: number;
  amount: number;
  accountName?: string;
  displayName?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}
