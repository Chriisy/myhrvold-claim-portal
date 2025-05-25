
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SystemContext {
  currentPage?: string;
  userRole?: string;
  recentClaims?: any[];
  dashboardData?: any;
}

export function useAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hei! Jeg er din AI-assistent for Myhrvold reklamasjonssystem. Hvordan kan jeg hjelpe deg i dag?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (userMessage: string, context?: SystemContext) => {
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const conversationMessages = [...messages, newUserMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages: conversationMessages,
          context
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        title: "AI-Assistent Feil",
        description: "Kunne ikke få svar fra AI-assistenten. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([{
      role: 'assistant',
      content: 'Hei! Jeg er din AI-assistent for Myhrvold reklamasjonssystem. Hvordan kan jeg hjelpe deg i dag?',
      timestamp: new Date()
    }]);
  };

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading
  };
}
