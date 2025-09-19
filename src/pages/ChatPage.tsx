import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { MainApp } from '@/components/MainApp';

export const ChatPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            console.log('🔄 [LOGOUT] Bắt đầu quá trình logout...', {
                user: user?.user_email,
                timestamp: new Date().toISOString()
            });

            await logout();
            
            console.log('✅ [LOGOUT] Logout API thành công', {
                clearedStorage: !localStorage.getItem('chat_app_token'),
                clearedUser: !localStorage.getItem('chat_app_user'),
                timestamp: new Date().toISOString()
            });

            // Hiển thị thông báo thành công
            toast.success('Đăng xuất thành công! 👋', {
                duration: 2000,
                position: 'top-center'
            });

            console.log('🚀 [LOGOUT] Chuyển hướng về trang đăng nhập...');
            
            // Force redirect về auth page
            navigate('/auth', { replace: true });
            
        } catch (error) {
            console.error('❌ [LOGOUT] Lỗi khi logout:', error);
            
            toast.error('Có lỗi khi đăng xuất, nhưng bạn đã được đăng xuất cục bộ', {
                duration: 3000,
                position: 'top-center'
            });
            
            // Vẫn redirect dù có lỗi API
            navigate('/auth', { replace: true });
        }
    };

    // ProtectedRoute đã đảm bảo user tồn tại, nhưng để TypeScript yên tâm
    if (!user) {
        return null; // Sẽ không bao giờ render vì ProtectedRoute đã xử lý
    }

    return <MainApp currentUser={user} onLogout={handleLogout} />;
};