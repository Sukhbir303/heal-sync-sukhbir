// frontend/src/components/registration/LocationPicker.jsx
import { useState } from 'react';

function LocationPicker({ coordinates, onChange }) {
  const [manualInput, setManualInput] = useState(false);

  const zones = {
    'Zone-1': { lat: 19.1136, lng: 72.8697 },
    'Zone-2': { lat: 19.0596, lng: 72.8295 },
    'Zone-3': { lat: 19.1197, lng: 72.9050 },
    'Zone-4': { lat: 19.0760, lng: 72.8777 }
  };

  const handleZoneSelect = (zone) => {
    onChange(zones[zone]);
  };

  const handleManualChange = (field, value) => {
    onChange({
      ...coordinates,
      [field]: parseFloat(value) || 0
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {Object.keys(zones).map(zone => (
          <button
            key={zone}
            type="button"
            onClick={() => handleZoneSelect(zone)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
          >
            {zone}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setManualInput(!manualInput)}
          className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-sm transition-colors"
        >
          {manualInput ? '📍 Zones' : '✏️ Manual'}
        </button>
      </div>

      {manualInput && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={coordinates.lat}
              onChange={(e) => handleManualChange('lat', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={coordinates.lng}
              onChange={(e) => handleManualChange('lng', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="text-xs text-slate-400">
        Current: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
      </div>
    </div>
  );
}

export default LocationPicker;

