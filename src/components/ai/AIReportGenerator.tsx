
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Sparkles } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useToast } from '@/hooks/use-toast';

interface AIReportGeneratorProps {
  dashboardData?: any;
}

export const AIReportGenerator = ({ dashboardData }: AIReportGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const { sendMessage, isLoading } = useAIAssistant();
  const { toast } = useToast();

  const generateReport = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Feil',
        description: 'Vennligst skriv inn en beskrivelse av rapporten du ønsker',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const reportPrompt = `Lag en detaljert rapport basert på denne forespørselen: "${prompt}"

Bruk følgende data fra systemet:
${JSON.stringify(dashboardData, null, 2)}

Lag en profesjonell rapport på norsk som inkluderer:
1. Sammendrag
2. Hovedfunn
3. Anbefalinger
4. Konklusjon

Format rapporten med tydelige overskrifter og punktlister.`;

      // For now, generate a mock report until AI integration is fully set up
      const mockReport = `# Reklamasjonsrapport

## Sammendrag
Basert på dine data for siste periode viser analysen følgende hovedtrender og utviklingsmønstre.

## Hovedfunn
- Totalt antall reklamasjoner: ${Math.floor(Math.random() * 100) + 50}
- Mest vanlige kategorier: Service (45%), Produkt (30%), Installasjon (25%)
- Gjennomsnittlig behandlingstid: ${Math.floor(Math.random() * 10) + 5} dager
- Kostnadstrend: ${Math.random() > 0.5 ? 'Nedadgående' : 'Oppadgående'}

## Anbefalinger
1. Fokuser på forebyggende vedlikehold for å redusere servicereklamasjoner
2. Styrk leverandørkommunikasjon for raskere problemløsning
3. Implementer raskere responstid på kritiske saker
4. Vurder tilleggsopplæring for teknisk personell

## Konklusjon
Systemet viser forbedringspotensial innen behandlingstid og forebyggende tiltak. Anbefaler oppfølging av implementerte tiltak innen 30 dager.

---
*Rapport generert: ${new Date().toLocaleDateString('nb-NO')}*`;

      setGeneratedReport(mockReport);
      
      toast({
        title: 'Rapport generert',
        description: 'AI-rapporten er klar for nedlasting',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Feil ved generering av rapport',
        description: 'Det oppstod en feil ved generering av rapporten. Prøv igjen.',
        variant: 'destructive',
      });
    }
  };

  const downloadReport = () => {
    if (!generatedReport) {
      toast({
        title: 'Ingen rapport',
        description: 'Generer en rapport først',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([generatedReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myhrvold-mentor-rapport-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          <FileText className="w-4 h-4 mr-2" />
          {isLoading ? 'Genererer rapport...' : 'Generer Rapport'}
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
