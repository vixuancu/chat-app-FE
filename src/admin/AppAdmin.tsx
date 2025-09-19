// TODO_REORG: Admin app skeleton with placeholder routes
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Placeholder admin components
const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
    <p className="text-gray-600">Admin panel coming soon...</p>
  </div>
);

const UserManagement = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">User Management</h1>
    <p className="text-gray-600">User management features coming soon...</p>
  </div>
);

const RoomManagement = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Room Management</h1>
    <p className="text-gray-600">Room management features coming soon...</p>
  </div>
);

export default function AppAdmin() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Chat App Admin
                </h1>
              </div>
            </div>
          </div>
        </nav>

        {/* Admin Routes */}
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}