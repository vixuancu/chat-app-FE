import React, { useState } from 'react';
import { mockUsers } from '../../data/mockData';
import type { User } from '../../services/types';

interface LoginFormProps {
    onLogin: (user: User) => void;
    onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('admin@demo.com');
    const [password, setPassword] = useState('admin123');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user = mockUsers.find(u => u.email === email);

        if (user) {
            onLogin(user);
        } else {
            alert('Tài khoản không hợp lệ. Sử dụng admin@demo.com hoặc các email demo khác.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>

            <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                </label>
                <input
                    type="password"
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Ghi nhớ tôi
                    </label>
                </div>
                <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Quên mật khẩu?
                    </a>
                </div>
            </div>

            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Đăng nhập
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
                <span>Chưa có tài khoản?</span>{' '}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Đăng ký
                </button>
            </p>
        </form>
    );
};