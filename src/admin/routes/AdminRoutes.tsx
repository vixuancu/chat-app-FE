import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@admin/components/layout/AdminLayout';
import { AdminDashboard } from '@admin/pages/AdminDashboard';
import { UserManagementPage } from '@admin/pages/UserManagementPage';
import { RoomManagementPage } from '@admin/pages/RoomManagementPage';
import { useAuth } from '@shared/hooks/useAuth';

export const AdminRoutes: React.FC = () => {
  const { user } = useAuth();

  // Only allow Admin users
  if (!user || user.user_role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/rooms" element={<RoomManagementPage />} />
      </Routes>
    </AdminLayout>
  );
};