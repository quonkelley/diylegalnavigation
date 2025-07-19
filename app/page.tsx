import ChatContainer from '@/components/ChatContainer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col">
      {/* Demo Banner */}
      <div className="bg-blue-600 text-white text-center py-2 px-4">
        <p className="text-sm font-medium">
          🎯 <strong>DEMO VERSION</strong> - Live Partnership Demo | 
          Full conversation flow with AI → Form completion → PDF download
        </p>
      </div>
      
      <div className="flex-1 flex flex-col">
        <ChatContainer />
      </div>
    </main>
  );
}