import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ChatPage } from '../pages/ChatPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AdminRoutes } from '@admin/routes/AdminRoutes';

export const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public routes - chỉ có thể truy cập khi chưa đăng nhập */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <RegisterPage />
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

                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminRoutes />} />

                {/* Default redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Legacy /auth route redirect to /login */}
                <Route path="/auth" element={<Navigate to="/login" replace />} />
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};
