import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Login from './pages/Login.tsx';
import Chat from './pages/Chat.tsx';
import Dashboard from './pages/Dashboard.tsx';
import OpsConsole from './pages/OpsConsole.tsx';
import Outcomes from './pages/Outcomes.tsx';
import Admin from './pages/Admin.tsx';
import DemoControl from './pages/DemoControl.tsx';
import { api, type AuthSession } from './lib/api.ts';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles: AuthSession['user']['role'][] }) {
  const session = api.getSession();
  if (!session?.token || !roles.includes(session.user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute roles={['merchant']}><Dashboard /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute roles={['merchant']}><Chat /></ProtectedRoute>} />
      <Route path="/ops" element={<ProtectedRoute roles={['ops_agent', 'ops_manager', 'admin']}><OpsConsole /></ProtectedRoute>} />
      <Route path="/outcomes" element={<ProtectedRoute roles={['ops_manager', 'admin']}><Outcomes /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
      <Route path="/demo-control" element={<ProtectedRoute roles={['admin']}><DemoControl /></ProtectedRoute>} />
    </Routes>
  );
}
