// frontend/src/components/registration/LabForm.jsx
import { useState } from 'react';
import LocationPicker from './LocationPicker';

function LabForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Clinical Pathology',
    zone: 'Zone-1',
    address: '',
    coordinates: { lat: 19.076, lng: 72.877 },
    phone: '',
    email: '',
    // Testing Capacity
    dengueCapacity: 200,
    malariaCapacity: 150,
    covidCapacity: 500,
    typhoidCapacity: 100,
    // Admin
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Lab name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.adminEmail) newErrors.adminEmail = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
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
      entityType: 'lab',
      name: formData.name,
      email: formData.email || formData.adminEmail,
      phone: formData.phone,
      zone: formData.zone,
      address: formData.address,
      coordinates: formData.coordinates,
      profile: {
        type: formData.type,
        testingCapacity: {
          dengue: { daily: parseInt(formData.dengueCapacity) },
          malaria: { daily: parseInt(formData.malariaCapacity) },
          covid: { daily: parseInt(formData.covidCapacity) },
          typhoid: { daily: parseInt(formData.typhoidCapacity) }
        }
      },
      currentState: {
        testResults: {
          dengue: 0,
          malaria: 0,
          covid: 0
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
      <div className="bg-slate-700/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Lab Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Lab Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="PathLab Diagnostics"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Lab Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option>Clinical Pathology</option>
              <option>Diagnostic Center</option>
              <option>Research Lab</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Zone *</label>
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <LocationPicker
              coordinates={formData.coordinates}
              onChange={(coords) => setFormData(prev => ({ ...prev, coordinates: coords }))}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-700/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Testing Capacity (Daily)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'dengueCapacity', label: 'Dengue' },
            { name: 'malariaCapacity', label: 'Malaria' },
            { name: 'covidCapacity', label: 'COVID-19' },
            { name: 'typhoidCapacity', label: 'Typhoid' }
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
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

      <div className="bg-slate-700/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Admin Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Admin Name *</label>
            <input
              type="text"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email *</label>
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Password *</label>
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password *</label>
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

export default LabForm;

