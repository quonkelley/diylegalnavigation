'use client';

import { useState } from 'react';

interface DefenseItem {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  category?: 'procedural' | 'substantive' | 'financial';
}

interface DefenseChecklistProps {
  defenses: DefenseItem[];
  onSelectionChange: (selectedDefenses: DefenseItem[]) => void;
  title?: string;
  subtitle?: string;
  allowMultiple?: boolean;
}

export default function DefenseChecklist({ 
  defenses, 
  onSelectionChange, 
  title = "Select Your Legal Defenses",
  subtitle = "Choose all defenses that apply to your situation",
  allowMultiple = true 
}: DefenseChecklistProps) {
  const [selectedDefenses, setSelectedDefenses] = useState<DefenseItem[]>(
    defenses.filter(defense => defense.selected)
  );

  const handleDefenseToggle = (defenseId: string) => {
    const defense = defenses.find(d => d.id === defenseId);
    if (!defense) return;

    let newSelectedDefenses: DefenseItem[];

    if (allowMultiple) {
      // Multiple selection mode
      const isCurrentlySelected = selectedDefenses.find(d => d.id === defenseId);
      if (isCurrentlySelected) {
        newSelectedDefenses = selectedDefenses.filter(d => d.id !== defenseId);
      } else {
        newSelectedDefenses = [...selectedDefenses, { ...defense, selected: true }];
      }
    } else {
      // Single selection mode
      const isCurrentlySelected = selectedDefenses.find(d => d.id === defenseId);
      newSelectedDefenses = isCurrentlySelected ? [] : [{ ...defense, selected: true }];
    }

    setSelectedDefenses(newSelectedDefenses);
    onSelectionChange(newSelectedDefenses);
  };

  const isSelected = (defenseId: string) => {
    return selectedDefenses.some(d => d.id === defenseId);
  };

  // Group defenses by category
  const groupedDefenses = defenses.reduce((acc, defense) => {
    const category = defense.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(defense);
    return acc;
  }, {} as Record<string, DefenseItem[]>);

  const categoryOrder = ['procedural', 'substantive', 'financial', 'other'];
  const categoryLabels = {
    procedural: 'Procedural Defenses',
    substantive: 'Substantive Defenses', 
    financial: 'Financial Defenses',
    other: 'Other Defenses'
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-300 text-sm">{subtitle}</p>
        {!allowMultiple && (
          <p className="text-blue-400 text-xs mt-1">Select only one defense that best applies</p>
        )}
      </div>

      {/* Defense Categories */}
      <div className="space-y-6">
        {categoryOrder.map(category => {
          const categoryDefenses = groupedDefenses[category];
          if (!categoryDefenses || categoryDefenses.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="border-b border-gray-600 pb-2">
                <h3 className="text-lg font-semibold text-gray-200">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
              </div>

              {/* Defense Items */}
              <div className="grid gap-3 md:grid-cols-1">
                {categoryDefenses.map((defense) => {
                  const selected = isSelected(defense.id);
                  return (
                    <div
                      key={defense.id}
                      className={`
                        relative border rounded-lg p-4 cursor-pointer transition-all duration-200
                        ${selected 
                          ? 'bg-blue-600 border-blue-500 shadow-lg' 
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-650 hover:border-gray-500'
                        }
                      `}
                      onClick={() => handleDefenseToggle(defense.id)}
                      role="checkbox"
                      aria-checked={selected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleDefenseToggle(defense.id);
                        }
                      }}
                    >
                      {/* Checkbox/Radio indicator */}
                      <div className="flex items-start space-x-3">
                        <div className={`
                          mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                          ${selected 
                            ? 'bg-white border-white' 
                            : 'border-gray-400 bg-transparent'
                          }
                        `}>
                          {selected && (
                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium mb-1 ${selected ? 'text-white' : 'text-gray-200'}`}>
                            {defense.title}
                          </h4>
                          <p className={`text-sm ${selected ? 'text-blue-100' : 'text-gray-400'}`}>
                            {defense.description}
                          </p>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {selected && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Count */}
      {selectedDefenses.length > 0 && (
        <div className="mt-6 p-4 bg-blue-900 rounded-lg border border-blue-700">
          <p className="text-blue-200 text-sm">
            <span className="font-medium">
              {selectedDefenses.length} defense{selectedDefenses.length !== 1 ? 's' : ''} selected:
            </span>
            {' '}
            {selectedDefenses.map(d => d.title).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

// Sample data export as requested by Claude
export const SAMPLE_DEFENSES: DefenseItem[] = [
  {
    id: 'improper_notice',
    title: 'Improper Notice',
    description: 'The landlord did not provide proper notice as required by law',
    category: 'procedural',
    selected: false
  },
  {
    id: 'rent_payment',
    title: 'Rent Was Paid',
    description: 'I paid the rent that was claimed to be owed',
    category: 'financial',
    selected: false
  },
  {
    id: 'warranty_habitability',
    title: 'Warranty of Habitability',
    description: 'The landlord failed to maintain the property in livable condition',
    category: 'substantive',
    selected: false
  },
  {
    id: 'retaliatory_eviction',
    title: 'Retaliatory Eviction',
    description: 'This eviction is in retaliation for exercising my legal rights',
    category: 'substantive',
    selected: false
  },
  {
    id: 'discrimination',
    title: 'Discrimination',
    description: 'This eviction is based on discrimination against a protected class',
    category: 'substantive',
    selected: false
  }
]; 