// frontend/src/components/registration/HospitalForm.jsx
import { useState } from 'react';
import LocationPicker from './LocationPicker';

function HospitalForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    // Entity Data
    name: '',
    type: 'Multi-specialty',
    zone: 'Zone-1',
    address: '',
    coordinates: { lat: 19.076, lng: 72.877 },
    phone: '',
    email: '',
    // Profile - Beds
    bedsGeneral: 100,
    bedsICU: 20,
    bedsIsolation: 30,
    bedsPediatric: 40,
    bedsMaternity: 20,
    // Profile - Equipment
    ventilators: 15,
    oxygenCylinders: 100,
    xrayMachines: 3,
    ctScanners: 2,
    ambulances: 8,
    // Profile - Staff
    doctors: 45,
    nurses: 120,
    specialists: {
      infectiousDisease: 5,
      pulmonology: 3,
      pediatrics: 8,
      emergency: 12
    },
    // User Data
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('specialists.')) {
      const specialistType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specialists: {
          ...prev.specialists,
          [specialistType]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Hospital name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.adminName) newErrors.adminName = 'Admin name is required';
    if (!formData.adminEmail) newErrors.adminEmail = 'Admin email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const entityData = {
      entityType: 'hospital',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      zone: formData.zone,
      address: formData.address,
      coordinates: formData.coordinates,
      profile: {
        type: formData.type,
        beds: {
          general: { total: parseInt(formData.bedsGeneral) },
          icu: { total: parseInt(formData.bedsICU) },
          isolation: { total: parseInt(formData.bedsIsolation) },
          pediatric: { total: parseInt(formData.bedsPediatric) },
          maternity: { total: parseInt(formData.bedsMaternity) }
        },
        equipment: {
          ventilators: { total: parseInt(formData.ventilators) },
          oxygenCylinders: { total: parseInt(formData.oxygenCylinders) },
          xrayMachines: { total: parseInt(formData.xrayMachines) },
          ctScanners: { total: parseInt(formData.ctScanners) },
          ambulances: { total: parseInt(formData.ambulances) }
        },
        staff: {
          doctors: { total: parseInt(formData.doctors) },
          nurses: { total: parseInt(formData.nurses) },
          specialists: formData.specialists
        }
      },
      currentState: {
        beds: {
          general: { total: parseInt(formData.bedsGeneral), used: 0 },
          icu: { total: parseInt(formData.bedsICU), used: 0 },
          isolation: { total: parseInt(formData.bedsIsolation), used: 0 },
          pediatric: { total: parseInt(formData.bedsPediatric), used: 0 },
          maternity: { total: parseInt(formData.bedsMaternity), used: 0 }
        }
      }
    };

    const userData = {
      email: formData.adminEmail,
      password: formData.password,
      name: formData.adminName
    };

    onSubmit({ entityData, userData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-slate-700/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hospital Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="City Central Hospital"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hospital Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option>Multi-specialty</option>
              <option>Tertiary Care</option>
              <option>Community Hospital</option>
              <option>Specialty Hospital</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Zone *
            </label>
            <select
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option>Zone-1</option>
              <option>Zone-2</option>
              <option>Zone-3</option>
              <option>Zone-4</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="+91-9876543210"
            />
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Street, Area, City"
            />
            {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location Coordinates
            </label>
            <LocationPicker
              coordinates={formData.coordinates}
              onChange={(coords) => setFormData(prev => ({ ...prev, coordinates: coords }))}
            />
          </div>
        </div>
      </div>

      {/* Capacity Information */}
      <div className="bg-slate-700/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Bed Capacity</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'bedsGeneral', label: 'General' },
            { name: 'bedsICU', label: 'ICU' },
            { name: 'bedsIsolation', label: 'Isolation' },
            { name: 'bedsPediatric', label: 'Pediatric' },
            { name: 'bedsMaternity', label: 'Maternity' }
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {field.label}
              </label>
              <input
                type="number"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-slate-700/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Equipment</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'ventilators', label: 'Ventilators' },
            { name: 'oxygenCylinders', label: 'O₂ Cylinders' },
            { name: 'xrayMachines', label: 'X-Ray Machines' },
            { name: 'ctScanners', label: 'CT Scanners' },
            { name: 'ambulances', label: 'Ambulances' }
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {field.label}
              </label>
              <input
                type="number"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Staff */}
      <div className="bg-slate-700/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Staff</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Doctors
            </label>
            <input
              type="number"
              name="doctors"
              value={formData.doctors}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nurses
            </label>
            <input
              type="number"
              name="nurses"
              value={formData.nurses}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Specialists
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(formData.specialists).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    name={`specialists.${key}`}
                    value={value}
                    onChange={handleChange}
                    className="w-full px-3 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Account */}
      <div className="bg-slate-700/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Admin Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Admin Name *
            </label>
            <input
              type="text"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            {errors.adminName && <p className="text-red-400 text-sm mt-1">{errors.adminName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Admin Email *
            </label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            {errors.adminEmail && <p className="text-red-400 text-sm mt-1">{errors.adminEmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? 'Registering...' : 'Complete Registration'}
      </button>
    </form>
  );
}

export default HospitalForm;

