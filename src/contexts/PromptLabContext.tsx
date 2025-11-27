import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface PromptLabContextType {
  assistantMessages: Message[];
  optimizerMessages: Message[];
  addAssistantMessage: (message: Message) => void;
  addOptimizerMessage: (message: Message) => void;
  addMessageToBoth: (message: Message) => void;
  clearMessages: () => void;
}

const PromptLabContext = createContext<PromptLabContextType | undefined>(undefined);

export const PromptLabProvider = ({ children }: { children: ReactNode }) => {
  const [assistantMessages, setAssistantMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I can help you create prompts and generate content. What would you like to create today?' }
  ]);
  
  const [optimizerMessages, setOptimizerMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I optimize your prompts to get better results. Share your prompt and I\'ll enhance it.' }
  ]);

  const addAssistantMessage = (message: Message) => {
    setAssistantMessages(prev => {
      // If it's an assistant message and the last message is also assistant, replace it
      if (message.role === 'assistant' && prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
        return [...prev.slice(0, -1), message];
      }
      return [...prev, message];
    });
  };

  const addOptimizerMessage = (message: Message) => {
    setOptimizerMessages(prev => {
      // If it's an assistant message and the last message is also assistant, replace it
      if (message.role === 'assistant' && prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
        return [...prev.slice(0, -1), message];
      }
      return [...prev, message];
    });
  };

  const addMessageToBoth = (message: Message) => {
    setAssistantMessages(prev => [...prev, message]);
    setOptimizerMessages(prev => [...prev, message]);
  };

  const clearMessages = () => {
    setAssistantMessages([{ role: 'assistant', content: 'Hello! I can help you create prompts and generate content. What would you like to create today?' }]);
    setOptimizerMessages([{ role: 'assistant', content: 'Hi! I optimize your prompts to get better results. Share your prompt and I\'ll enhance it.' }]);
  };

  return (
    <PromptLabContext.Provider value={{
      assistantMessages,
      optimizerMessages,
      addAssistantMessage,
      addOptimizerMessage,
      addMessageToBoth,
      clearMessages
    }}>
      {children}
    </PromptLabContext.Provider>
  );
};

export const usePromptLab = () => {
  const context = useContext(PromptLabContext);
  if (!context) {
    throw new Error('usePromptLab must be used within PromptLabProvider');
  }
  return context;
};
