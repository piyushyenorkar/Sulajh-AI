import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Chat from './pages/Chat.tsx';
import Dashboard from './pages/Dashboard.tsx';
import OpsConsole from './pages/OpsConsole.tsx';
import Outcomes from './pages/Outcomes.tsx';
import Admin from './pages/Admin.tsx';
import DemoControl from './pages/DemoControl.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/ops" element={<OpsConsole />} />
      <Route path="/outcomes" element={<Outcomes />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/demo-control" element={<DemoControl />} />
    </Routes>
  );
}
