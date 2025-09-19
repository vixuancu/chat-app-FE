import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { register, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setError('');
        setSuccessMessage('');
        try {
            await register(email.trim(), password, name.trim());
            // Registration successful
            setSuccessMessage('Đăng ký thành công! Đang chuyển về trang đăng nhập...');

            // Auto switch to login after 2 seconds
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err: unknown) {
            console.error('Registration error:', err);
            setError('Đăng ký thất bại. Email có thể đã được sử dụng.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-gray-700">
                    Tên người dùng
                </label>
                <input
                    type="text"
                    id="register-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>

            <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    id="register-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>

            <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                </label>
                <input
                    type="password"
                    id="register-password"
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

            <button
                type="submit"
                disabled={isLoading || successMessage !== ''}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Đang đăng ký...' : successMessage ? 'Đăng ký thành công!' : 'Đăng ký'}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
                <span>Đã có tài khoản?</span>{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                    Đăng nhập
                </button>
            </p>
        </form>
    );
};