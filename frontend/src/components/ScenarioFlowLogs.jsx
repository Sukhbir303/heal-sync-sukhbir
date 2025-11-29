// Scenario Flow Logs - Shows step-by-step agent coordination
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

function ScenarioFlowLogs({ activities, scenarioActive }) {
  const [groupedActivities, setGroupedActivities] = useState([]);

  useEffect(() => {
    if (!activities || activities.length === 0) return;

    // Group activities by agent type for better visualization
    const recent = activities.slice(0, 20);
    const groups = [];
    let currentGroup = null;

    recent.forEach((activity) => {
      const agentType = activity.agentType || 'System';
      
      if (!currentGroup || currentGroup.agentType !== agentType) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = {
          agentType,
          activities: [activity],
          timestamp: activity.timestamp
        };
      } else {
        currentGroup.activities.push(activity);
      }
    });
    
    if (currentGroup) groups.push(currentGroup);
    setGroupedActivities(groups);
  }, [activities]);

  const getAgentIcon = (agentType) => {
    const icons = {
      'City': '🏙️',
      'Hospital': '🏥',
      'Lab': '🔬',
      'Pharmacy': '💊',
      'Supplier': '📦',
      'System': '⚙️'
    };
    return icons[agentType] || '📋';
  };

  const getAgentColor = (agentType) => {
    const colors = {
      'City': 'border-l-blue-500 bg-blue-900/20',
      'Hospital': 'border-l-green-500 bg-green-900/20',
      'Lab': 'border-l-purple-500 bg-purple-900/20',
      'Pharmacy': 'border-l-orange-500 bg-orange-900/20',
      'Supplier': 'border-l-red-500 bg-red-900/20',
      'System': 'border-l-slate-500 bg-slate-900/20'
    };
    return colors[agentType] || 'border-l-slate-500 bg-slate-900/20';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return '🚨';
    if (severity === 'warning') return '⚠️';
    return 'ℹ️';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'text-red-400';
    if (severity === 'warning') return 'text-yellow-400';
    return 'text-blue-400';
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white mb-2">No Active Scenarios</h3>
        <p className="text-slate-400">
          Trigger a scenario (Dengue, COVID-19, or Typhoid) to see agent coordination in action
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-white">
            📋 Agent Coordination Flow
          </h3>
          {scenarioActive && (
            <span className="px-3 py-1 bg-red-900/50 border border-red-500 rounded-full text-red-200 text-sm font-semibold animate-pulse">
              🔴 LIVE
            </span>
          )}
        </div>
        <div className="text-sm text-slate-400">
          Last {activities.length} activities
        </div>
      </div>

      {/* Flow Description */}
      <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
        <p className="text-sm text-slate-300 leading-relaxed">
          <span className="font-semibold text-blue-400">📍 Coordination Flow:</span>
          {' '}Scenario triggers → City Agent monitors → Labs detect patterns → 
          Hospitals prepare resources → Pharmacies check medicine stock → 
          Suppliers coordinate deliveries → City Agent oversees response
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {groupedActivities.map((group, groupIndex) => (
          <div 
            key={`group-${groupIndex}`}
            className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-lg ${getAgentColor(group.agentType)}`}
          >
            {/* Agent Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{getAgentIcon(group.agentType)}</span>
              <div className="flex-1">
                <div className="font-bold text-white text-lg">{group.agentType} Agent</div>
                <div className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(group.timestamp), { addSuffix: true })}
                </div>
              </div>
              <div className="text-slate-500 text-sm">
                {group.activities.length} action{group.activities.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-2 ml-12">
              {group.activities.map((activity, actIndex) => (
                <div 
                  key={activity._id || `activity-${groupIndex}-${actIndex}`}
                  className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-md"
                >
                  <span className={`text-lg ${getSeverityColor(activity.severity)}`}>
                    {getSeverityIcon(activity.severity)}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm text-slate-200 leading-relaxed">
                      {activity.message}
                    </div>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-slate-500 font-mono">
                        <span className="text-slate-400">Action: </span>
                        {activity.action}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">ℹ️</span>
            <span className="text-slate-400">Info</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚠️</span>
            <span className="text-slate-400">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">🚨</span>
            <span className="text-slate-400">Critical</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-slate-500">
            <span>💡 Hover over any activity for details</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScenarioFlowLogs;

