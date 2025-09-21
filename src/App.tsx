
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from '@client/routes/AppRoutes';
import { useAuth } from '@shared/hooks/useAuth';

function App() {
  const { refreshUser, isInitialized } = useAuth();

  // Try to restore user session on app start
  useEffect(() => {
    // Chỉ gọi refreshUser nếu chưa được initialized và có token
    if (!isInitialized && localStorage.getItem('chat_app_token')) {
      console.log('🔄 [App] Attempting to restore user session...');
      refreshUser().catch(() => {
        // Token might be expired, will be handled by the hook
        console.log('❌ [App] Failed to refresh user session');
      });
    }
  }, [refreshUser, isInitialized]);

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <AppRoutes />
      
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Default options for specific types
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
