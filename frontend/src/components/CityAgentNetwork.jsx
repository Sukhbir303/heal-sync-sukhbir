// City Agent Network Visualizer - Shows 5 agents and their communications
import { useEffect, useRef, useState } from 'react';

function CityAgentNetwork({ activities }) {
  const canvasRef = useRef(null);
  const [connections, setConnections] = useState([]);
  const [hoveredAgent, setHoveredAgent] = useState(null);

  // Agent positions in a circular layout
  const agents = [
    { id: 'city', name: 'City Agent', emoji: '🏙️', color: '#3B82F6', x: 400, y: 250 }, // Center
    { id: 'hospital', name: 'Hospitals', emoji: '🏥', color: '#10B981', x: 400, y: 80 },  // Top
    { id: 'lab', name: 'Labs', emoji: '🔬', color: '#8B5CF6', x: 600, y: 200 },          // Right
    { id: 'pharmacy', name: 'Pharmacies', emoji: '💊', color: '#F59E0B', x: 550, y: 420 }, // Bottom Right
    { id: 'supplier', name: 'Suppliers', emoji: '📦', color: '#EF4444', x: 250, y: 420 }   // Bottom Left
  ];

  // Extract recent communications from activities
  useEffect(() => {
    if (!activities || activities.length === 0) return;

    const recentActivities = activities.slice(0, 20);
    const newConnections = [];

    recentActivities.forEach((activity, index) => {
      const timestamp = new Date(activity.timestamp).getTime();
      const age = Date.now() - timestamp;
      
      // Only show connections from last 10 seconds
      if (age < 10000) {
        const fromAgent = activity.agentType?.toLowerCase() || 'city';
        const opacity = Math.max(0, 1 - (age / 10000)); // Fade out over 10 seconds

        // Determine "to" agent based on activity message
        let toAgent = 'city';
        const msg = activity.message?.toLowerCase() || '';
        if (msg.includes('hospital')) toAgent = 'hospital';
        else if (msg.includes('lab')) toAgent = 'lab';
        else if (msg.includes('pharmacy')) toAgent = 'pharmacy';
        else if (msg.includes('supplier')) toAgent = 'supplier';

        if (fromAgent !== toAgent) {
          newConnections.push({
            from: fromAgent,
            to: toAgent,
            opacity,
            timestamp,
            message: activity.message,
            severity: activity.severity
          });
        }
      }
    });

    setConnections(newConnections);
  }, [activities]);

  // Draw the network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw connections (dashed lines)
    connections.forEach((conn) => {
      const fromAgent = agents.find(a => a.id === conn.from);
      const toAgent = agents.find(a => a.id === conn.to);

      if (fromAgent && toAgent) {
        ctx.beginPath();
        ctx.moveTo(fromAgent.x, fromAgent.y);
        ctx.lineTo(toAgent.x, toAgent.y);
        
        // Set line style based on severity
        if (conn.severity === 'critical') {
          ctx.strokeStyle = `rgba(239, 68, 68, ${conn.opacity})`;
          ctx.lineWidth = 3;
        } else if (conn.severity === 'warning') {
          ctx.strokeStyle = `rgba(245, 158, 11, ${conn.opacity})`;
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = `rgba(59, 130, 246, ${conn.opacity})`;
          ctx.lineWidth = 2;
        }
        
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw arrow at midpoint
        const midX = (fromAgent.x + toAgent.x) / 2;
        const midY = (fromAgent.y + toAgent.y) / 2;
        const angle = Math.atan2(toAgent.y - fromAgent.y, toAgent.x - fromAgent.x);
        
        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fillStyle = conn.severity === 'critical' ? `rgba(239, 68, 68, ${conn.opacity})` : 
                        conn.severity === 'warning' ? `rgba(245, 158, 11, ${conn.opacity})` :
                        `rgba(59, 130, 246, ${conn.opacity})`;
        ctx.fill();
        ctx.restore();
      }
    });

    // Draw agents as circles
    agents.forEach((agent) => {
      const isHovered = hoveredAgent === agent.id;
      const radius = isHovered ? 55 : 50;

      // Draw outer glow if hovered
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, radius + 10, 0, 2 * Math.PI);
        ctx.fillStyle = `${agent.color}40`;
        ctx.fill();
      }

      // Draw circle
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = agent.color;
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw emoji
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(agent.emoji, agent.x, agent.y);

      // Draw label below
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#FFF';
      ctx.fillText(agent.name, agent.x, agent.y + radius + 20);

      // Draw connection count if hovered
      if (isHovered) {
        const agentConnections = connections.filter(c => c.from === agent.id || c.to === agent.id);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(`${agentConnections.length} active connections`, agent.x, agent.y + radius + 40);
      }
    });
  }, [connections, hoveredAgent, agents]);

  // Handle mouse move for hover
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundAgent = null;
    agents.forEach((agent) => {
      const distance = Math.sqrt((x - agent.x) ** 2 + (y - agent.y) ** 2);
      if (distance < 50) {
        foundAgent = agent.id;
      }
    });

    setHoveredAgent(foundAgent);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 h-full">
      <h3 className="text-xl font-bold text-white mb-4">
        🌐 Agent Network
      </h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredAgent(null)}
          className="w-full bg-slate-900 rounded-lg cursor-pointer"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500 border-dashed border-t-2 border-blue-500"></div>
            <span>Normal Communication</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-yellow-500 border-dashed border-t-2 border-yellow-500"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500 border-dashed border-t-2 border-red-500"></div>
            <span>Critical Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">
              💡 Hover over agents to see details • Lines fade after 10 seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CityAgentNetwork;

