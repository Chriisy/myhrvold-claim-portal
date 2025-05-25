
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, X } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';

interface SmartFormAssistantProps {
  formData: any;
  onSuggestion: (field: string, value: any) => void;
}

export const SmartFormAssistant = ({ formData, onSuggestion }: SmartFormAssistantProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { sendMessage } = useAIAssistant();

  useEffect(() => {
    if (formData.description && formData.description.length > 20) {
      generateSuggestions();
    }
  }, [formData.description]);

  const generateSuggestions = async () => {
    const prompt = `Basert på denne reklamsjons-beskrivelsen: "${formData.description}"

Foreslå:
1. Mest sannsynlig kategori (Service, Installasjon, Produkt, Del)
2. Potensielle leverandører hvis du kan gjette fra beskrivelsen
3. Om dette kan være under garanti

Svar kun med JSON format:
{
  "category": "kategori",
  "warranty": true/false,
  "reasoning": "kort begrunnelse"
}`;

    try {
      // Dette er en forenklet versjon - i praksis ville vi kalt AI-tjenesten
      const suggestions = [
        {
          field: 'category',
          value: 'Service',
          reason: 'Basert på beskrivelsen virker dette som et serviceproblem'
        }
      ];
      
      setSuggestions(suggestions);
      setIsVisible(true);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <h3 className="font-medium text-blue-900">Myhrvold Mentor Forslag</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-blue-600 hover:bg-blue-100 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
              <div>
                <p className="text-sm font-medium">{suggestion.field}: {suggestion.value}</p>
                <p className="text-xs text-gray-600">{suggestion.reason}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSuggestion(suggestion.field, suggestion.value)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Bruk forslag
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
