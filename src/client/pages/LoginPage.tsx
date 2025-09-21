import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import type { User } from '@shared/services/types';

export const LoginPage: React.FC = () => {
    // Empty handler since routing will handle navigation automatically
    const handleLoginSuccess = (user: User) => {
        console.log('Login successful:', user?.user_fullname);
        // Navigation will be handled by LoginForm using useNavigate
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Đăng nhập</h1>
                    <p className="text-gray-500 mt-2">
                        Chào mừng bạn quay trở lại!
                    </p>
                </div>

                <LoginForm
                    onLogin={handleLoginSuccess}
                />

                {/* Link to register */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/register"
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};