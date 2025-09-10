import React, { useState } from 'react';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Chức năng đăng ký đang được phát triển!');
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
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>

            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Đăng ký
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