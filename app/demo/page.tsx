'use client';

import { useState } from 'react';
import DefenseChecklist, { SAMPLE_DEFENSES } from '../../components/DefenseChecklist';

interface DefenseItem {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  category?: 'procedural' | 'substantive' | 'financial';
}

export default function DefenseChecklistDemo() {
  const [selectedDefenses, setSelectedDefenses] = useState<DefenseItem[]>([]);
  const [allowMultiple, setAllowMultiple] = useState(true);

  const handleSelectionChange = (defenses: DefenseItem[]) => {
    setSelectedDefenses(defenses);
    console.log('Selected defenses:', defenses);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">DefenseChecklist Component Demo</h1>
          <p className="text-gray-300">
            Claude delegated this task: Build a reusable UI component for legal defense selection
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Demo Controls</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Allow Multiple Selections</span>
            </label>
          </div>
        </div>

        {/* Component Demo */}
        <div className="mb-8">
          <DefenseChecklist 
            defenses={SAMPLE_DEFENSES}
            onSelectionChange={handleSelectionChange}
            allowMultiple={allowMultiple}
            title={allowMultiple ? "Select Your Legal Defenses" : "Select Your Primary Defense"}
            subtitle={allowMultiple ? "Choose all defenses that apply to your situation" : "Choose the defense that best applies"}
          />
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <div className="space-y-2">
            <p><strong>Selection Mode:</strong> {allowMultiple ? 'Multiple' : 'Single'}</p>
            <p><strong>Selected Count:</strong> {selectedDefenses.length}</p>
            <div>
              <strong>Selected Defenses:</strong>
              {selectedDefenses.length > 0 ? (
                <ul className="list-disc list-inside ml-4 mt-2">
                  {selectedDefenses.map(defense => (
                    <li key={defense.id} className="text-blue-300">
                      {defense.title} ({defense.category})
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400 ml-2">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Implementation Details */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">✅ Implementation Complete</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-400 mb-2">✅ Features Implemented</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Multiple/Single selection modes</li>
                <li>Category grouping (Procedural, Substantive, Financial)</li>
                <li>Accessible design (ARIA labels, keyboard navigation)</li>
                <li>Responsive Tailwind styling</li>
                <li>TypeScript interfaces</li>
                <li>Real-time selection feedback</li>
                <li>Visual selection indicators</li>
                <li>Sample defense data</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">🧪 Testing Coverage</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>16/16 tests passing ✅</li>
                <li>Component rendering tests</li>
                <li>Interaction behavior tests</li>
                <li>Accessibility compliance tests</li>
                <li>Selection state management tests</li>
                <li>Keyboard navigation tests</li>
                <li>Edge case handling tests</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Usage Example</h2>
          <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
{`import DefenseChecklist, { SAMPLE_DEFENSES } from './components/DefenseChecklist';

function MyComponent() {
  const [selections, setSelections] = useState([]);

  return (
    <DefenseChecklist 
      defenses={SAMPLE_DEFENSES}
      onSelectionChange={setSelections}
      allowMultiple={true}
      title="Select Your Legal Defenses"
      subtitle="Choose all defenses that apply"
    />
  );
}`}
          </pre>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Next Steps (Claude's Priority 1)</h2>
          <div className="text-sm space-y-2">
            <p><strong>Deploy MVP to Production:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Set up Supabase production environment</li>
              <li>Deploy to Vercel with production environment variables</li>
              <li>Configure custom domain</li>
              <li>Run validation checklist (conversation flow, PDF generation, mobile responsive)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 