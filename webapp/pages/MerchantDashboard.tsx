import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus, Shop, Dish } from '../types';
import { getOrders, updateOrderStatus, getMyShop, saveMyShop } from '../services/mockApi';
import { Check, X, ChefHat, Clock, AlertCircle, Store, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface Props {
    user: User;
}

type Tab = 'orders' | 'shop';

const MerchantDashboard: React.FC<Props> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<Tab>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [myShop, setMyShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(false);
    const [savingShop, setSavingShop] = useState(false);
    const [shopForm, setShopForm] = useState<Partial<Shop>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const shop = await getMyShop(user.id);
            setMyShop(shop);
            if (shop) setShopForm(shop);

            const orderData = await getOrders(user.role, user.id);
            setOrders(orderData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            const orderData = await getOrders(user.role, user.id);
            setOrders(orderData);
        } catch (e) {
            alert('更新状态失败');
        }
    };

    const handleSaveShop = async () => {
        setSavingShop(true);
        try {
            const newShopData: Shop = {
                id: myShop?.id || `shop-${Date.now()}`,
                ownerId: user.id,
                name: shopForm.name || '未命名店铺',
                description: shopForm.description || '',
                rating: shopForm.rating || 5.0,
                deliveryTime: shopForm.deliveryTime || '30分钟',
                minPrice: Number(shopForm.minPrice) || 0,
                image: shopForm.image || '',
                chefName: shopForm.chefName || '',
                chefImage: shopForm.chefImage || '',
                chefIntro: shopForm.chefIntro || '',
                dishes: shopForm.dishes || [],
            };

            const saved = await saveMyShop(newShopData);
            setMyShop(saved);
            alert('店铺信息保存成功！');
        } catch (e) {
            alert('保存失败');
        } finally {
            setSavingShop(false);
        }
    };

    const handleAddDish = () => {
        const newDish: Dish = {
            id: `d-${Date.now()}`,
            name: '新菜品',
            price: 0,
            description: '请输入描述',
            image: '',
        };
        setShopForm((prev) => ({
            ...prev,
            dishes: [...(prev.dishes || []), newDish],
        }));
    };

    const handleUpdateDish = (index: number, field: keyof Dish, value: any) => {
        const newDishes = [...(shopForm.dishes || [])];
        newDishes[index] = { ...newDishes[index], [field]: value };
        setShopForm((prev) => ({ ...prev, dishes: newDishes }));
    };

    const handleDeleteDish = (index: number) => {
        if (!window.confirm('确定删除这个菜品吗？')) return;
        const newDishes = [...(shopForm.dishes || [])];
        newDishes.splice(index, 1);
        setShopForm((prev) => ({ ...prev, dishes: newDishes }));
    };

    if (!myShop && !loading && activeTab === 'orders') {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">欢迎加入小杰外卖商家版</h2>
                <p className="text-gray-500 mb-8">您还没有创建店铺，请先完善店铺信息。</p>
                <button onClick={() => setActiveTab('shop')} className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold">
                    立即创建店铺
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{myShop ? myShop.name : '商家管理后台'}</h1>
                    <p className="text-gray-500 text-sm">{myShop ? '营业中' : '未设置店铺'} • {user.username}</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg mt-4 sm:mt-0">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        订单管理
                    </button>
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'shop' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        店铺装修 & 菜单
                    </button>
                </div>
            </div>

            {activeTab === 'orders' && (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                                    <div className="flex items-center space-x-3 mb-2 md:mb-0">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                            {order.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{order.username}</h3>
                                            <div className="text-xs text-gray-400 flex items-center">ID: {order.id.slice(-6)} • {new Date(order.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div
                                        className={`px-3 py-1 rounded-full text-sm font-bold inline-block text-center ${order.status === OrderStatus.PENDING
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : order.status === OrderStatus.CONFIRMED
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : order.status === OrderStatus.COMPLETED
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {order.status === OrderStatus.PENDING
                                            ? '待接单'
                                            : order.status === OrderStatus.CONFIRMED
                                                ? '制作中'
                                                : order.status === OrderStatus.COMPLETED
                                                    ? '已送达'
                                                    : '已取消'}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">顾客需求</h4>
                                    <p className="text-gray-800">{order.content}</p>
                                </div>

                                {order.aiAnalysis && (
                                    <div className="mb-4 flex gap-4 text-sm">
                                        <div className="text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded">💰 估价: ¥{order.aiAnalysis.estimatedPrice}</div>
                                        <div className="text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded">📝 摘要: {order.aiAnalysis.summary}</div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                    {order.status === OrderStatus.PENDING && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(order.id, OrderStatus.CONFIRMED)}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                <ChefHat className="h-4 w-4 mr-2" /> 接单制作
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(order.id, OrderStatus.CANCELLED)}
                                                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                            >
                                                <X className="h-4 w-4 mr-2" /> 拒单
                                            </button>
                                        </>
                                    )}

                                    {order.status === OrderStatus.CONFIRMED && (
                                        <button
                                            onClick={() => handleStatusChange(order.id, OrderStatus.COMPLETED)}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                        >
                                            <Check className="h-4 w-4 mr-2" /> 标记为完成
                                        </button>
                                    )}

                                    {order.status === OrderStatus.COMPLETED && <span className="text-green-600 text-sm flex items-center font-medium"><Check className="h-4 w-4 mr-1" /> 订单已归档</span>}
                                </div>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">该店铺暂时没有订单</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'shop' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Store className="h-5 w-5 mr-2 text-orange-600" /> 店铺基础信息
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">店铺名称</label>
                            <input
                                type="text"
                                value={shopForm.name || ''}
                                onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">店铺封面 (URL)</label>
                            <input
                                type="text"
                                placeholder="https://..."
                                value={shopForm.image || ''}
                                onChange={(e) => setShopForm({ ...shopForm, image: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                            {shopForm.image && <img src={shopForm.image} alt="Preview" className="h-20 w-auto mt-2 rounded-lg object-cover" />}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">店铺简介</label>
                            <textarea
                                value={shopForm.description || ''}
                                onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">起送价 (¥)</label>
                            <input
                                type="number"
                                value={shopForm.minPrice || 0}
                                onChange={(e) => setShopForm({ ...shopForm, minPrice: Number(e.target.value) })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">配送时长</label>
                            <input
                                type="text"
                                value={shopForm.deliveryTime || ''}
                                onChange={(e) => setShopForm({ ...shopForm, deliveryTime: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <ChefHat className="h-5 w-5 mr-2 text-orange-600" /> 厨师/厨房信息
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">厨师姓名</label>
                                <input
                                    type="text"
                                    value={shopForm.chefName || ''}
                                    onChange={(e) => setShopForm({ ...shopForm, chefName: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">厨师照片 (URL)</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={shopForm.chefImage || ''}
                                    onChange={(e) => setShopForm({ ...shopForm, chefImage: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                                {shopForm.chefImage && <img src={shopForm.chefImage} alt="Chef" className="h-20 w-20 mt-2 rounded-full object-cover border-2 border-white shadow-sm" />}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">厨师介绍</label>
                                <textarea
                                    value={shopForm.chefIntro || ''}
                                    onChange={(e) => setShopForm({ ...shopForm, chefIntro: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <Store className="h-5 w-5 mr-2 text-orange-600" /> 菜单管理
                            </h2>
                            <button
                                onClick={handleAddDish}
                                className="text-sm bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 font-medium flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-1" /> 添加菜品
                            </button>
                        </div>

                        <div className="space-y-4">
                            {shopForm.dishes?.map((dish, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 items-start">
                                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-12 gap-4 w-full">
                                        <div className="sm:col-span-4">
                                            <input
                                                type="text"
                                                placeholder="菜品名称"
                                                value={dish.name}
                                                onChange={(e) => handleUpdateDish(idx, 'name', e.target.value)}
                                                className="w-full text-sm rounded border border-gray-300 p-2"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <input
                                                type="number"
                                                placeholder="价格"
                                                value={dish.price}
                                                onChange={(e) => handleUpdateDish(idx, 'price', Number(e.target.value))}
                                                className="w-full text-sm rounded border border-gray-300 p-2"
                                            />
                                        </div>
                                        <div className="sm:col-span-6">
                                            <input
                                                type="text"
                                                placeholder="菜品图片 URL"
                                                value={dish.image || ''}
                                                onChange={(e) => handleUpdateDish(idx, 'image', e.target.value)}
                                                className="w-full text-sm rounded border border-gray-300 p-2"
                                            />
                                        </div>
                                        <div className="sm:col-span-12">
                                            <input
                                                type="text"
                                                placeholder="菜品描述"
                                                value={dish.description || ''}
                                                onChange={(e) => handleUpdateDish(idx, 'description', e.target.value)}
                                                className="w-full text-sm rounded border border-gray-300 p-2 text-gray-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        {dish.image ? <img src={dish.image} alt="Dish" className="w-12 h-12 rounded object-cover bg-gray-200" /> : <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400"><ImageIcon className="h-6 w-6" /></div>}
                                        <button onClick={() => handleDeleteDish(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white pb-2">
                            <button
                                onClick={handleSaveShop}
                                disabled={savingShop}
                                className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-lg font-bold transition-transform active:scale-95"
                            >
                                {savingShop ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                                保存店铺设置
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchantDashboard;
