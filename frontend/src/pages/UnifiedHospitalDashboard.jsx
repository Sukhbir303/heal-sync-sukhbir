// Unified Hospital Dashboard - Works for both new registrations and legacy demo
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import EntityActivityFeed from '../components/EntityActivityFeed';
import RealTimeMetricsGraph from '../components/RealTimeMetricsGraph';

function UnifiedHospitalDashboard() {
  const { hospitalId: urlHospitalId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [entityData, setEntityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get hospital ID from user context (new registration) or URL (legacy/demo)
  const entityId = user?.entityId || user?.entity?.id || urlHospitalId;

  // Debug logging
  useEffect(() => {
    console.log('🔍 Hospital Dashboard Debug:', {
      user,
      entityId,
      userEntityId: user?.entityId,
      userEntityObjId: user?.entity?.id,
      urlParam: urlHospitalId
    });
  }, [user, entityId, urlHospitalId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch entity data
  useEffect(() => {
    if (!entityId) {
      console.error('❌ No entity ID found!');
      setError('No entity ID provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // If MongoDB ObjectId (24 chars), fetch from entities API
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
          // Legacy: fetch from world state
          const res = await fetch('http://localhost:4000/api/state');
          const data = await res.json();
          const hospital = data.hospitals?.[entityId];
          
          if (hospital) {
            setEntityData({ ...hospital, _id: entityId, id: entityId });
            setError(null);
          } else {
            setError('Hospital not found');
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching hospital data:', err);
        setError('Failed to load hospital data');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [entityId]);

  // Calculate bed stats
  const getBedStats = () => {
    if (!entityData) return null;

    const beds = entityData.currentState?.beds || entityData.beds || {};
    
    const totalBeds = Object.values(beds).reduce((sum, b) => sum + (b.total || 0), 0);
    const usedBeds = Object.values(beds).reduce((sum, b) => sum + (b.used || 0), 0);
    const availableBeds = totalBeds - usedBeds;
    const occupancyRate = totalBeds > 0 ? ((usedBeds / totalBeds) * 100).toFixed(1) : 0;

    return {
      total: totalBeds,
      used: usedBeds,
      available: availableBeds,
      occupancy: occupancyRate,
      icu: beds.icu || { total: 0, used: 0 },
      general: beds.general || { total: 0, used: 0 },
      isolation: beds.isolation || { total: 0, used: 0 }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🏥</div>
          <div className="text-2xl text-white">Loading Hospital Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !entityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Hospital Not Found</h2>
          <p className="text-red-200 mb-6">{error || 'Unable to load hospital data'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const bedStats = getBedStats();
  const zone = entityData.zone || 'N/A';
  const hospitalName = entityData.name || 'Hospital';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">🏥</span>
              <div>
                <h1 className="text-4xl font-bold">{hospitalName}</h1>
                <p className="text-slate-300 text-lg">Zone: {zone} • Type: Hospital</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-slate-400">Logged in as</div>
              <div className="font-semibold">{user?.name || user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Bed Occupancy */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Bed Occupancy</span>
            <span className="text-3xl">🛏️</span>
          </div>
          <div className="text-4xl font-bold text-blue-400 mb-1">{bedStats?.occupancy}%</div>
          <div className="text-sm text-slate-400">{bedStats?.used} / {bedStats?.total} beds used</div>
        </div>

        {/* Available Beds */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Available Beds</span>
            <span className="text-3xl">✅</span>
          </div>
          <div className="text-4xl font-bold text-green-400 mb-1">{bedStats?.available}</div>
          <div className="text-sm text-slate-400">Ready for patients</div>
        </div>

        {/* ICU Status */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">ICU Beds</span>
            <span className="text-3xl">🚨</span>
          </div>
          <div className="text-4xl font-bold text-yellow-400 mb-1">
            {bedStats?.icu?.used || 0}/{bedStats?.icu?.total || 0}
          </div>
          <div className="text-sm text-slate-400">
            {bedStats?.icu?.total > 0 ? 
              `${((bedStats.icu.used / bedStats.icu.total) * 100).toFixed(0)}% occupied` : 
              'Not configured'}
          </div>
        </div>

        {/* Status */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Status</span>
            <span className="text-3xl">💚</span>
          </div>
          <div className="text-4xl font-bold text-green-400 mb-1">Active</div>
          <div className="text-sm text-slate-400">All systems operational</div>
        </div>
      </div>

      {/* Bed Breakdown */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
        <h3 className="text-2xl font-bold mb-6">🛏️ Bed Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(entityData.currentState?.beds || entityData.beds || {}).map(([type, data]) => {
            const total = data.total || 0;
            const used = data.used || 0;
            const percentage = total > 0 ? ((used / total) * 100).toFixed(0) : 0;
            
            return (
              <div key={type} className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-2 capitalize">{type}</div>
                <div className="text-2xl font-bold text-white mb-1">{used}/{total}</div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">{percentage}% used</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        {entityId && entityId.length === 24 && (
          <EntityActivityFeed 
            entityId={entityId} 
            entityName={hospitalName} 
            entityType="hospital" 
          />
        )}

        {/* Real-Time Metrics */}
        {entityId && entityId.length === 24 && (
          <RealTimeMetricsGraph 
            entityId={entityId} 
            entityType="hospital" 
          />
        )}
      </div>

      {/* Hospital Info */}
      <div className="bg-slate-800 rounded-lg p-6 mt-6 border border-slate-700">
        <h3 className="text-2xl font-bold mb-4">📋 Hospital Information</h3>
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

export default UnifiedHospitalDashboard;

