
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CategorySuggestion {
  category: string;
  confidence: number;
  reason: string;
}

interface SupplierSuggestion {
  supplier_id: string;
  supplier_name: string;
  confidence: number;
  reason: string;
}

interface SmartSuggestions {
  category?: CategorySuggestion;
  supplier?: SupplierSuggestion;
  warranty?: {
    likely: boolean;
    confidence: number;
    reason: string;
  };
  estimatedCost?: {
    min: number;
    max: number;
    confidence: number;
  };
}

// Define proper types for historical data to improve type safety
interface HistoricalClaim {
  id: string;
  category: string | null;
  supplier_id: string | null;
  warranty: boolean | null;
  description: string | null;
  machine_model: string | null;
  part_number: string | null;
  suppliers?: {
    name: string;
  } | null;
}

interface CostRange {
  min: number;
  max: number;
}

interface CategoryKeywords {
  [key: string]: string[];
}

export const useSmartCategorization = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeClaim = async (description: string, machineModel?: string, partNumber?: string): Promise<SmartSuggestions> => {
    if (!description || description.length < 10) {
      return {};
    }

    setIsAnalyzing(true);

    try {
      // Get historical data for pattern matching with proper typing
      const { data: historicalClaims, error } = await supabase
        .from('claims')
        .select('id, category, supplier_id, warranty, description, machine_model, part_number, suppliers(name)')
        .not('category', 'is', null)
        .limit(100);

      if (error) {
        console.error('Error fetching historical claims:', error);
        return {};
      }

      // Type-safe pattern matching with proper fallback
      const suggestions = analyzePatterns(
        description, 
        machineModel, 
        partNumber, 
        historicalClaims as HistoricalClaim[] || []
      );
      
      return suggestions;
    } catch (error) {
      console.error('Error analyzing claim:', error);
      return {};
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeClaim,
    isAnalyzing
  };
};

// Improved pattern matching with proper typing and error handling
function analyzePatterns(
  description: string, 
  machineModel?: string, 
  partNumber?: string, 
  historicalData: HistoricalClaim[] = []
): SmartSuggestions {
  const desc = description.toLowerCase();
  const suggestions: SmartSuggestions = {};

  // Category analysis with type-safe keyword mapping
  const categoryKeywords: CategoryKeywords = {
    'Service': ['service', 'reparasjon', 'vedlikehold', 'feil', 'defekt', 'ødelagt', 'ikke fungerer'],
    'Installasjon': ['installasjon', 'montering', 'oppsett', 'installere', 'montere'],
    'Produkt': ['produkt', 'kvalitet', 'material', 'design', 'spesifikasjon'],
    'Del': ['del', 'komponent', 'reservedel', 'spare', 'delene']
  };

  let bestCategory = '';
  let maxMatches = 0;
  let matchedKeywords: string[] = [];

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => desc.includes(keyword));
    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      bestCategory = category;
      matchedKeywords = matches;
    }
  });

  if (bestCategory && maxMatches > 0) {
    suggestions.category = {
      category: bestCategory,
      confidence: Math.min(90, maxMatches * 30),
      reason: `Fant nøkkelord: ${matchedKeywords.join(', ')}`
    };
  }

  // Warranty analysis with null safety
  const warrantyKeywords = ['garanti', 'warranty', 'ny', 'nytt', 'kjøpt', 'installation'];
  const warrantyMatches = warrantyKeywords.filter(keyword => desc.includes(keyword));
  
  if (warrantyMatches.length > 0) {
    suggestions.warranty = {
      likely: true,
      confidence: Math.min(85, warrantyMatches.length * 40),
      reason: `Mulig garanti basert på: ${warrantyMatches.join(', ')}`
    };
  }

  // Supplier suggestion with proper null checking and type safety
  if (machineModel && historicalData.length > 0) {
    const machineSpecificClaims = historicalData.filter(claim => 
      claim.machine_model && 
      claim.machine_model.toLowerCase().includes(machineModel.toLowerCase())
    );

    if (machineSpecificClaims.length > 0) {
      // Find most common supplier for this machine type with proper type checking
      const supplierCounts = machineSpecificClaims.reduce((acc, claim) => {
        if (claim.supplier_id) {
          acc[claim.supplier_id] = (acc[claim.supplier_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topSupplier = Object.entries(supplierCounts)
        .sort(([,a], [,b]) => b - a)[0];

      if (topSupplier) {
        const supplierData = machineSpecificClaims.find(c => c.supplier_id === topSupplier[0]);
        const supplierCount = topSupplier[1];
        const totalClaims = machineSpecificClaims.length;
        
        suggestions.supplier = {
          supplier_id: topSupplier[0],
          supplier_name: supplierData?.suppliers?.name || 'Ukjent',
          confidence: Math.min(80, (supplierCount / totalClaims) * 100),
          reason: `Vanligste leverandør for ${machineModel} (${supplierCount} av ${totalClaims} tilfeller)`
        };
      }
    }
  }

  // Cost estimation with type-safe range mapping
  if (suggestions.category) {
    const categorySpecificClaims = historicalData.filter(claim => 
      claim.category === suggestions.category!.category
    );

    if (categorySpecificClaims.length > 0) {
      // Type-safe cost ranges
      const costRanges: Record<string, CostRange> = {
        'Service': { min: 2000, max: 15000 },
        'Installasjon': { min: 5000, max: 25000 },
        'Produkt': { min: 1000, max: 50000 },
        'Del': { min: 500, max: 8000 }
      };

      const range = costRanges[suggestions.category.category];
      if (range) {
        suggestions.estimatedCost = {
          min: range.min,
          max: range.max,
          confidence: 65,
        };
      }
    }
  }

  return suggestions;
}
