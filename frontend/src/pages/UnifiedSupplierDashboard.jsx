// Unified Supplier Dashboard - Works for both new registrations and legacy demo
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EntityActivityFeed from '../components/EntityActivityFeed';
import RealTimeMetricsGraph from '../components/RealTimeMetricsGraph';

function UnifiedSupplierDashboard() {
  const { supplierId: urlSupplierId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [entityData, setEntityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const entityId = user?.entityId || user?.entity?.id || urlSupplierId;

  // Debug logging
  useEffect(() => {
    console.log('🔍 Supplier Dashboard Debug:', { user, entityId });
  }, [user, navigate]);

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
          const supplier = data.suppliers?.[entityId];
          if (supplier) {
            setEntityData({ ...supplier, _id: entityId, id: entityId });
            setError(null);
          } else {
            setError('Supplier not found');
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching supplier data:', err);
        setError('Failed to load supplier data');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [entityId]);

  const getInventoryStats = () => {
    if (!entityData) return null;

    const inventory = entityData.currentState?.inventory || entityData.inventory || {};
    const items = Object.values(inventory);
    const totalInventory = items.reduce((sum, i) => sum + (i.stock || 0), 0);
    const lowInventory = items.filter(i => i.stock < 100);

    return {
      totalItems: Object.keys(inventory).length,
      totalInventory,
      lowInventoryCount: lowInventory.length,
      activeOrders: (entityData.currentState?.activeOrders || []).length,
      inventory
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📦</div>
          <div className="text-2xl text-white">Loading Supplier Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !entityData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Supplier Not Found</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const inventoryStats = getInventoryStats();
  const supplierName = entityData.name || 'Supplier';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 text-white p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">📦</span>
              <div>
                <h1 className="text-4xl font-bold">{supplierName}</h1>
                <p className="text-slate-300 text-lg">Type: Medical Supplier</p>
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
            <span className="text-slate-400">Total Inventory</span>
            <span className="text-3xl">📊</span>
          </div>
          <div className="text-4xl font-bold text-green-400">{inventoryStats?.totalInventory || 0}</div>
          <div className="text-sm text-slate-400">units in stock</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Product Types</span>
            <span className="text-3xl">📦</span>
          </div>
          <div className="text-4xl font-bold text-blue-400">{inventoryStats?.totalItems || 0}</div>
          <div className="text-sm text-slate-400">varieties</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Active Orders</span>
            <span className="text-3xl">🚚</span>
          </div>
          <div className="text-4xl font-bold text-orange-400">{inventoryStats?.activeOrders || 0}</div>
          <div className="text-sm text-slate-400">pending deliveries</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Low Stock Alerts</span>
            <span className="text-3xl">⚠️</span>
          </div>
          <div className="text-4xl font-bold text-red-400">{inventoryStats?.lowInventoryCount || 0}</div>
          <div className="text-sm text-slate-400">items below threshold</div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
        <h3 className="text-2xl font-bold mb-6">📦 Inventory Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(inventoryStats?.inventory || {}).map(([item, data]) => {
            const stock = data.stock || 0;
            const isLow = stock < 100;

            return (
              <div key={item} className={`bg-slate-900 p-4 rounded-lg border-2 ${isLow ? 'border-red-500' : 'border-slate-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold capitalize">{item}</div>
                  {isLow && <span className="text-red-500 text-xl">⚠️</span>}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stock}</div>
                <div className="text-sm text-slate-400">units</div>
                <div className={`text-xs mt-2 ${isLow ? 'text-red-400' : 'text-green-400'}`}>
                  {isLow ? '🔴 Low Stock' : '✅ Sufficient'}
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
            <EntityActivityFeed entityId={entityId} entityName={supplierName} entityType="supplier" />
            <RealTimeMetricsGraph entityId={entityId} entityType="supplier" />
          </>
        )}
      </div>

      {/* Supplier Info */}
      <div className="bg-slate-800 rounded-lg p-6 mt-6 border border-slate-700">
        <h3 className="text-2xl font-bold mb-4">📋 Supplier Information</h3>
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
            <span className="text-slate-400">Service Zones:</span>
            <div className="font-semibold">{entityData.profile?.serviceZones?.join(', ') || 'Multi-Zone'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedSupplierDashboard;

