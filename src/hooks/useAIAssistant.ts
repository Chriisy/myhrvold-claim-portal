
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    
    try {
      // This is a mock implementation - in a real app you'd call your AI service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'AI Assistent',
        description: 'Forespørsel behandlet (mock implementering)',
      });
      
      return `Mock respons for: ${message}`;
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke kontakte AI-assistenten',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
};
