
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Sparkles } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';

interface AIReportGeneratorProps {
  dashboardData?: any;
}

export const AIReportGenerator = ({ dashboardData }: AIReportGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { sendMessage } = useAIAssistant();

  const generateReport = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    const reportPrompt = `Lag en detaljert rapport basert på denne forespørselen: "${prompt}"

Bruk følgende data fra systemet:
${JSON.stringify(dashboardData, null, 2)}

Lag en profesjonell rapport på norsk som inkluderer:
1. Sammendrag
2. Hovedfunn
3. Anbefalinger
4. Konklusjon

Format rapporten med tydelige overskrifter og punktlister.`;

    try {
      // Her ville vi kalt AI-tjenesten
      const mockReport = `# Reklamasjonsrapport

## Sammendrag
Basert på dine data for siste periode viser analysen følgende hovedtrender...

## Hovedfunn
- Totalt antall reklamasjoner: [fra data]
- Mest vanlige kategorier: Service (45%), Produkt (30%)
- Gjennomsnittlig behandlingstid: X dager

## Anbefalinger
1. Fokuser på forebyggende vedlikehold
2. Styrk leverandørkommunikasjon
3. Implementer raskere responstid

## Konklusjon
Systemet viser forbedringspotensial innen...`;

      setGeneratedReport(mockReport);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([generatedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'myhrvold-mentor-rapport.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-myhrvold-primary" />
          Myhrvold Mentor Rapport Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Hva vil du ha rapport om?
          </label>
          <Textarea
            placeholder="Eks: Lag en rapport over reklamasjoner siste 3 måneder med fokus på kostnader og leverandører"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>
        
        <Button 
          onClick={generateReport}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          <FileText className="w-4 h-4 mr-2" />
          {isGenerating ? 'Genererer rapport...' : 'Generer Rapport'}
        </Button>

        {generatedReport && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Generert Rapport</h3>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Last ned
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
              {generatedReport}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
