// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import MedicalEquipments from './pages/MedicalEquipments';
import DonateRent from './pages/DonateRent';
import About from './pages/About';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Layout component to handle Navbar and Footer visibility
function Layout({ children, isLoggedIn }) {
  const location = useLocation();
  
  // Don't show Navbar/Footer on these pages even if logged in
  const publicRoutes = ['/', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Show layout only if logged in AND not on public routes
  const showLayout = isLoggedIn && !isPublicRoute;

  return (
    <div className="app">
      {showLayout && <Navbar />}
      <main className="main-content">
        {children}
      </main>
      {showLayout && <Footer />}
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on component mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const loggedIn = !!token;
      setIsLoggedIn(loggedIn);
      console.log('🔐 Login status checked:', loggedIn);
    };

    // Check initially
    checkLoginStatus();

    // Listen for storage changes (when login happens in another component)
    window.addEventListener('storage', checkLoginStatus);
    
    // Custom event listener for login state changes
    window.addEventListener('loginStateChange', checkLoginStatus);

    // Poll for changes (fallback)
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStateChange', checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <Layout isLoggedIn={isLoggedIn}>
        <Routes>
          {/* Public routes - accessible without login */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected routes - require login */}
          <Route 
            path="/home" 
            element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/medicines" 
            element={isLoggedIn ? <Medicines /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/medicalequipments" 
            element={isLoggedIn ? <MedicalEquipments /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/donaterent" 
            element={isLoggedIn ? <DonateRent /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/about" 
            element={isLoggedIn ? <About /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile" 
            element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />} 
          />
          
          {/* Catch all route - redirect to home if logged in, else to landing */}
          <Route 
            path="*" 
            element={isLoggedIn ? <Navigate to="/home" replace /> : <Navigate to="/" replace />} 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;