import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import type { User } from '../services/types';

interface AuthPageProps {
    onLogin: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);

    return (
        <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Chào mừng bạn!</h1>
                    <p className="text-gray-500 mt-2">
                        {isLoginMode ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
                    </p>
                </div>

                {isLoginMode ? (
                    <LoginForm
                        onLogin={onLogin}
                        onSwitchToRegister={() => setIsLoginMode(false)}
                    />
                ) : (
                    <RegisterForm
                        onSwitchToLogin={() => setIsLoginMode(true)}
                    />
                )}
            </div>
        </div>
    );
};
