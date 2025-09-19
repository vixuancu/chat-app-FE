
import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from '@/hooks/useAuth';

function App() {
  const { refreshUser, isInitialized } = useAuth();

  // Try to restore user session on app start
  useEffect(() => {
    // Chỉ gọi refreshUser nếu chưa được initialized và có token
    if (!isInitialized && localStorage.getItem('chat_app_token')) {
      refreshUser().catch(() => {
        // Token might be expired, will be handled by the hook
        console.log('Failed to refresh user session');
      });
    }
  }, [refreshUser, isInitialized]);

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <AppRoutes />
    </div>
  );
}

export default App;
