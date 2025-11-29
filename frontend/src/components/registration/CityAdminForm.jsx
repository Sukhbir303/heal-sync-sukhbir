// frontend/src/components/registration/CityAdminForm.jsx
import { useState } from 'react';

function CityAdminForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    departmentName: '',
    address: '',
    phone: '',
    email: '',
    adminName: '',
    designation: '',
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
    if (!formData.departmentName) newErrors.departmentName = 'Department name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.email) newErrors.email = 'Department email is required';
    if (!formData.adminName) newErrors.adminName = 'Official name is required';
    if (!formData.adminEmail) newErrors.adminEmail = 'Official email is required';
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
      entityType: 'cityadmin',
      name: formData.departmentName,
      email: formData.email,
      phone: formData.phone,
      zone: 'City-Wide',
      address: formData.address,
      coordinates: { lat: 19.076, lng: 72.877 },
      profile: {
        department: formData.departmentName,
        jurisdiction: ['Zone-1', 'Zone-2', 'Zone-3', 'Zone-4'],
        permissions: [
          'view-all-entities',
          'trigger-scenarios',
          'redistribute-resources',
          'issue-alerts'
        ]
      },
      currentState: {}
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
        <h3 className="text-xl font-bold text-white mb-4">Department Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Department Name *</label>
            <input
              type="text"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Mumbai Public Health Department"
            />
            {errors.departmentName && <p className="text-red-400 text-sm mt-1">{errors.departmentName}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Office Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Municipal Headquarters, Mumbai"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Contact Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Department Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="health@mumbai.gov.in"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>
      </div>

      <div className="bg-slate-700/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Official Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Official Name *</label>
            <input
              type="text"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Dr. Rajesh Kumar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Chief Health Officer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Official Email *</label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="health@cityadmin.gov"
            />
            {errors.adminEmail && <p className="text-red-400 text-sm mt-1">{errors.adminEmail}</p>}
          </div>

          <div>
            {/* Empty div for grid spacing */}
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

      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          <strong>Note:</strong> City Admin accounts have access to all entities across all zones and can trigger citywide scenarios and alerts.
        </p>
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

export default CityAdminForm;

