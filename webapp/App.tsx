import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import MerchantDashboard from './pages/MerchantDashboard';
import { User, UserRole } from './types';
import { getCurrentUser } from './services/mockApi';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
    }

    return (
        <HashRouter>
            <Layout user={user} setUser={setUser}>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            !user ? <Auth setUser={setUser} /> : <Navigate to={user.role === UserRole.MERCHANT ? '/merchant' : '/user'} replace />
                        }
                    />

                    <Route
                        path="/user"
                        element={
                            user && user.role === UserRole.USER ? <UserDashboard user={user} /> : <Navigate to="/login" replace />
                        }
                    />

                    <Route
                        path="/merchant"
                        element={
                            user && user.role === UserRole.MERCHANT ? <MerchantDashboard user={user} /> : <Navigate to="/login" replace />
                        }
                    />

                    <Route
                        path="*"
                        element={<Navigate to={user ? (user.role === UserRole.MERCHANT ? '/merchant' : '/user') : '/login'} replace />}
                    />
                </Routes>
            </Layout>
        </HashRouter>
    );
};

export default App;
