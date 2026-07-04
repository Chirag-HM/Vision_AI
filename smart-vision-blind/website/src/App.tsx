import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import { LenisProvider } from './context/LenisProvider';
import { Navbar } from './components/Navbar';
import { FuzzyBackground } from './components/FuzzyBackground';
import { PrivateRoute } from './components/PrivateRoute';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { Dashboard } from './pages/Dashboard';
import { Volunteer } from './pages/Volunteer';
import { SOSPanel } from './pages/SOSPanel';
import { Login } from './pages/Login';

function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <LenisProvider>
          <Router>
            <div className="min-h-screen flex flex-col font-sans relative">
              <FuzzyBackground />
              <Navbar />
              <div className="flex-grow">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected: any authenticated user */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />

                  {/* Protected: VOLUNTEER or ADMIN only */}
                  <Route path="/volunteer" element={
                    <PrivateRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                      <Volunteer />
                    </PrivateRoute>
                  } />

                  {/* Protected: BLIND_USER, CAREGIVER, or ADMIN */}
                  <Route path="/sos" element={
                    <PrivateRoute allowedRoles={['BLIND_USER', 'CAREGIVER', 'ADMIN']}>
                      <SOSPanel />
                    </PrivateRoute>
                  } />
                </Routes>
              </div>
            </div>
          </Router>
        </LenisProvider>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;
