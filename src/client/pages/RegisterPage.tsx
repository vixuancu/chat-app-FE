import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
    return (
        <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Đăng ký</h1>
                    <p className="text-gray-500 mt-2">
                        Tạo tài khoản mới để bắt đầu
                    </p>
                </div>

                <RegisterForm />

                {/* Link to login */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};