import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '../../services/types';

interface LoginFormProps {
    onLogin: (user: User) => void;
    onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');//useState('admin@demo.com')
    const [password, setPassword] = useState('');// useState('admin123')
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }

        setError('');
        setSuccessMessage('');
        try {
            await login(email.trim(), password);
            setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');

            // Get the user data from storage after successful login
            const userData = JSON.parse(localStorage.getItem('chat_app_user') || '{}');
            onLogin(userData);

            // Navigate to chat page
            setTimeout(() => {
                navigate('/chat');
            }, 1000);
        } catch (err: unknown) {
            console.error('Login error:', err);
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
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
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                    {successMessage}
                </div>
            )}

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
                disabled={isLoading || successMessage !== ''}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Đang đăng nhập...' : successMessage ? 'Đăng nhập thành công!' : 'Đăng nhập'}
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