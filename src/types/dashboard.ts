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
