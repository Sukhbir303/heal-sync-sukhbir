// Scenario Control Panel - Trigger Disease Outbreaks
import { useState, useEffect } from 'react';

function ScenarioControlPanel() {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarios, setActiveScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchScenarios();
    fetchActiveScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/scenarios');
      const data = await response.json();
      setScenarios(data);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const fetchActiveScenarios = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/scenarios/active');
      const data = await response.json();
      if (data.success) {
        setActiveScenarios(data.activeScenarios);
      }
    } catch (error) {
      console.error('Error fetching active scenarios:', error);
    }
  };

  const triggerScenario = async (diseaseId) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:4000/api/scenarios/${diseaseId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `✅ ${data.scenario.name} triggered! ${data.affectedLabs} labs affected. Watch agents respond!`
        });
        fetchActiveScenarios();
        
        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({
          type: 'error',
          text: '❌ Failed to trigger scenario'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-500';
      case 'high': return 'bg-orange-600 text-white border-orange-500';
      case 'medium': return 'bg-yellow-600 text-black border-yellow-500';
      default: return 'bg-blue-600 text-white border-blue-500';
    }
  };

  const getScenarioEmoji = (diseaseId) => {
    const emojis = {
      dengue: '🦟',
      covid19: '😷',
      typhoid: '💧',
      malaria: '🦟',
      influenza: '🤧'
    };
    return emojis[diseaseId] || '🏥';
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">🎬 Outbreak Scenarios</h3>
        <button
          onClick={fetchActiveScenarios}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          message.type === 'success' ? 'bg-green-900/30 border-green-500 text-green-300' : 'bg-red-900/30 border-red-500 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Active Scenarios */}
      {activeScenarios.length > 0 && (
        <div className="mb-6 p-4 bg-orange-900/20 border border-orange-500 rounded-lg">
          <h4 className="font-bold text-orange-300 mb-3">⚠️ Active Scenarios ({activeScenarios.length})</h4>
          <div className="space-y-2">
            {activeScenarios.map((scenario, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-slate-900/50 p-3 rounded">
                <span className="font-semibold">{getScenarioEmoji(scenario.disease)} {scenario.name}</span>
                <span className="text-slate-400">
                  Zones: {scenario.zones.join(', ')} • {new Date(scenario.triggeredAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scenario Trigger Buttons */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => triggerScenario(scenario.id)}
            disabled={loading}
            className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${getSeverityColor(scenario.severity)}`}
          >
            {/* Emoji Icon */}
            <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
              {getScenarioEmoji(scenario.id)}
            </div>

            {/* Scenario Name */}
            <h4 className="font-bold text-lg mb-2">{scenario.name}</h4>
            
            {/* Description */}
            <p className="text-sm opacity-90 mb-3">{scenario.description}</p>

            {/* Meta Info */}
            <div className="space-y-1 text-xs opacity-80">
              <div>📍 Zones: {scenario.affectedZones.join(', ')}</div>
              <div>⏱️ Duration: {scenario.duration}h</div>
              <div>⚠️ Severity: {scenario.severity.toUpperCase()}</div>
              <div>📈 Test Multiplier: {scenario.diseaseMultiplier}x</div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <p className="text-sm text-slate-300">
          <span className="font-bold">💡 How it works:</span> Click a scenario to trigger an outbreak. 
          Labs will detect increased cases, hospitals will prepare, pharmacies will order medicine, 
          and suppliers will fulfill orders. Watch the coordination unfold in real-time!
        </p>
      </div>
    </div>
  );
}

export default ScenarioControlPanel;

