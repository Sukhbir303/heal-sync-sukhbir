// City Command Center - Organized and interpretable dashboard
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FocusedScenarioPanel from '../components/FocusedScenarioPanel';
import CityEnhancedCharts from '../components/CityEnhancedCharts';
import CityAgentNetwork from '../components/CityAgentNetwork';
import EnhancedActivityLogs from '../components/EnhancedActivityLogs';
import CityStatistics from '../components/CityStatistics';

function CityCommandCenter() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cityData, setCityData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Failsafe: Stop loading after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout - forcing page display');
        setLoading(false);
        setLoadError('Data is taking longer than expected to load. Some features may be limited.');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // Fetch city state data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/state');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log('City data fetched successfully:', Object.keys(data));
        setCityData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching city data:', err);
        // Set loading to false even on error to show the page
        setLoading(false);
        // Set empty data structure to prevent crashes
        setCityData({
          hospitals: {},
          labs: {},
          pharmacies: {},
          suppliers: {},
          city: { zones: {} }
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch activities for logs and network
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/activities/recent?limit=50');
        const data = await res.json();
        if (data.success) {
          setActivities(data.data);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerScenario = async (scenarioId) => {
    try {
      console.log(`🚨 Triggering ${scenarioId} outbreak...`);
      
      const res = await fetch(`http://localhost:4000/api/scenarios/${scenarioId}/trigger`, {
        method: 'POST'
      });
      const result = await res.json();
      
      if (result.success) {
        setActiveScenario(scenarioId);
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="text-2xl">✅</span>
            <div>
              <div class="font-bold">Scenario Triggered!</div>
              <div class="text-sm">${result.message}</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
      }
    } catch (err) {
      console.error('Error triggering scenario:', err);
    }
  };

  const resetSystem = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/scenarios/reset', {
        method: 'POST'
      });
      const result = await res.json();
      
      if (result.success) {
        setActiveScenario(null);
      }
    } catch (err) {
      console.error('Error resetting system:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🏙️</div>
          <div className="text-2xl text-white font-bold">Loading City Command Center...</div>
          <div className="text-slate-400 mt-2">Initializing agent network and data streams</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🏙️</span>
              <div>
                <h1 className="text-3xl font-bold text-white">City Command Center</h1>
                <p className="text-slate-300 text-sm">AI-Powered Healthcare Coordination System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {activeScenario && (
                <div className="px-4 py-2 bg-red-900/50 border border-red-500 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl animate-pulse">🔴</span>
                    <div className="text-sm">
                      <div className="font-semibold text-red-200">SCENARIO ACTIVE</div>
                      <div className="text-red-300 text-xs">{activeScenario.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-right mr-4">
                <div className="text-sm text-slate-400">Logged in as</div>
                <div className="font-semibold text-white">{user?.name || 'City Admin'}</div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Error Banner */}
        {loadError && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-bold text-yellow-200">Connection Issue</div>
                <div className="text-sm text-yellow-300">{loadError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Statistics Overview */}
        {cityData && cityData.city && <CityStatistics data={cityData} />}

        {/* Section 2: Scenario Control */}
        <FocusedScenarioPanel 
          onTrigger={triggerScenario}
          onReset={resetSystem}
          activeScenario={activeScenario}
        />

        {/* Section 3: Charts Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Real-Time Analytics & Metrics
          </h2>
          <CityEnhancedCharts cityData={cityData} />
        </div>

        {/* Section 4: Agent Network & Logs */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🤖</span> Agent Coordination & Communication
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Visualizer - Half Width */}
            <CityAgentNetwork activities={activities} />

            {/* Quick Stats */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">📈 System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏥</span>
                    <span className="text-slate-300">Hospitals</span>
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    {Object.keys(cityData?.hospitals || {}).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔬</span>
                    <span className="text-slate-300">Labs</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-400">
                    {Object.keys(cityData?.labs || {}).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💊</span>
                    <span className="text-slate-300">Pharmacies</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-400">
                    {Object.keys(cityData?.pharmacies || {}).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <span className="text-slate-300">Suppliers</span>
                  </div>
                  <span className="text-2xl font-bold text-red-400">
                    {Object.keys(cityData?.suppliers || {}).length}
                  </span>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Active Connections</span>
                    <span className="text-xl font-bold text-blue-400">
                      {activities.filter(a => {
                        const age = Date.now() - new Date(a.timestamp).getTime();
                        return age < 10000;
                      }).length}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Last 10 seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Detailed Activity Flow */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💬</span> Agent Communication & Monitoring Logs
          </h2>
          <EnhancedActivityLogs activities={activities} scenarioActive={!!activeScenario} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-700 mt-12 py-6">
        <div className="container mx-auto px-6 text-center text-slate-400 text-sm">
          <p>HealSync AI-Powered Healthcare Coordination System © 2024</p>
          <p className="mt-2">Real-time monitoring • Multi-agent coordination • Predictive analytics</p>
        </div>
      </footer>
    </div>
  );
}

export default CityCommandCenter;

