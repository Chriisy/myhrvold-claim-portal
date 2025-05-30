
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const sendMessage = async (message: string, context?: any) => {
    setIsLoading(true);
    
    // Add user message to history
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // This is a mock implementation - in a real app you'd call your AI service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantResponse = `Mock respons for: ${message}`;
      
      // Add assistant response to history
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: 'AI Assistent',
        description: 'Forespørsel behandlet (mock implementering)',
      });
      
      return assistantResponse;
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

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    sendMessage,
    isLoading,
    messages,
    clearMessages
  };
};
