// frontend/src/pages/RegistrationPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HospitalForm from '../components/registration/HospitalForm';
import LabForm from '../components/registration/LabForm';
import PharmacyForm from '../components/registration/PharmacyForm';
import SupplierForm from '../components/registration/SupplierForm';
import CityAdminForm from '../components/registration/CityAdminForm';

function RegistrationPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const roles = [
    {
      type: 'hospital',
      icon: '🏥',
      title: 'Hospital',
      description: 'Register your hospital to join the healthcare network'
    },
    {
      type: 'lab',
      icon: '🔬',
      title: 'Laboratory',
      description: 'Register your diagnostic lab for disease monitoring'
    },
    {
      type: 'pharmacy',
      icon: '💊',
      title: 'Pharmacy',
      description: 'Register your pharmacy for medicine supply coordination'
    },
    {
      type: 'supplier',
      icon: '📦',
      title: 'Supplier',
      description: 'Register as a medical supplies distributor'
    },
    {
      type: 'cityadmin',
      icon: '🏛️',
      title: 'City Admin',
      description: 'Register as city health department official'
    }
  ];

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      console.log('Submitting registration data:', JSON.stringify(data, null, 2));
      
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log('Registration response:', JSON.stringify(result, null, 2));

      if (!response.ok) {
        const errorMsg = result.message || result.error || 'Registration failed';
        console.error('Registration failed:', errorMsg);
        throw new Error(errorMsg);
      }

      // Auto-login after registration
      // Merge entity data into user object for dashboard access
      const userData = {
        ...result.data.user,
        entityId: result.data.entity.id,  // Add entityId to user object
        entity: result.data.entity        // Add full entity object
      };
      
      login(userData, result.data.token);

      // Navigate to appropriate dashboard
      const dashboardMap = {
        hospital: '/hospital-dashboard',
        lab: '/lab-dashboard',
        pharmacy: '/pharmacy-dashboard',
        supplier: '/supplier-dashboard',
        cityadmin: '/city-dashboard'
      };

      navigate(dashboardMap[result.data.user.role] || '/');

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Join HealSync Network
            </h1>
            <p className="text-xl text-slate-300">
              Select your organization type to begin registration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <button
                key={role.type}
                onClick={() => setSelectedRole(role.type)}
                className="bg-slate-800/50 backdrop-blur border-2 border-slate-700 hover:border-blue-500 rounded-xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {role.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {role.title}
                </h3>
                <p className="text-slate-400">
                  {role.description}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">
              {roles.find(r => r.type === selectedRole)?.icon} {' '}
              {roles.find(r => r.type === selectedRole)?.title} Registration
            </h2>
            <button
              onClick={() => setSelectedRole(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Change Type
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {selectedRole === 'hospital' && (
            <HospitalForm onSubmit={handleSubmit} loading={loading} />
          )}
          {selectedRole === 'lab' && (
            <LabForm onSubmit={handleSubmit} loading={loading} />
          )}
          {selectedRole === 'pharmacy' && (
            <PharmacyForm onSubmit={handleSubmit} loading={loading} />
          )}
          {selectedRole === 'supplier' && (
            <SupplierForm onSubmit={handleSubmit} loading={loading} />
          )}
          {selectedRole === 'cityadmin' && (
            <CityAdminForm onSubmit={handleSubmit} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;

