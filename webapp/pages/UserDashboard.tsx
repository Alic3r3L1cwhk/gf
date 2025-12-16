import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus, Shop } from '../types';
import { createOrder, getOrders, getShops } from '../services/mockApi';
import { analyzeOrderText, OrderAnalysis } from '../services/geminiService';
import { Send, Sparkles, Clock, Loader2, Utensils, Store, Star, Plus, Image as ImageIcon } from 'lucide-react';

interface Props {
    user: User;
}

const UserDashboard: React.FC<Props> = ({ user }) => {
    const [orderText, setOrderText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<OrderAnalysis | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchOrders = async () => {
        const data = await getOrders(user.role, user.id);
        setOrders(data);
    };

    const fetchShops = async () => {
        const data = await getShops();
        setShops(data);
        if (data.length > 0 && !selectedShopId) {
            // setSelectedShopId(data[0].id);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchShops();
    }, [user]);

    const handleAnalyze = async () => {
        if (!orderText.trim()) return;
        setIsAnalyzing(true);
        const result = await analyzeOrderText(orderText);
        setAnalysis(result);
        setIsAnalyzing(false);
    };

    const handleSubmitOrder = async () => {
        if (!orderText.trim()) return;
        if (!selectedShopId) {
            alert('请先选择一个商家');
            return;
        }

        const shop = shops.find((s) => s.id === selectedShopId);
        if (!shop) return;

        setSubmitting(true);
        try {
            await createOrder({
                userId: user.id,
                username: user.username,
                shopId: shop.id,
                shopName: shop.name,
                content: orderText,
                aiAnalysis: analysis || undefined,
            });
            setOrderText('');
            setAnalysis(null);
            await fetchOrders();
            alert('订单创建成功！等待商家接单。');
        } catch (e) {
            alert('订单创建失败');
        } finally {
            setSubmitting(false);
        }
    };

    const addToOrder = (itemName: string) => {
        setOrderText((prev) => {
            const prefix = prev.trim() ? prev.trim() + '，' : '';
            return `${prefix}一份${itemName}`;
        });
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.CONFIRMED:
                return 'bg-blue-100 text-blue-800';
            case OrderStatus.COMPLETED:
                return 'bg-green-100 text-green-800';
            case OrderStatus.CANCELLED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return '等待接单';
            case OrderStatus.CONFIRMED:
                return '商家制作中';
            case OrderStatus.COMPLETED:
                return '已完成';
            case OrderStatus.CANCELLED:
                return '已取消';
            default:
                return status;
        }
    };

    const selectedShop = shops.find((s) => s.id === selectedShopId);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Store className="mr-2 h-5 w-5 text-orange-600" /> 推荐商家
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shops.map((shop) => (
                            <div
                                key={shop.id}
                                onClick={() => setSelectedShopId(shop.id)}
                                className={`cursor-pointer rounded-xl border transition-all overflow-hidden ${selectedShopId === shop.id
                                        ? 'border-orange-500 ring-2 ring-orange-200 shadow-md transform scale-[1.02]'
                                        : 'border-gray-200 hover:border-orange-300 hover:shadow-sm bg-white'
                                    }`}
                            >
                                <div className="h-32 w-full relative bg-gray-100">
                                    {shop.image ? (
                                        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-orange-100">
                                            <Utensils className="text-orange-300 h-10 w-10" />
                                        </div>
                                    )}
                                    {selectedShopId === shop.id && <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold">当前选择</div>}
                                </div>
                                <div className="p-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800 text-lg">{shop.name}</h3>
                                        <div className="flex items-center text-xs text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded">
                                            <Star className="h-3 w-3 mr-0.5 fill-current" /> {shop.rating}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{shop.description}</p>
                                    <div className="mt-3 flex items-center text-xs text-gray-400 gap-2 border-t pt-2 border-gray-100">
                                        <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-0.5" /> {shop.deliveryTime}
                                        </span>
                                        <span>¥{shop.minPrice} 起送</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedShop ? (
                    <div className="space-y-6">
                        {selectedShop.chefName && (
                            <div className="bg-gradient-to-r from-orange-50 to-white rounded-2xl p-6 border border-orange-100 flex items-center gap-6 animate-fade-in">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-gray-200">
                                    {selectedShop.chefImage ? <img src={selectedShop.chefImage} alt={selectedShop.chefName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Utensils className="h-8 w-8" /></div>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center">
                                        主厨：{selectedShop.chefName} <span className="ml-2 px-2 py-0.5 bg-orange-200 text-orange-800 text-xs rounded-full">金牌厨师</span>
                                    </h3>
                                    <p className="text-gray-600 mt-1 text-sm">{selectedShop.chefIntro || '用心烹饪每一道菜。'}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                <h3 className="text-lg font-bold text-gray-900">{selectedShop.name} - 菜单</h3>
                                <span className="text-xs text-gray-400">点击 + 号添加到订单</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {selectedShop.dishes.map((dish) => (
                                    <div key={dish.id} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                            {dish.image ? <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="h-8 w-8" /></div>}
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-800">{dish.name}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{dish.description}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-orange-600 font-bold text-sm">¥{dish.price}</span>
                                                <button onClick={() => addToOrder(dish.name)} className="p-1.5 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors active:scale-90 opacity-0 group-hover:opacity-100">
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                        <Store className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>请在上方选择一个商家开始点餐</p>
                    </div>
                )}
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 sticky top-24 z-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Send className="mr-2 h-5 w-5 text-orange-600" /> 当前订单
                    </h2>

                    <div className="relative">
                        <div className="mb-2 text-sm text-gray-500 flex justify-between">
                            <span>
                                正在向 <strong className="text-gray-800">{selectedShop ? selectedShop.name : '...'}</strong> 下单
                            </span>
                        </div>
                        <textarea
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none transition-shadow text-gray-700 bg-gray-50"
                            rows={6}
                            placeholder={selectedShop ? '点击左侧菜单添加，或直接输入...' : '请先选择商家'}
                            disabled={!selectedShop}
                            value={orderText}
                            onChange={(e) => setOrderText(e.target.value)}
                        ></textarea>
                        {orderText && (
                            <button onClick={() => setOrderText('')} className="absolute top-8 right-2 text-xs text-gray-400 hover:text-red-500 underline">
                                清空
                            </button>
                        )}
                    </div>

                    {analysis && (
                        <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100 text-sm animate-fade-in">
                            <h4 className="font-bold text-indigo-900 mb-1 flex items-center">
                                <Sparkles className="h-3 w-3 mr-1" /> AI 分析结果
                            </h4>
                            <p className="text-gray-700 mb-1">
                                <strong>摘要:</strong> {analysis.summary}
                            </p>
                            <p className="text-gray-700 mb-1">
                                <strong>估价:</strong> ¥{analysis.estimatedPrice}
                            </p>
                            <p className="text-gray-500 text-xs italic">{analysis.nutritionTip}</p>
                        </div>
                    )}

                    <div className="mt-4 flex flex-col gap-3">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !orderText.trim()}
                            className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center text-sm"
                        >
                            {isAnalyzing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            AI 估价与分析
                        </button>
                        <button
                            onClick={handleSubmitOrder}
                            disabled={submitting || !orderText.trim() || !selectedShop}
                            className={`${!selectedShop ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'} w-full py-3 rounded-lg font-bold shadow-md transition-transform active:scale-95 flex justify-center items-center text-white`}
                        >
                            {submitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : '确认下单'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase text-gray-500">最近订单</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {orders.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-4">暂无历史订单</p>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-700 mb-1">@{order.shopName}</div>
                                    <p className="text-xs text-gray-800 line-clamp-2">{order.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
