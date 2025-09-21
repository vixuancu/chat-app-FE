import React from 'react';
import { useAuth } from '@shared/hooks/useAuth';
import { useRooms } from '@shared/hooks/useRooms';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { rooms } = useRooms();

  const stats = [
    {
      name: 'Total Users',
      value: 0, // Will implement later
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      name: 'Total Rooms', 
      value: rooms.length,
      icon: '🏠',
      color: 'bg-green-500',
    },
    {
      name: 'Active Admins',
      value: 1, // Current user
      icon: '👑',
      color: 'bg-purple-500',
    },
    {
      name: 'Active Members',
      value: 0, // Will implement later
      icon: '👤',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.user_fullname}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Here's what's happening with your chat application.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <span className="text-white text-xl">{stat.icon}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
          <div className="mt-6">
            <div className="text-sm text-gray-500 space-y-3">
              <div className="flex justify-between">
                <span>System started successfully</span>
                <span>Just now</span>
              </div>
              <div className="flex justify-between">
                <span>Admin panel loaded</span>
                <span>1 minute ago</span>
              </div>
              <div className="flex justify-between">
                <span>Database connection established</span>
                <span>2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};