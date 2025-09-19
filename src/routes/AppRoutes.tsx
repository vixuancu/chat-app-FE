import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '@/pages/AuthPage';
import { ChatPage } from '@/pages/ChatPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicRoute } from '@/routes/PublicRoute';

export const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public routes - chỉ có thể truy cập khi chưa đăng nhập */}
                <Route
                    path="/auth"
                    element={
                        <PublicRoute>
                            <AuthPage />
                        </PublicRoute>
                    }
                />

                {/* Protected routes - chỉ có thể truy cập khi đã đăng nhập */}
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />

                {/* Default redirects */}
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        </Router>
    );
};
