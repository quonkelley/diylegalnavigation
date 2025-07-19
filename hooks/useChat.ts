'use client';

import { useState, useEffect } from 'react';
import { isDemoMode, DEMO_RESPONSES, generateDemoPdf } from '@/lib/demo-mode';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ConversationState {
  currentStep: number;
  formData: Record<string, any>;
  completed: boolean;
  conversationId?: string;
  sessionId?: string;
}

// Generate session ID for new users
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create session ID from localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = localStorage.getItem('legal_navigator_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('legal_navigator_session_id', sessionId);
  }
  return sessionId;
}

// Generate and download PDF
async function generatePdf(formData: Record<string, any>): Promise<void> {
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ formData }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF');
  }

  // Create download link
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Appearance_Form.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [formCompleted, setFormCompleted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session and chat
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);

      const currentSessionId = getSessionId();
      setSessionId(currentSessionId);

      try {
        if (isDemoMode) {
          // Demo mode: show welcome message
          const welcomeResponse = DEMO_RESPONSES[0];
          const aiMessage: Message = {
            id: Date.now().toString(),
            text: `${welcomeResponse.response}\n\n${welcomeResponse.nextQuestion}`,
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages([aiMessage]);
          setConversationState(welcomeResponse.conversationState);
        } else {
          // Production mode: use real API
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: null,
              conversationState: null,
              sessionId: currentSessionId
            }),
          });

          const data = await response.json();
          
          if (data.response) {
            const aiMessage: Message = {
              id: Date.now().toString(),
              text: data.nextQuestion ? `${data.response}\n\n${data.nextQuestion}` : data.response,
              sender: 'ai',
              timestamp: new Date(),
            };
            
            setMessages([aiMessage]);
            setConversationState(data.conversationState);
          }
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: "I'm sorry, there was an error starting our conversation. Please refresh the page and try again.",
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages([errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (isDemoMode) {
        // Demo mode: use pre-scripted responses
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

        const currentStep = conversationState?.currentStep || 0;
        let nextStep = currentStep;

        // Handle user input and advance to next step
        if (currentStep < 9) {
          nextStep = currentStep + 1;
        } else if (text.toLowerCase().includes('yes')) {
          nextStep = 10; // PDF generation
        }

        const demoResponse = DEMO_RESPONSES[nextStep];

        if (demoResponse) {
          // Create AI response message
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: demoResponse.response,
            sender: 'ai',
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, aiMessage]);
          setConversationState(demoResponse.conversationState);

          // Handle form completion
          if (demoResponse.formCompleted) {
            setFormCompleted(true);
          }

          // Handle PDF generation
          if (demoResponse.generatePdf) {
            setTimeout(() => {
              generateDemoPdf();
              const pdfMessage: Message = {
                id: (Date.now() + 2).toString(),
                text: "Your PDF has been generated and downloaded! This is a demo version. In the full application, this would be customized with your specific information.",
                sender: 'ai',
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, pdfMessage]);
            }, 2000);
          }
        }
      } else {
        // Production mode: use real API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text.trim(),
            conversationState: conversationState,
            sessionId: sessionId
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        setConversationState(data.conversationState);
        
        // Handle form completion
        if (data.formCompleted) {
          setFormCompleted(true);
        }

        // Handle PDF generation
        if (data.generatePdf) {
          try {
            await generatePdf(data.conversationState.formData);
            const pdfMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: "Your PDF has been generated and downloaded successfully!",
              sender: 'ai',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, pdfMessage]);
          } catch (error) {
            console.error('PDF generation failed:', error);
            const errorMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: "Sorry, there was an error generating your PDF. Please try again.",
              sender: 'ai',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, there was an error processing your message. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (conversationState?.formData) {
      try {
        await generatePdf(conversationState.formData);
      } catch (error) {
        console.error('Manual PDF download failed:', error);
      }
    }
  };

  return {
    messages,
    isLoading,
    handleSendMessage,
    formCompleted,
    conversationState,
    sessionId,
    handleDownloadPdf,
  };
}