'use client';

import { useChat } from '@/hooks/useChat';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import SessionDebug from './SessionDebug';

export default function ChatContainer() {
  const { messages, isLoading, handleSendMessage, sessionId, conversationState, formCompleted, handleDownloadPdf } = useChat();

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-2xl h-[600px] flex flex-col overflow-hidden">
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Legal Assistant</h2>
          <p className="text-gray-300 text-sm">Helping you with your Indiana eviction Appearance form</p>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList messages={messages} />
          
          {/* PDF Download Button - appears when form is completed */}
          {formCompleted && (
            <div className="px-6 py-3 border-t border-gray-600 bg-gray-750">
              <button
                onClick={handleDownloadPdf}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                📄 Download PDF Form
              </button>
            </div>
          )}
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
          />
        </div>
      </div>
      
      <SessionDebug sessionId={sessionId} conversationState={conversationState} />
    </>
  );
}