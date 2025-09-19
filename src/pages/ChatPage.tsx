import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MainApp } from '@/components/MainApp';

export const ChatPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        // Force redirect về auth page
        navigate('/auth', { replace: true });
    };

    // ProtectedRoute đã đảm bảo user tồn tại, nhưng để TypeScript yên tâm
    if (!user) {
        return null; // Sẽ không bao giờ render vì ProtectedRoute đã xử lý
    }

    return <MainApp currentUser={user} onLogout={handleLogout} />;
};