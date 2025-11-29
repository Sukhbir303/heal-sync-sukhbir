// Entity-Specific Activity Feed - Shows what THIS entity is doing
import { useState, useEffect } from 'react';

function EntityActivityFeed({ entityId, entityName, entityType }) {
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'alerts', 'actions'

  useEffect(() => {
    if (entityId) {
      fetchActivities();
      fetchAlerts();
      
      // Refresh every 5 seconds
      const interval = setInterval(() => {
        fetchActivities();
        fetchAlerts();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [entityId]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/entity/${entityId}/activities?limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.activities);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/entity/${entityId}/alerts?active=true`);
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      'OUTBREAK_DETECTED': '🚨',
      'OUTBREAK_ALERT': '⚠️',
      'WARD_PREPARED': '🛏️',
      'MEDICINE_REQUEST': '💊',
      'ORDER_PLACED': '📦',
      'ORDER_FULFILLED': '✅',
      'PATIENT_ADMITTED': '🏥',
      'PATIENT_DISCHARGED': '👋',
      'STOCK_LOW': '📉',
      'STOCK_CRITICAL': '🔴',
      'COORDINATION': '🤝',
      'STATUS_UPDATE': '📊',
      'DELIVERY_SCHEDULED': '🚚',
      'TEST_SPIKE': '📈',
      'CAPACITY_WARNING': '⚠️'
    };
    return icons[type] || '📌';
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-blue-500 text-white'
    };
    return styles[severity] || 'bg-gray-500 text-white';
  };

  const getTimeDiff = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'alerts') {
      return activity.priority === 'high' || activity.priority === 'critical';
    }
    if (filter === 'actions') {
      return activity.type.includes('REQUEST') || activity.type.includes('ORDER');
    }
    return true;
  });

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">📋 Activity Feed</h3>
        <div className="text-center text-slate-400 py-8">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">📋 {entityName} Activity Feed</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('alerts')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filter === 'alerts' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('actions')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filter === 'actions' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Actions
          </button>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {alerts.length > 0 && (
        <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 rounded-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <div className="font-bold text-red-300 text-lg">{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</div>
                <div className="text-sm text-red-400">Requires immediate attention</div>
              </div>
            </div>
            <button
              onClick={() => setFilter('alerts')}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
            >
              View All
            </button>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {filteredActivities.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <div className="text-4xl mb-2">📭</div>
            <div>No activities yet</div>
          </div>
        ) : (
          filteredActivities.map((activity, idx) => {
            const isAlert = activity.priority === 'high' || activity.priority === 'critical';
            
            return (
              <div
                key={activity.id || idx}
                className={`p-4 rounded-lg border-l-4 transition-all hover:bg-slate-700/50 ${
                  isAlert 
                    ? 'bg-red-900/20 border-red-500' 
                    : activity.priority === 'medium'
                    ? 'bg-yellow-900/20 border-yellow-500'
                    : 'bg-slate-700/30 border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Activity Content */}
                  <div className="flex items-start gap-3 flex-1">
                    {/* Icon */}
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{activity.description}</span>
                        {isAlert && (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityBadge(activity.metadata?.severity || 'medium')}`}>
                            ALERT
                          </span>
                        )}
                      </div>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="text-sm text-slate-400 space-y-1">
                          {activity.metadata.disease && (
                            <div>🦠 Disease: <span className="text-white font-medium">{activity.metadata.disease}</span></div>
                          )}
                          {activity.metadata.zone && (
                            <div>📍 Zone: {activity.metadata.zone}</div>
                          )}
                          {activity.metadata.targetEntity && (
                            <div>🎯 Target: {activity.metadata.targetEntity}</div>
                          )}
                          {activity.metadata.quantity && (
                            <div>📦 Quantity: {activity.metadata.quantity}</div>
                          )}
                          {activity.metadata.urgency && (
                            <div className={activity.metadata.urgency === 'high' ? 'text-red-400 font-bold' : ''}>
                              ⚡ Urgency: {activity.metadata.urgency}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-slate-500 whitespace-nowrap ml-4">
                    {getTimeDiff(activity.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Activity Stats */}
      <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-400">{activities.length}</div>
          <div className="text-xs text-slate-400">Total Activities</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-400">{alerts.length}</div>
          <div className="text-xs text-slate-400">Active Alerts</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">
            {activities.filter(a => a.status === 'completed').length}
          </div>
          <div className="text-xs text-slate-400">Completed</div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }
      `}</style>
    </div>
  );
}

export default EntityActivityFeed;

