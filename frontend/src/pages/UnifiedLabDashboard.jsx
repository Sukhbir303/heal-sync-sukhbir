// Unified Lab Dashboard - Works for both new registrations and legacy demo
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EntityActivityFeed from '../components/EntityActivityFeed';
import RealTimeMetricsGraph from '../components/RealTimeMetricsGraph';

function UnifiedLabDashboard() {
  const { labId: urlLabId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [entityData, setEntityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const entityId = user?.entityId || user?.entity?.id || urlLabId;

  // Debug logging
  useEffect(() => {
    console.log('🔍 Lab Dashboard Debug:', { user, entityId });
  }, [user, entityId]);

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    if (!entityId) {
      console.error('❌ No entity ID found!');
      setError('No entity ID provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (entityId.length === 24) {
          const res = await fetch(`http://localhost:4000/api/entities/${entityId}`);
          const data = await res.json();
          if (data.success) {
            setEntityData(data.data);
            setError(null);
          } else {
            setError('Entity not found');
          }
        } else {
          const res = await fetch('http://localhost:4000/api/state');
          const data = await res.json();
          const lab = data.labs?.[entityId];
          if (lab) {
            setEntityData({ ...lab, _id: entityId, id: entityId });
            setError(null);
          } else {
            setError('Lab not found');
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lab data:', err);
        setError('Failed to load lab data');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [entityId]);

  const getTestStats = () => {
    if (!entityData) return null;

    const testData = entityData.currentState?.testData || entityData.testResults || {};
    const testsToday = Object.values(testData).reduce((sum, t) => sum + (t.today || t || 0), 0);
    const positiveTests = Object.values(testData).reduce((sum, t) => sum + (t.positive || 0), 0);
    const positiveRate = testsToday > 0 ? ((positiveTests / testsToday) * 100).toFixed(1) : 0;

    return {
      testsToday,
      positiveTests,
      positiveRate,
      byDisease: testData
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔬</div>
          <div className="text-2xl text-white">Loading Lab Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !entityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Lab Not Found</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const testStats = getTestStats();
  const labName = entityData.name || 'Laboratory';
  const zone = entityData.zone || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">🔬</span>
              <div>
                <h1 className="text-4xl font-bold">{labName}</h1>
                <p className="text-slate-300 text-lg">Zone: {zone} • Type: Laboratory</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-slate-400">Logged in as</div>
              <div className="font-semibold">{user?.name || user?.email}</div>
            </div>
            <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Tests Today</span>
            <span className="text-3xl">🧪</span>
          </div>
          <div className="text-4xl font-bold text-purple-400">{testStats?.testsToday || 0}</div>
          <div className="text-sm text-slate-400">Processed</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Positive Tests</span>
            <span className="text-3xl">🦠</span>
          </div>
          <div className="text-4xl font-bold text-red-400">{testStats?.positiveTests || 0}</div>
          <div className="text-sm text-slate-400">Detected</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Positive Rate</span>
            <span className="text-3xl">📊</span>
          </div>
          <div className="text-4xl font-bold text-yellow-400">{testStats?.positiveRate || 0}%</div>
          <div className="text-sm text-slate-400">Detection rate</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Status</span>
            <span className="text-3xl">💚</span>
          </div>
          <div className="text-4xl font-bold text-green-400">Active</div>
          <div className="text-sm text-slate-400">Processing tests</div>
        </div>
      </div>

      {/* Disease Breakdown */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
        <h3 className="text-2xl font-bold mb-6">🦠 Disease Test Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(testStats?.byDisease || {}).map(([disease, data]) => {
            const today = data.today || data || 0;
            const positive = data.positive || 0;
            const rate = today > 0 ? ((positive / today) * 100).toFixed(1) : 0;
            
            return (
              <div key={disease} className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-2 capitalize">{disease}</div>
                <div className="text-2xl font-bold text-white mb-1">{today}</div>
                <div className="text-xs text-slate-500">tests today</div>
                <div className="text-xs text-red-400 mt-1">{positive} positive ({rate}%)</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {entityId && entityId.length === 24 && (
          <>
            <EntityActivityFeed entityId={entityId} entityName={labName} entityType="lab" />
            <RealTimeMetricsGraph entityId={entityId} entityType="lab" />
          </>
        )}
      </div>

      {/* Lab Info */}
      <div className="bg-slate-800 rounded-lg p-6 mt-6 border border-slate-700">
        <h3 className="text-2xl font-bold mb-4">📋 Lab Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <span className="text-slate-400">Address:</span>
            <div className="font-semibold">{entityData.address || 'N/A'}</div>
          </div>
          <div>
            <span className="text-slate-400">Phone:</span>
            <div className="font-semibold">{entityData.phone || 'N/A'}</div>
          </div>
          <div>
            <span className="text-slate-400">Email:</span>
            <div className="font-semibold">{entityData.email || 'N/A'}</div>
          </div>
          <div>
            <span className="text-slate-400">Zone:</span>
            <div className="font-semibold">{zone}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedLabDashboard;

