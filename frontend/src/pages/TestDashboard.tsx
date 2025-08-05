import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const TestDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Test Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>Profile Name:</strong> {userProfile?.name || 'Loading...'}</p>
            <p><strong>Profile Type:</strong> {userProfile?.type || 'Loading...'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard Test</h2>
          <p className="text-gray-600">
            If you can see this page, the routing is working correctly!
          </p>
          <button 
            onClick={() => window.location.href = '/evt-mngment/'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};