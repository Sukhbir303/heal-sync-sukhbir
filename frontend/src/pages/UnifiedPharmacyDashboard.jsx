// Unified Pharmacy Dashboard - Works for both new registrations and legacy demo
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EntityActivityFeed from '../components/EntityActivityFeed';
import RealTimeMetricsGraph from '../components/RealTimeMetricsGraph';

function UnifiedPharmacyDashboard() {
  const { pharmacyId: urlPharmacyId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [entityData, setEntityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const entityId = user?.entityId || user?.entity?.id || urlPharmacyId;

  // Debug logging
  useEffect(() => {
    console.log('🔍 Pharmacy Dashboard Debug:', {
      user,
      entityId,
      userEntityId: user?.entityId,
      userEntityObjId: user?.entity?.id,
      urlParam: urlPharmacyId
    });
  }, [user, entityId, urlPharmacyId]);

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
        console.log(`📡 Fetching pharmacy data for ID: ${entityId} (length: ${entityId.length})`);
        
        if (entityId.length === 24) {
          const url = `http://localhost:4000/api/entities/${entityId}`;
          console.log(`🌐 Fetching from: ${url}`);
          
          const res = await fetch(url);
          const data = await res.json();
          
          console.log('📦 API Response:', data);
          
          if (data.success) {
            console.log('✅ Entity found:', data.data.name);
            setEntityData(data.data);
            setError(null);
          } else {
            console.error('❌ Entity not found in response');
            setError(data.message || 'Entity not found');
          }
        } else {
          console.log('📡 Fetching from world state (legacy mode)');
          const res = await fetch('http://localhost:4000/api/state');
          const data = await res.json();
          const pharmacy = data.pharmacies?.[entityId];
          if (pharmacy) {
            console.log('✅ Pharmacy found in world state:', pharmacy.name);
            setEntityData({ ...pharmacy, _id: entityId, id: entityId });
            setError(null);
          } else {
            console.error('❌ Pharmacy not found in world state');
            setError('Pharmacy not found');
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching pharmacy data:', err);
        setError(`Failed to load pharmacy data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [entityId]);

  const getMedicineStats = () => {
    if (!entityData) return null;

    const medicines = entityData.currentState?.medicines || entityData.medicines || {};
    const inventory = Object.values(medicines);
    const totalStock = inventory.reduce((sum, m) => sum + (m.stock || 0), 0);
    const lowStock = inventory.filter(m => m.stock < (m.reorderLevel || 0));

    return {
      totalMedicines: Object.keys(medicines).length,
      totalStock,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock.map(m => Object.keys(medicines).find(key => medicines[key] === m)),
      medicines
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💊</div>
          <div className="text-2xl text-white">Loading Pharmacy Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !entityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Pharmacy Not Found</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const medicineStats = getMedicineStats();
  const pharmacyName = entityData.name || 'Pharmacy';
  const zone = entityData.zone || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">💊</span>
              <div>
                <h1 className="text-4xl font-bold">{pharmacyName}</h1>
                <p className="text-slate-300 text-lg">Zone: {zone} • Type: Pharmacy</p>
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
            <span className="text-slate-400">Total Stock</span>
            <span className="text-3xl">📦</span>
          </div>
          <div className="text-4xl font-bold text-green-400">{medicineStats?.totalStock || 0}</div>
          <div className="text-sm text-slate-400">units</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Medicine Types</span>
            <span className="text-3xl">💊</span>
          </div>
          <div className="text-4xl font-bold text-blue-400">{medicineStats?.totalMedicines || 0}</div>
          <div className="text-sm text-slate-400">varieties</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Low Stock</span>
            <span className="text-3xl">⚠️</span>
          </div>
          <div className="text-4xl font-bold text-yellow-400">{medicineStats?.lowStockCount || 0}</div>
          <div className="text-sm text-slate-400">items need reorder</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Status</span>
            <span className="text-3xl">💚</span>
          </div>
          <div className="text-4xl font-bold text-green-400">Active</div>
          <div className="text-sm text-slate-400">Operational</div>
        </div>
      </div>

      {/* Medicine Inventory */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
        <h3 className="text-2xl font-bold mb-6">💊 Medicine Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(medicineStats?.medicines || {}).map(([name, data]) => {
            const stock = data.stock || 0;
            const reorderLevel = data.reorderLevel || 0;
            const isLow = stock < reorderLevel;
            const percentage = reorderLevel > 0 ? ((stock / (reorderLevel * 2)) * 100).toFixed(0) : 100;

            return (
              <div key={name} className={`bg-slate-900 p-4 rounded-lg border-2 ${isLow ? 'border-red-500' : 'border-slate-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold capitalize">{name}</div>
                  {isLow && <span className="text-red-500 text-xl">⚠️</span>}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stock}</div>
                <div className="text-sm text-slate-400 mb-2">units in stock</div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500">
                  Reorder at: {reorderLevel} units
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {entityId && entityId.length === 24 && (
          <>
            <EntityActivityFeed entityId={entityId} entityName={pharmacyName} entityType="pharmacy" />
            <RealTimeMetricsGraph entityId={entityId} entityType="pharmacy" />
          </>
        )}
      </div>

      {/* Pharmacy Info */}
      <div className="bg-slate-800 rounded-lg p-6 mt-6 border border-slate-700">
        <h3 className="text-2xl font-bold mb-4">📋 Pharmacy Information</h3>
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

export default UnifiedPharmacyDashboard;

