
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, FileText } from 'lucide-react';
import { useState } from 'react';

export const AIReportSection = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI report generation
    setTimeout(() => {
      const mockReport = `# Automatisk Generert Rapport

## Sammendrag
Basert på din forespørsel: "${prompt}"

## Hovedfunn
- Analysen viser tydelige trender i dataene
- Viktige områder for forbedring er identifisert
- Anbefalte tiltak er listet nedenfor

## Anbefalinger
1. Øk fokus på forebyggende vedlikehold
2. Implementer bedre leverandørkommunikasjon
3. Reduser gjennomsnittlig responstid

## Konklusjon
Rapporten indikerer muligheter for betydelige forbedringer.`;

      setGeneratedReport(mockReport);
      setIsGenerating(false);
    }, 2000);
  };

  const downloadReport = () => {
    const blob = new Blob([generatedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-generert-rapport.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-myhrvold-primary" strokeWidth={2} />
          AI Rapport Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Beskriv hvilken rapport du ønsker
          </label>
          <Textarea
            placeholder="Eksempel: Lag en sammendrag av reklamasjoner siste 3 måneder med fokus på kostnader og leverandører..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        
        <Button 
          onClick={generateReport}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          <FileText className="w-4 h-4 mr-2" strokeWidth={2} />
          {isGenerating ? 'Genererer rapport...' : 'Generer Rapport'}
        </Button>

        {generatedReport && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Generert Rapport</h3>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="w-4 h-4 mr-2" strokeWidth={2} />
                Last ned
              </Button>
            </div>
            <div 
              className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-80 overflow-y-auto border resize-y min-h-[200px]"
              style={{ resize: 'vertical' }}
            >
              {generatedReport}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
