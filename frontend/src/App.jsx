// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PublicDashboard from './pages/PublicDashboard';
import RegistrationPage from './pages/RegistrationPage';
import CityDashboard from './pages/CityDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import LabDashboard from './pages/LabDashboard';
import SupplierDashboard from './pages/SupplierDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route - default landing page */}
          <Route path="/" element={<PublicDashboard />} />
          
          {/* Registration */}
          <Route path="/register" element={<RegistrationPage />} />
          
          {/* City Command Center - for professionals/demo */}
          <Route path="/city-dashboard" element={<CityDashboard />} />
          
          {/* Role-specific dashboards */}
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
          <Route path="/lab-dashboard" element={<LabDashboard />} />
          <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
          <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
          
          {/* Legacy routes with IDs (keep for backward compatibility) */}
          <Route path="/city" element={<CityDashboard />} />
          <Route path="/hospital/:hospitalId" element={<HospitalDashboard />} />
          <Route path="/lab/:labId" element={<LabDashboard />} />
          <Route path="/pharmacy/:pharmacyId" element={<PharmacyDashboard />} />
          <Route path="/supplier/:supplierId" element={<SupplierDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
