
import { FileText, DollarSign, Users } from 'lucide-react';
import { ReportTypeCard } from './ReportTypeCard';

interface AvailableReportsProps {
  dateRange: { start: Date; end: Date };
}

export const AvailableReports = ({ dateRange }: AvailableReportsProps) => {
  const reportTypes = [
    {
      title: 'Reklamasjonsrapport',
      description: 'Komplett oversikt over alle reklamasjoner',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      reportType: 'claims' as const
    },
    {
      title: 'Kostnadsrapport',
      description: 'Detaljert kostnadsanalyse per periode',
      icon: <DollarSign className="w-5 h-5 text-green-600" />,
      reportType: 'costs' as const
    },
    {
      title: 'Leverandørrapport',
      description: 'Ytelse og kostnader per leverandør',
      icon: <Users className="w-5 h-5 text-purple-600" />,
      reportType: 'suppliers' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Tilgjengelige Rapporter</h2>
        <p className="text-gray-600">Generer og eksporter rapporter for valgt periode</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <ReportTypeCard
            key={report.reportType}
            title={report.title}
            description={report.description}
            icon={report.icon}
            reportType={report.reportType}
            dateRange={dateRange}
          />
        ))}
      </div>
    </div>
  );
};
