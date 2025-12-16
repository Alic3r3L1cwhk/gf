import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, UtensilsCrossed, User as UserIcon, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/mockApi';

interface LayoutProps {
    children: React.ReactNode;
    user: User | null;
    setUser: (u: User | null) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>;
                            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">小杰外卖</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <div className="flex items-center text-gray-700">
                                        {user.role === UserRole.MERCHANT ? <Store className="h-5 w-5 mr-1" /> : <UserIcon className="h-5 w-5 mr-1" />}
                                        <span className="font-medium">{user.username}</span>
                                    </div>
                                    <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-red-600 transition-colors">
                                        <LogOut className="h-5 w-5" />
                                        <span className="ml-1 hidden sm:block">退出</span>
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => navigate('/login')} className="text-orange-600 font-medium hover:text-orange-700">
                                    登录 / 注册
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

            <footer className="bg-gray-800 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-400">© 2024 GF_Study 实验三演示系统. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
