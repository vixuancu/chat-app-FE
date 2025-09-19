import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PublicRouteProps {
    children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    // Nếu đã đăng nhập, redirect về trang chat
    if (isAuthenticated && user) {
        return <Navigate to="/chat" replace />;
    }

    return <>{children}</>;
};