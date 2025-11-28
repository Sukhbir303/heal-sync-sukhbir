// frontend/src/components/DiseaseHeatmap.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function DiseaseHeatmap({ diseaseType = 'dengue', height = '600px' }) {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHeatmapData();
    const interval = setInterval(fetchHeatmapData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [diseaseType]);

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/analytics/heatmap/${diseaseType}`);
      if (!response.ok) throw new Error('Failed to fetch heatmap data');
      
      const result = await response.json();
      setHeatmapData(result.data || []);
      setError(null);
    } catch (err) {
      console.error('Heatmap fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#FBBF24';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'critical': return '🔴 Critical';
      case 'high': return '🟠 High';
      case 'medium': return '🟡 Medium';
      case 'low': return '🟢 Low';
      default: return '⚪ Unknown';
    }
  };

  if (loading) {
    return (
      <div style={{ height }} className="bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading heatmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height }} className="bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p>⚠️ Failed to load heatmap</p>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-800/90 backdrop-blur rounded-lg p-4 border border-slate-700">
        <h4 className="text-white font-bold mb-2 text-sm">Risk Level</h4>
        <div className="space-y-1 text-xs">
          {['critical', 'high', 'medium', 'low'].map(severity => (
            <div key={severity} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSeverityColor(severity) }}
              ></div>
              <span className="text-slate-300 capitalize">{severity}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-slate-400 text-xs">
            Disease: <span className="text-white capitalize">{diseaseType}</span>
          </p>
          <p className="text-slate-400 text-xs">
            Zones: <span className="text-white">{heatmapData.length}</span>
          </p>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[19.076, 72.877]}
        zoom={11}
        style={{ height, width: '100%', borderRadius: '0.5rem' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Heat circles for each zone */}
        {heatmapData.map((zone, idx) =>
          zone.labs.map((lab, labIdx) => (
            <Circle
              key={`${idx}-${labIdx}`}
              center={[lab.coordinates.lat, lab.coordinates.lng]}
              radius={zone.riskScore * 150} // Radius based on risk score
              pathOptions={{
                fillColor: getSeverityColor(zone.severity),
                fillOpacity: 0.3,
                color: getSeverityColor(zone.severity),
                weight: 2,
                opacity: 0.6
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h4 className="font-bold text-gray-900">{zone.zone}</h4>
                  <p className="text-gray-700">Risk: {getSeverityLabel(zone.severity)}</p>
                  <p className="text-gray-600">Score: {zone.riskScore}%</p>
                  <p className="text-gray-600">Cases: {zone.positiveCases}</p>
                  <p className="text-gray-600">Total Tests: {zone.totalTests}</p>
                </div>
              </Popup>
            </Circle>
          ))
        )}

        {/* Markers for labs */}
        {heatmapData.map((zone, idx) =>
          zone.labs.map((lab, labIdx) => (
            <Marker
              key={`marker-${idx}-${labIdx}`}
              position={[lab.coordinates.lat, lab.coordinates.lng]}
            >
              <Tooltip permanent={false} direction="top">
                <div className="text-xs">
                  <strong>{lab.name}</strong>
                  <br />
                  {zone.zone} - {getSeverityLabel(zone.severity)}
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm">
                  <h4 className="font-bold text-gray-900">{lab.name}</h4>
                  <p className="text-gray-700">Zone: {zone.zone}</p>
                  <p className="text-gray-600">Risk Score: {zone.riskScore}%</p>
                  <p className="text-gray-600">Status: {getSeverityLabel(zone.severity)}</p>
                  <hr className="my-2" />
                  <p className="text-gray-600">Positive Cases: {zone.positiveCases}</p>
                  <p className="text-gray-600">Total Tests: {zone.totalTests}</p>
                </div>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>

      {/* Zone Statistics */}
      {heatmapData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {heatmapData.map((zone, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 border-l-4 rounded-lg p-3"
              style={{ borderColor: getSeverityColor(zone.severity) }}
            >
              <div className="text-slate-400 text-xs">{zone.zone}</div>
              <div className="text-white font-bold text-lg">{zone.positiveCases}</div>
              <div className="text-slate-400 text-xs">cases ({zone.riskScore}% risk)</div>
              <div className="text-xs mt-1" style={{ color: getSeverityColor(zone.severity) }}>
                {getSeverityLabel(zone.severity)}
              </div>
            </div>
          ))}
        </div>
      )}

      {heatmapData.length === 0 && (
        <div className="mt-4 text-center text-slate-400 text-sm">
          No outbreak data available for {diseaseType}
        </div>
      )}
    </div>
  );
}

export default DiseaseHeatmap;

