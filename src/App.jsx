import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import Login from './components/admin/Login';
import Dashboard from './components/admin/Dashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', color: '#fff' }}>Cargando...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={!user ? <Login /> : <Navigate to="/admin/dashboard" />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
