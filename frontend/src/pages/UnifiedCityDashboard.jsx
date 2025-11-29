// Unified City Dashboard - Works for both new registrations and legacy demo
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HealthHeatmap from '../components/HealthHeatmap';
import ActiveAlerts from '../components/ActiveAlerts';
import CityStatistics from '../components/CityStatistics';
import ScenarioControlPanel from '../components/ScenarioControlPanel';
import EntityActivityFeed from '../components/EntityActivityFeed';
import CityAgentNetwork from '../components/CityAgentNetwork';
import CityDiseaseCharts from '../components/CityDiseaseCharts';

function UnifiedCityDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cityData, setCityData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scenarioStatus, setScenarioStatus] = useState(null);

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // Fetch city data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/state');
        const data = await res.json();
        setCityData(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching city data:', err);
        setError('Failed to load city data');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent activities for network visualization
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
    const interval = setInterval(fetchActivities, 2000); // Update every 2 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  const triggerScenario = async (scenarioId) => {
    try {
      console.log(`🚨 Triggering ${scenarioId} outbreak scenario...`);
      setScenarioStatus({ type: scenarioId, status: 'triggering' });
      
      const res = await fetch(`http://localhost:4000/api/scenarios/${scenarioId}/trigger`, {
        method: 'POST'
      });
      const result = await res.json();
      
      if (result.success) {
        setScenarioStatus({ type: scenarioId, status: 'active', message: result.message });
        alert(`✅ ${result.message}\n\n🔍 Watch the network visualizer to see agents responding in real-time!`);
      } else {
        setScenarioStatus(null);
        alert(`❌ ${result.message}`);
      }
    } catch (err) {
      console.error('Error triggering scenario:', err);
      setScenarioStatus(null);
      alert('❌ Failed to trigger scenario');
    }
  };

  const resetSystem = async () => {
    try {
      console.log('🔄 Resetting all scenarios...');
      const res = await fetch('http://localhost:4000/api/scenarios/reset', {
        method: 'POST'
      });
      const result = await res.json();
      
      if (result.success) {
        setScenarioStatus(null);
        alert('✅ System reset successfully!\n\nAll scenarios have been cleared.');
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (err) {
      console.error('Error resetting system:', err);
      alert('❌ Failed to reset system');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🏙️</div>
          <div className="text-2xl text-white">Loading City Command Center...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 shadow-lg">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏙️</span>
              <div>
                <h1 className="text-3xl font-bold">City Command Center</h1>
                <p className="text-slate-300">Real-time Healthcare Monitoring & Control</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ScenarioControlPanel onTrigger={triggerScenario} onReset={resetSystem} />
            <div className="text-right">
              <div className="text-sm text-slate-400">Logged in as</div>
              <div className="font-semibold">{user?.name || user?.email || 'City Admin'}</div>
            </div>
            <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Scenario Status Banner */}
        {scenarioStatus && scenarioStatus.status === 'active' && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-pulse">🚨</span>
              <div>
                <div className="text-xl font-bold text-white">
                  {scenarioStatus.type.toUpperCase()} OUTBREAK ACTIVE
                </div>
                <div className="text-red-200 text-sm">
                  {scenarioStatus.message || 'Agents are responding...'}
                </div>
              </div>
            </div>
            <button
              onClick={resetSystem}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition"
            >
              Reset Scenario
            </button>
          </div>
        )}

        {/* City Statistics */}
        <CityStatistics data={cityData} />

        {/* Agent Communication Network */}
        <CityAgentNetwork activities={activities} />

        {/* Disease Charts */}
        <CityDiseaseCharts cityData={cityData} />

        {/* Health Heatmap */}
        <HealthHeatmap cityData={cityData} />

        {/* Active Alerts */}
        <ActiveAlerts cityData={cityData} />

        {/* Activity Feed */}
        <EntityActivityFeed 
          entityId={user?.entityId} 
          entityName="City Command Center" 
          entityType="City" 
          limit={30}
        />

        {/* System Overview */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-2xl font-bold mb-4">📊 System Overview</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="text-slate-400 text-sm mb-1">Total Hospitals</div>
              <div className="text-3xl font-bold text-blue-400">
                {Object.keys(cityData?.hospitals || {}).length}
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="text-slate-400 text-sm mb-1">Total Labs</div>
              <div className="text-3xl font-bold text-purple-400">
                {Object.keys(cityData?.labs || {}).length}
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="text-slate-400 text-sm mb-1">Total Pharmacies</div>
              <div className="text-3xl font-bold text-green-400">
                {Object.keys(cityData?.pharmacies || {}).length}
              </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg">
              <div className="text-slate-400 text-sm mb-1">Total Suppliers</div>
              <div className="text-3xl font-bold text-orange-400">
                {Object.keys(cityData?.suppliers || {}).length}
              </div>
            </div>
          </div>
        </div>

        {/* Zone-wise Breakdown */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-2xl font-bold mb-4">🗺️ Zone-wise Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {['Zone-1', 'Zone-2', 'Zone-3'].map(zone => {
              const zoneHospitals = Object.values(cityData?.hospitals || {}).filter(h => h.zone === zone);
              const zoneLabs = Object.values(cityData?.labs || {}).filter(l => l.zone === zone);
              const zonePharmacies = Object.values(cityData?.pharmacies || {}).filter(p => p.zone === zone);

              return (
                <div key={zone} className="bg-slate-900 p-6 rounded-lg">
                  <h4 className="text-xl font-bold text-blue-400 mb-4">{zone}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">🏥 Hospitals:</span>
                      <span className="font-semibold">{zoneHospitals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">🔬 Labs:</span>
                      <span className="font-semibold">{zoneLabs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">💊 Pharmacies:</span>
                      <span className="font-semibold">{zonePharmacies.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedCityDashboard;

