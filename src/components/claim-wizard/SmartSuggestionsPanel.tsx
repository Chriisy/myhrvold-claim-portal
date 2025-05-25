
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useSmartCategorization } from '@/hooks/useSmartCategorization';

interface SmartSuggestionsPanelProps {
  description: string;
  machineModel?: string;
  partNumber?: string;
  onApplySuggestion: (field: string, value: any) => void;
  currentValues: {
    category?: string;
    supplier_id?: string;
    warranty?: boolean;
  };
}

export const SmartSuggestionsPanel = ({
  description,
  machineModel,
  partNumber,
  onApplySuggestion,
  currentValues
}: SmartSuggestionsPanelProps) => {
  const [suggestions, setSuggestions] = useState<any>({});
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const { analyzeClaim, isAnalyzing } = useSmartCategorization();

  useEffect(() => {
    if (description && description.length > 10) {
      const timer = setTimeout(async () => {
        const newSuggestions = await analyzeClaim(description, machineModel, partNumber);
        setSuggestions(newSuggestions);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timer);
    }
  }, [description, machineModel, partNumber, analyzeClaim]);

  const handleApplySuggestion = (field: string, value: any) => {
    onApplySuggestion(field, value);
    setAppliedSuggestions(prev => new Set([...prev, field]));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isAnalyzing && Object.keys(suggestions).length === 0) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="w-4 h-4 animate-spin" />
            <span className="text-sm">Myhrvold Mentor analyserer...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(suggestions).length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Lightbulb className="w-5 h-5" />
          Myhrvold Mentor Forslag
          <Badge variant="secondary" className="ml-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            Smart AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {suggestions.category && !appliedSuggestions.has('category') && (
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">Kategori:</span>
                  <Badge className={getConfidenceColor(suggestions.category.confidence)}>
                    {suggestions.category.confidence}% sikker
                  </Badge>
                </div>
                <p className="text-lg font-semibold text-blue-900">
                  {suggestions.category.category}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {suggestions.category.reason}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleApplySuggestion('category', suggestions.category.category)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Bruk
              </Button>
            </div>
          </div>
        )}

        {suggestions.supplier && !appliedSuggestions.has('supplier_id') && (
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">Leverandør:</span>
                  <Badge className={getConfidenceColor(suggestions.supplier.confidence)}>
                    {suggestions.supplier.confidence}% sikker
                  </Badge>
                </div>
                <p className="text-lg font-semibold text-blue-900">
                  {suggestions.supplier.supplier_name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {suggestions.supplier.reason}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleApplySuggestion('supplier_id', suggestions.supplier.supplier_id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Bruk
              </Button>
            </div>
          </div>
        )}

        {suggestions.warranty && !appliedSuggestions.has('warranty') && (
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">Garanti:</span>
                  <Badge className={getConfidenceColor(suggestions.warranty.confidence)}>
                    {suggestions.warranty.confidence}% sikker
                  </Badge>
                </div>
                <p className="text-lg font-semibold text-blue-900">
                  {suggestions.warranty.likely ? 'Sannsynlig under garanti' : 'Ikke under garanti'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {suggestions.warranty.reason}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleApplySuggestion('warranty', suggestions.warranty.likely)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Bruk
              </Button>
            </div>
          </div>
        )}

        {suggestions.estimatedCost && (
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">Estimert kostnad:</span>
              <Badge className="bg-orange-100 text-orange-800">
                Estimat
              </Badge>
            </div>
            <p className="text-lg font-semibold text-blue-900">
              {suggestions.estimatedCost.min.toLocaleString()} - {suggestions.estimatedCost.max.toLocaleString()} kr
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Basert på lignende reklamasjoner
            </p>
          </div>
        )}

        {appliedSuggestions.size > 0 && (
          <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
            <CheckCircle className="w-4 h-4" />
            <span>{appliedSuggestions.size} forslag brukt</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
