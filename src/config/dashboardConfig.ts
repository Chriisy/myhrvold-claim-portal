
export interface KpiDefinition {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  format: 'currency' | 'number' | 'percentage';
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    key: 'totalCosts',
    title: 'Total Kostnader',
    description: 'Totale kostnader for valgt periode',
    icon: 'TrendingUp',
    color: 'blue',
    format: 'currency'
  },
  {
    key: 'totalClaims',
    title: 'Antall Reklamasjoner',
    description: 'Totalt antall reklamasjoner',
    icon: 'FileText',
    color: 'green',
    format: 'number'
  },
  {
    key: 'averageCost',
    title: 'Snitt Kostnad',
    description: 'Gjennomsnittlig kostnad per reklamasjon',
    icon: 'Calculator',
    color: 'orange',
    format: 'currency'
  },
  {
    key: 'closedClaims',
    title: 'Lukkede Reklamasjoner',
    description: 'Antall lukkede reklamasjoner',
    icon: 'CheckCircle',
    color: 'purple',
    format: 'number'
  }
];

export const CHART_DEFINITIONS = {
  stackedBar: {
    title: 'Kostnader per Konto',
    description: 'Månedlig oversikt over kostnader fordelt på kontoer',
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  },
  supplierDistribution: {
    title: 'Leverandørfordeling',
    description: 'Prosentvis fordeling av kostnader per leverandør',
    refreshInterval: 10 * 60 * 1000 // 10 minutes
  },
  rootCause: {
    title: 'Årsaksanalyse',
    description: 'Fordeling av reklamasjoner etter rotårsak',
    refreshInterval: 15 * 60 * 1000 // 15 minutes
  },
  recentClaims: {
    title: 'Siste Reklamasjoner',
    description: 'Oversikt over nyeste reklamasjoner',
    refreshInterval: 2 * 60 * 1000 // 2 minutes
  }
};
