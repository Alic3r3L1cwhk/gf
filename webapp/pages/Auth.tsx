import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { loginUser, registerUser, sendEmailCode, resetPassword } from '../services/mockApi';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset';

interface AuthProps {
    setUser: (u: User) => void;
}

const Auth: React.FC<AuthProps> = ({ setUser }) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<AuthMode>('login');
    const [role, setRole] = useState<UserRole>(UserRole.USER);
    const [loading, setLoading] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [timer, setTimer] = useState(0);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');

    const handleSendCode = async () => {
        if (!email) {
            alert('请输入邮箱');
            return;
        }
        try {
            setLoading(true);
            await sendEmailCode(email);
            setCodeSent(true);
            setTimer(60);
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) clearInterval(interval);
                    return prev - 1;
                });
            }, 1000);
        } catch (e) {
            alert('验证码发送失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'login') {
                if (!username) throw new Error('请输入账号');
                const user = await loginUser(username, password, role);
                setUser(user);
                navigate(user.role === UserRole.MERCHANT ? '/merchant' : '/user');
            } else if (mode === 'register') {
                if (!code) throw new Error('请输入验证码');
                const user = await registerUser(email, password, role, username);
                setUser(user);
                alert('注册成功！');
                navigate(user.role === UserRole.MERCHANT ? '/merchant' : '/user');
            } else if (mode === 'reset') {
                if (!code) throw new Error('请输入验证码');
                await resetPassword(email, password, code);
                alert('密码重置成功，请登录');
                setMode('login');
            }
        } catch (error: any) {
            alert(error.message || '操作失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{mode === 'login' ? '欢迎回来' : mode === 'register' ? '创建账号' : '重置密码'}</h2>
                    <p className="text-gray-500 text-sm">{mode === 'login' ? '请使用账号密码登录' : '加入小杰外卖平台'}</p>
                    {mode === 'login' && (
                        <div className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                            <div>测试用户: test / 123456</div>
                            <div>测试商家: boss / 123456</div>
                        </div>
                    )}
                </div>

                {mode === 'register' && (
                    <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === UserRole.USER ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                            onClick={() => setRole(UserRole.USER)}
                        >
                            我是用户
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === UserRole.MERCHANT ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setRole(UserRole.MERCHANT)}
                        >
                            我是商家
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {(mode === 'login' || mode === 'register') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                    placeholder="请输入您的账号"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {(mode === 'register' || mode === 'reset') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {(mode === 'register' || mode === 'reset') && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="验证码"
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={timer > 0 || loading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${timer > 0 ? 'bg-gray-200 text-gray-500' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                            >
                                {timer > 0 ? `${timer}s 后重发` : '获取验证码'}
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{mode === 'reset' ? '新密码' : '密码'}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg flex justify-center items-center transition-transform active:scale-[0.98]"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            <>
                                {mode === 'login' ? '登 录' : mode === 'register' ? '注 册' : '重置密码'}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 flex justify-center text-sm space-x-4">
                    {mode === 'login' ? (
                        <>
                            <button onClick={() => setMode('register')} className="text-gray-600 hover:text-orange-600">
                                注册账号
                            </button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => setMode('reset')} className="text-gray-600 hover:text-orange-600">
                                忘记密码？
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setMode('login')} className="text-orange-600 font-medium hover:text-orange-700">
                            返回登录
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
