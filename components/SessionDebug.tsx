'use client';

interface SessionDebugProps {
  sessionId: string;
  conversationState: any;
}

export default function SessionDebug({ sessionId, conversationState }: SessionDebugProps) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
      <div className="font-mono">
        <div><strong>Session:</strong> {sessionId.substring(0, 20)}...</div>
        {conversationState && (
          <>
            <div><strong>Step:</strong> {conversationState.currentStep}</div>
            <div><strong>Conv ID:</strong> {conversationState.conversationId?.substring(0, 8)}...</div>
            <div><strong>Completed:</strong> {conversationState.completed ? 'Yes' : 'No'}</div>
          </>
        )}
      </div>
    </div>
  );
} 