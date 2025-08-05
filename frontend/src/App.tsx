import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Landing } from '@/pages/Landing';
import { Dashboard } from '@/pages/Dashboard';
import { ProviderDashboard } from '@/pages/ProviderDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthCallback } from '@/components/AuthCallback';

function App() {
  return (
    <AuthProvider>
      <Router basename="/evt-mngment">
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/provider-dashboard" 
              element={
                <ProtectedRoute>
                  <ProviderDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
