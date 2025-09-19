import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, user, isLoading, isInitialized } = useAuth();

    // Nếu đã initialized và không có user → redirect ngay
    if (isInitialized && (!isAuthenticated || !user)) {
        return <Navigate to="/auth" replace />;
    }

    // Chỉ hiển thị loading khi thực sự đang kiểm tra token lần đầu
    if (isLoading || !isInitialized) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};