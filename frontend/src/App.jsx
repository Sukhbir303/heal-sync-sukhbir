// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PublicDashboard from './pages/PublicDashboard';
import RegistrationPage from './pages/RegistrationPage';
import CityCommandCenter from './pages/CityCommandCenter';
import UnifiedHospitalDashboard from './pages/UnifiedHospitalDashboard';
import UnifiedPharmacyDashboard from './pages/UnifiedPharmacyDashboard';
import UnifiedLabDashboard from './pages/UnifiedLabDashboard';
import UnifiedSupplierDashboard from './pages/UnifiedSupplierDashboard';

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
          <Route path="/city-dashboard" element={<CityCommandCenter />} />
          
          {/* Role-specific dashboards (NEW REGISTRATION FLOW) */}
          <Route path="/hospital-dashboard" element={<UnifiedHospitalDashboard />} />
          <Route path="/lab-dashboard" element={<UnifiedLabDashboard />} />
          <Route path="/pharmacy-dashboard" element={<UnifiedPharmacyDashboard />} />
          <Route path="/supplier-dashboard" element={<UnifiedSupplierDashboard />} />
          
          {/* Legacy routes with IDs (keep for backward compatibility - DEMO MODE) */}
          <Route path="/city" element={<CityCommandCenter />} />
          <Route path="/hospital/:hospitalId" element={<UnifiedHospitalDashboard />} />
          <Route path="/lab/:labId" element={<UnifiedLabDashboard />} />
          <Route path="/pharmacy/:pharmacyId" element={<UnifiedPharmacyDashboard />} />
          <Route path="/supplier/:supplierId" element={<UnifiedSupplierDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
