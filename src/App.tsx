import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { AuthGuard } from './components/AuthGuard';
import { CustomCursor } from './components/CustomCursor';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

function App() {
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const updateCustomColors = useThemeStore((state) => state.updateCustomColors);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check session on load
    checkAuth();
    // This ensures that when the app mounts, the body class is correctly set.
    updateCustomColors({}); 
  }, [activeTheme, updateCustomColors, checkAuth]);

  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        {/* Enterprise SSO Login (Entry Point for unauthenticated users) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Marketing Landing Page (Now shown AFTER login) */}
        <Route 
          path="/" 
          element={
            <AuthGuard>
              <LandingPage />
            </AuthGuard>
          } 
        />
        
        {/* Protected Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
