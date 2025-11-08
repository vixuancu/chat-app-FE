import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@shared/hooks/useAuth';
import { storage } from '@shared/utils/storage';
import type { User } from '@shared/services/types';

interface LoginFormProps {
    onLogin: (user: User) => void;
}

interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setError('');
        setSuccessMessage('');

        console.log('🔐 [LoginForm] Attempting login:', { email: data.email });

        try {
            await login(data.email, data.password);
            console.log('✅ [LoginForm] Login successful');

            setSuccessMessage('Đăng nhập thành công!');
            
            // Get current user from auth hook after successful login
            const currentUser = storage.getUser();
            if (currentUser) {
                onLogin(currentUser);

                // Navigate immediately - no setTimeout for better UX
                if (currentUser.user_role === 'Admin') {
                    console.log('👤 [LoginForm] Admin user - redirecting to admin panel');
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    console.log('👤 [LoginForm] Regular user - redirecting to chat');
                    navigate('/chat', { replace: true });
                }
            }
        } catch (err: unknown) {
            console.error('❌ [LoginForm] Login failed:', err);
            
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Đăng nhập thất bại. Vui lòng thử lại.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <div className="mt-1">
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...register('email', {
                            required: 'Email là bắt buộc',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Email không hợp lệ',
                            },
                        })}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Nhập địa chỉ email"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                </label>
                <div className="mt-1">
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        {...register('password', {
                            required: 'Mật khẩu là bắt buộc',
                            minLength: {
                                value: 6,
                                message: 'Mật khẩu phải có ít nhất 6 ký tự',
                            },
                        })}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Nhập mật khẩu"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                </div>
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
                        type="checkbox"
                        {...register('rememberMe')}
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
                disabled={isSubmitting || isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting || isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
        </form>
    );
};