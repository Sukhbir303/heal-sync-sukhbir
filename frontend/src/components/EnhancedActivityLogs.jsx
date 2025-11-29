// Enhanced Activity Logs - Shows detailed inter-agent communication
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

function EnhancedActivityLogs({ activities, scenarioActive }) {
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [agentFilter, setAgentFilter] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!activities || activities.length === 0) return;

    // Calculate statistics
    const agentCounts = {
      City: 0,
      Hospital: 0,
      Lab: 0,
      Pharmacy: 0,
      Supplier: 0
    };

    activities.forEach(activity => {
      const type = activity.agentType;
      if (agentCounts.hasOwnProperty(type)) {
        agentCounts[type]++;
      }
    });

    setStats(agentCounts);

    // Filter activities
    if (agentFilter === 'all') {
      setFilteredActivities(activities.slice(0, 50));
    } else {
      setFilteredActivities(
        activities.filter(a => a.agentType === agentFilter).slice(0, 50)
      );
    }
  }, [activities, agentFilter]);

  const getAgentIcon = (agentType) => {
    const icons = {
      'City': '🏙️',
      'Hospital': '🏥',
      'Lab': '🔬',
      'Pharmacy': '💊',
      'Supplier': '📦'
    };
    return icons[agentType] || '📋';
  };

  const getAgentColor = (agentType) => {
    const colors = {
      'City': 'bg-blue-500',
      'Hospital': 'bg-green-500',
      'Lab': 'bg-purple-500',
      'Pharmacy': 'bg-orange-500',
      'Supplier': 'bg-red-500'
    };
    return colors[agentType] || 'bg-slate-500';
  };

  const getActionIcon = (action) => {
    if (action?.includes('monitor') || action?.includes('check')) return '👁️';
    if (action?.includes('alert') || action?.includes('warning')) return '🚨';
    if (action?.includes('request') || action?.includes('order')) return '📤';
    if (action?.includes('response') || action?.includes('receive')) return '📥';
    if (action?.includes('prepare') || action?.includes('ready')) return '⚙️';
    if (action?.includes('deliver') || action?.includes('supply')) return '🚚';
    if (action?.includes('test') || action?.includes('analyze')) return '🧪';
    return '💬';
  };

  const extractCommunication = (activity) => {
    // Try to extract communication pattern from message/description
    const text = activity.message || activity.description || '';
    
    // Patterns like "sending to X", "received from Y", "coordinating with Z"
    const sendMatch = text.match(/sending.*to\s+(\w+)/i);
    const receiveMatch = text.match(/received.*from\s+(\w+)/i);
    const coordinateMatch = text.match(/coordinat(?:ing|e).*with\s+(\w+)/i);
    
    if (sendMatch) return { type: 'send', target: sendMatch[1] };
    if (receiveMatch) return { type: 'receive', source: receiveMatch[1] };
    if (coordinateMatch) return { type: 'coordinate', with: coordinateMatch[1] };
    
    return null;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white mb-2">No Agent Activity Yet</h3>
        <p className="text-slate-400">
          Waiting for agents to start communicating... Trigger a scenario to see them in action!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-white">
            💬 Agent Communication & Monitoring Logs
          </h3>
          {scenarioActive && (
            <span className="px-3 py-1 bg-red-900/50 border border-red-500 rounded-full text-red-200 text-sm font-semibold animate-pulse">
              🔴 LIVE
            </span>
          )}
        </div>
        <div className="text-sm text-slate-400">
          Total: {activities.length} activities
        </div>
      </div>

      {/* Agent Statistics & Filters */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setAgentFilter('all')}
          className={`p-3 rounded-lg transition-all ${
            agentFilter === 'all'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <div className="font-bold text-lg">All Agents</div>
          <div className="text-sm opacity-80">{activities.length} logs</div>
        </button>

        {['City', 'Hospital', 'Lab', 'Pharmacy', 'Supplier'].map((type) => (
          <button
            key={type}
            onClick={() => setAgentFilter(type)}
            className={`p-3 rounded-lg transition-all ${
              agentFilter === type
                ? `${getAgentColor(type)} text-white shadow-lg scale-105`
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl">{getAgentIcon(type)}</span>
            </div>
            <div className="font-semibold text-sm">{type}</div>
            <div className="text-xs opacity-80">{stats[type] || 0} logs</div>
          </button>
        ))}
      </div>

      {/* Activity Stream */}
      <div className="space-y-2 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
        {filteredActivities.map((activity, index) => {
          const communication = extractCommunication(activity);
          const agentType = activity.agentType || 'System';
          const timestamp = activity.timestamp ? new Date(activity.timestamp) : new Date();
          
          return (
            <div
              key={activity._id || `activity-${index}`}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 hover:bg-slate-900/70 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Agent Badge */}
                <div className={`${getAgentColor(agentType)} rounded-full p-3 flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{getAgentIcon(agentType)}</span>
                </div>

                {/* Activity Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-white">{agentType} Agent</span>
                    
                    {/* Entity Name */}
                    {activity.entityName && (
                      <span className="text-sm text-slate-400">
                        ({activity.entityName})
                      </span>
                    )}

                    {/* Action Icon */}
                    <span className="text-xl" title={activity.action}>
                      {getActionIcon(activity.action)}
                    </span>

                    {/* Communication Arrow */}
                    {communication && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-xs">
                        {communication.type === 'send' && (
                          <>
                            <span>📤</span>
                            <span className="text-blue-300">→ {communication.target}</span>
                          </>
                        )}
                        {communication.type === 'receive' && (
                          <>
                            <span>📥</span>
                            <span className="text-green-300">← {communication.source}</span>
                          </>
                        )}
                        {communication.type === 'coordinate' && (
                          <>
                            <span>🤝</span>
                            <span className="text-purple-300">↔ {communication.with}</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className="ml-auto text-xs text-slate-500">
                      {formatDistanceToNow(timestamp, { addSuffix: true })}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="text-sm text-slate-300 leading-relaxed mb-2">
                    {activity.message || activity.description || 'No description available'}
                  </div>

                  {/* Metadata */}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activity.metadata.disease && (
                        <span className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded-full border border-red-700">
                          🦠 {activity.metadata.disease}
                        </span>
                      )}
                      {activity.metadata.zone && (
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full border border-blue-700">
                          📍 {activity.metadata.zone}
                        </span>
                      )}
                      {activity.metadata.priority && (
                        <span className={`px-2 py-1 text-xs rounded-full border ${
                          activity.metadata.priority === 'high' || activity.metadata.priority === 'critical'
                            ? 'bg-orange-900/30 text-orange-300 border-orange-700'
                            : 'bg-slate-900/30 text-slate-300 border-slate-700'
                        }`}>
                          ⚡ {activity.metadata.priority}
                        </span>
                      )}
                      {activity.metadata.action && (
                        <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-full border border-purple-700">
                          ⚙️ {activity.metadata.action}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">
            <span className="font-semibold text-white">Showing:</span> {filteredActivities.length} of {activities.length} activities
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Legend:</span>
              <span className="text-xs">📤 Send</span>
              <span className="text-xs">📥 Receive</span>
              <span className="text-xs">🤝 Coordinate</span>
              <span className="text-xs">👁️ Monitor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedActivityLogs;

