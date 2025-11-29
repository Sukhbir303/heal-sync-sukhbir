// Focused Scenario Panel - 3 main scenarios with clear descriptions
import { useState } from 'react';

function FocusedScenarioPanel({ onTrigger, onReset, activeScenario }) {
  const [selectedInfo, setSelectedInfo] = useState(null);

  const scenarios = [
    {
      id: 'dengue',
      name: 'Dengue Outbreak',
      emoji: '🦟',
      severity: 'HIGH',
      color: 'bg-red-600 hover:bg-red-700',
      borderColor: 'border-red-500',
      description: 'Mosquito-borne disease outbreak affecting Zone-1 and Zone-2',
      effects: [
        'Labs detect increased dengue test results',
        'Hospitals prepare isolation wards',
        'Pharmacies check dengue medicine stock',
        'Suppliers coordinate urgent deliveries'
      ]
    },
    {
      id: 'covid19',
      name: 'COVID-19 Wave',
      emoji: '🦠',
      severity: 'CRITICAL',
      color: 'bg-purple-600 hover:bg-purple-700',
      borderColor: 'border-purple-500',
      description: 'Highly contagious respiratory disease affecting all zones',
      effects: [
        'Citywide increase in COVID test positivity',
        'ICU capacity alerts across hospitals',
        'Oxygen and ventilator demand surges',
        'Emergency medicine procurement activated'
      ]
    },
    {
      id: 'typhoid',
      name: 'Typhoid Outbreak',
      emoji: '🦠',
      severity: 'HIGH',
      color: 'bg-orange-600 hover:bg-orange-700',
      borderColor: 'border-orange-500',
      description: 'Water-borne bacterial infection primarily in Zone-3',
      effects: [
        'Labs detect typhoid bacteria in samples',
        'Hospitals increase antibiotic reserves',
        'Water quality monitoring activated',
        'Supply chain ensures medicine availability'
      ]
    }
  ];

  const handleTrigger = (scenarioId) => {
    setSelectedInfo(null);
    onTrigger(scenarioId);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          🎯 Outbreak Scenario Control
        </h3>
        <p className="text-slate-400 text-sm">
          Select a scenario to simulate disease outbreak and watch AI agents coordinate response in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`relative rounded-lg border-2 ${
              activeScenario === scenario.id 
                ? `${scenario.borderColor} bg-slate-900/50` 
                : 'border-slate-600 bg-slate-900/30'
            } transition-all duration-300`}
          >
            {/* Scenario Card */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{scenario.emoji}</span>
                  <div>
                    <div className="font-bold text-white text-lg">{scenario.name}</div>
                    <div className={`text-xs font-semibold ${
                      scenario.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'
                    }`}>
                      {scenario.severity} SEVERITY
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                {scenario.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTrigger(scenario.id)}
                  disabled={activeScenario === scenario.id}
                  className={`flex-1 ${scenario.color} disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95`}
                >
                  {activeScenario === scenario.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-pulse">🔴</span> ACTIVE
                    </span>
                  ) : (
                    'Trigger Outbreak'
                  )}
                </button>
                <button
                  onClick={() => setSelectedInfo(selectedInfo === scenario.id ? null : scenario.id)}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                  title="Show details"
                >
                  {selectedInfo === scenario.id ? '✕' : 'ℹ️'}
                </button>
              </div>

              {/* Expanded Info */}
              {selectedInfo === scenario.id && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-sm font-semibold text-slate-300 mb-2">
                    What happens when triggered:
                  </div>
                  <ul className="space-y-2">
                    {scenario.effects.map((effect, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Global Controls */}
      <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3">
          {activeScenario ? (
            <>
              <span className="text-2xl animate-pulse">🚨</span>
              <div>
                <div className="text-sm font-semibold text-white">
                  Scenario Active: {scenarios.find(s => s.id === activeScenario)?.name}
                </div>
                <div className="text-xs text-slate-400">
                  Watch the agent coordination flow and network visualizer below
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="text-2xl">✅</span>
              <div>
                <div className="text-sm font-semibold text-white">System Operational</div>
                <div className="text-xs text-slate-400">
                  All agents monitoring normal operations
                </div>
              </div>
            </>
          )}
        </div>
        <button
          onClick={onReset}
          disabled={!activeScenario}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
        >
          🔄 Reset All
        </button>
      </div>
    </div>
  );
}

export default FocusedScenarioPanel;

