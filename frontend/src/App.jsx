import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import Interview from './pages/Interview';
import InterviewResult from './pages/InterviewResult';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/interview/setup"
            element={
              <PrivateRoute>
                <InterviewSetup />
              </PrivateRoute>
            }
          />
          <Route
            path="/interview/:interviewId"
            element={
              <PrivateRoute>
                <Interview />
              </PrivateRoute>
            }
          />
          <Route
            path="/interview/result/:interviewId"
            element={
              <PrivateRoute>
                <InterviewResult />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
