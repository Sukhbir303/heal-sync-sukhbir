// Real-Time Metrics Graph - Shows entity metrics over time
import { useState, useEffect } from 'react';

function RealTimeMetricsGraph({ entityId, entityType }) {
  const [metrics, setMetrics] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (entityId) {
      fetchMetrics();
      
      // Refresh every 10 seconds
      const interval = setInterval(fetchMetrics, 10000);
      return () => clearInterval(interval);
    }
  }, [entityId]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/entity/${entityId}/metrics?hours=6`);
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data);
        
        // Auto-select first metric if none selected
        if (!selectedMetric && data.timeSeries.datasets) {
          const firstMetric = Object.keys(data.timeSeries.datasets)[0];
          setSelectedMetric(firstMetric);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setLoading(false);
    }
  };

  const getMetricOptions = () => {
    if (!metrics || !metrics.timeSeries.datasets) return [];
    
    const options = {
      hospital: [
        { key: 'bedOccupancy', label: 'Bed Occupancy %', color: 'bg-blue-500' },
        { key: 'icuOccupancy', label: 'ICU Occupancy %', color: 'bg-red-500' },
        { key: 'erWaitTime', label: 'ER Wait Time (min)', color: 'bg-yellow-500' },
        { key: 'admissions', label: 'Admissions Today', color: 'bg-green-500' }
      ],
      lab: [
        { key: 'testsToday', label: 'Tests Processed', color: 'bg-purple-500' },
        { key: 'positiveRate', label: 'Positive Rate %', color: 'bg-red-500' },
        { key: 'dengueTests', label: 'Dengue Tests', color: 'bg-orange-500' },
        { key: 'covidTests', label: 'COVID Tests', color: 'bg-blue-500' }
      ],
      pharmacy: [
        { key: 'stockLevel', label: 'Overall Stock Level', color: 'bg-green-500' },
        { key: 'ordersPlaced', label: 'Orders Placed', color: 'bg-blue-500' },
        { key: 'lowStockItems', label: 'Low Stock Items', color: 'bg-red-500' }
      ],
      supplier: [
        { key: 'activeOrders', label: 'Active Orders', color: 'bg-blue-500' },
        { key: 'deliveries', label: 'Deliveries Scheduled', color: 'bg-green-500' },
        { key: 'inventoryLevel', label: 'Inventory Level %', color: 'bg-purple-500' }
      ]
    };

    return options[entityType] || [];
  };

  const renderMiniGraph = (data) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-[2px] h-12 w-full">
        {data.slice(-15).map((value, idx) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:opacity-80"
              style={{ height: `${Math.max(height, 5)}%` }}
              title={`${value}`}
            />
          );
        })}
      </div>
    );
  };

  const renderLargeGraph = () => {
    if (!metrics || !metrics.timeSeries || !selectedMetric) return null;

    const data = metrics.timeSeries.datasets[selectedMetric] || [];
    const labels = metrics.timeSeries.labels || [];

    if (data.length === 0) {
      return (
        <div className="text-center text-slate-400 py-12">
          No data available for this metric
        </div>
      );
    }

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    return (
      <div className="p-6 bg-slate-900 rounded-lg">
        <h4 className="text-lg font-semibold mb-4 capitalize">
          {selectedMetric.replace(/([A-Z])/g, ' $1').trim()}
        </h4>

        {/* Graph */}
        <div className="relative h-64 bg-slate-800 rounded-lg p-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-500">
            <span>{max.toFixed(0)}</span>
            <span>{((max + min) / 2).toFixed(0)}</span>
            <span>{min.toFixed(0)}</span>
          </div>

          {/* Graph bars */}
          <div className="ml-14 h-full flex items-end gap-1">
            {data.map((value, idx) => {
              const height = ((value - min) / range) * 100;
              const isRecent = idx >= data.length - 5;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t transition-all ${
                      isRecent 
                        ? 'bg-gradient-to-t from-green-600 to-green-400' 
                        : 'bg-gradient-to-t from-blue-600 to-blue-400'
                    } group-hover:opacity-80`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                    <div className="font-bold">{value}</div>
                    <div className="text-slate-400">{labels[idx]}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="ml-14 mt-2 flex justify-between text-xs text-slate-500">
            {labels.filter((_, idx) => idx % Math.ceil(labels.length / 5) === 0).map((label, idx) => (
              <span key={idx}>{label}</span>
            ))}
          </div>
        </div>

        {/* Current Value */}
        <div className="mt-4 p-4 bg-slate-800 rounded-lg flex items-center justify-between">
          <span className="text-slate-400">Current Value:</span>
          <span className="text-3xl font-bold text-green-400">
            {data[data.length - 1] || 0}
            {selectedMetric.includes('Rate') || selectedMetric.includes('Occupancy') ? '%' : ''}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">📊 Real-Time Metrics</h3>
        <div className="text-center text-slate-400 py-8">Loading metrics...</div>
      </div>
    );
  }

  const metricOptions = getMetricOptions();

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-6">📊 Real-Time Metrics</h3>

      {/* Current Stats Cards */}
      {metrics && metrics.entity && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {entityType === 'hospital' && (
            <>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">{metrics.entity.bedOccupancy}%</div>
                <div className="text-sm text-slate-400">Bed Occupancy</div>
                {renderMiniGraph([40, 45, 50, 55, 60, parseInt(metrics.entity.bedOccupancy)])}
              </div>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{metrics.entity.availableBeds}</div>
                <div className="text-sm text-slate-400">Available Beds</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400">{metrics.entity.erWaitTime}m</div>
                <div className="text-sm text-slate-400">ER Wait Time</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-red-400">{metrics.entity.icuBeds?.used || 0}/{metrics.entity.icuBeds?.total || 0}</div>
                <div className="text-sm text-slate-400">ICU Beds</div>
              </div>
            </>
          )}

          {entityType === 'lab' && (
            <>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-400">{metrics.entity.testsToday}</div>
                <div className="text-sm text-slate-400">Tests Today</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-red-400">{metrics.entity.positiveRate}%</div>
                <div className="text-sm text-slate-400">Positive Rate</div>
              </div>
            </>
          )}

          {entityType === 'pharmacy' && (
            <>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{metrics.entity.totalMedicines}</div>
                <div className="text-sm text-slate-400">Medicine Types</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-red-400">{metrics.entity.lowStockCount}</div>
                <div className="text-sm text-slate-400">Low Stock Items</div>
              </div>
            </>
          )}

          {entityType === 'supplier' && (
            <>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">{metrics.entity.activeOrders}</div>
                <div className="text-sm text-slate-400">Active Orders</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{metrics.entity.totalItems}</div>
                <div className="text-sm text-slate-400">Inventory Items</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Metric Selector */}
      {metricOptions.length > 0 && (
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {metricOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setSelectedMetric(option.key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedMetric === option.key
                    ? `${option.color} text-white shadow-lg scale-105`
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Large Graph */}
      {renderLargeGraph()}
    </div>
  );
}

export default RealTimeMetricsGraph;

