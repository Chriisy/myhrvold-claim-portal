
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { ReportType, ReportFormat } from '@/services/reports/reportService';

interface ReportTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  reportType: ReportType;
  dateRange: { start: Date; end: Date };
}

export const ReportTypeCard = ({ 
  title, 
  description, 
  icon, 
  reportType, 
  dateRange 
}: ReportTypeCardProps) => {
  const { generateReport, isGenerating } = useReports();

  const handleDownload = async (format: ReportFormat) => {
    await generateReport(reportType, format, dateRange);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('csv')}
            disabled={isGenerating}
          >
            <FileText className="w-4 h-4 mr-1" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('pdf')}
            disabled={isGenerating}
          >
            <Download className="w-4 h-4 mr-1" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
