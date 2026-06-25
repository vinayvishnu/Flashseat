import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Layout from './components/Layout';
import LandingPage from './features/LandingPage';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/Dashboard';
import StadiumSeatSelection from './features/booking/StadiumSeatSelection';
import QueueWaitingRoom from './features/booking/QueueWaitingRoom';
import BookingStatusPage from './features/booking/BookingStatusPage';
import PaymentPage from './features/booking/PaymentPage';
import MyTickets from './features/tickets/MyTickets';
import UserProfile from './features/auth/UserProfile';
import AdminDashboard from './features/admin/AdminDashboard';
import AnalyticsDashboard from './features/admin/AnalyticsDashboard';

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated && user?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure User Views */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seat-selection" 
            element={
              <ProtectedRoute>
                <StadiumSeatSelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/queue" 
            element={
              <ProtectedRoute>
                <QueueWaitingRoom />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking-status" 
            element={
              <ProtectedRoute>
                <BookingStatusPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-tickets" 
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />

          {/* Admin Views */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
