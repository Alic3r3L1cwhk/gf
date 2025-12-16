import { User, UserRole, Order, OrderStatus, Shop } from '../types';

const USERS_KEY = 'gf_study_users';
const ORDERS_KEY = 'gf_study_orders';
const SHOPS_KEY = 'gf_study_shops';
const CURRENT_USER_KEY = 'gf_study_current_user';

const getStorage = <T>(key: string, defaultVal: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
};

const setStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

(() => {
    if (!localStorage.getItem(USERS_KEY)) {
        const seeds: User[] = [
            { id: 'user-test-1', username: 'test', email: 'test@test.com', role: UserRole.USER, token: 'token-test' },
            { id: 'merchant-boss-1', username: 'boss', email: 'boss@test.com', role: UserRole.MERCHANT, token: 'token-boss' },
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(seeds));
    }

    if (!localStorage.getItem(SHOPS_KEY)) {
        const seedShops: Shop[] = [
            {
                id: 'shop-1',
                ownerId: 'merchant-boss-1',
                name: '老张面馆',
                description: '三十年老字号，手工拉面，汤鲜味美。',
                rating: 4.8,
                deliveryTime: '30分钟',
                minPrice: 20,
                image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800',
                chefName: '张师傅',
                chefImage: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=400',
                chefIntro: '面点世家传人，专注拉面40年。',
                dishes: [
                    { id: 'd-1-1', name: '招牌红烧牛肉面', price: 28, description: '大块牛肉，秘制汤底', image: 'https://images.unsplash.com/photo-1554502078-ef0fc409efce?auto=format&fit=crop&q=80&w=400' },
                    { id: 'd-1-2', name: '酸菜肉丝面', price: 22, description: '老坛酸菜，开胃爽口' },
                    { id: 'd-1-3', name: '葱油拌面', price: 15, description: '简单美味，葱香浓郁' },
                    { id: 'd-1-4', name: '手工煎饺(6个)', price: 12, description: '皮薄馅大，现煎现卖' },
                ],
            },
            {
                id: 'shop-2',
                ownerId: 'system-placeholder-1',
                name: '快乐汉堡屋',
                description: '美式风味，现烤肉饼，快乐加倍。',
                rating: 4.5,
                deliveryTime: '25分钟',
                minPrice: 30,
                image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800',
                dishes: [
                    { id: 'd-2-1', name: '经典芝士牛肉堡', price: 32, description: '双层芝士，澳洲牛肉', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
                    { id: 'd-2-2', name: '香辣鸡腿堡', price: 26, description: '酥脆多汁，香辣过瘾' },
                ],
            },
            {
                id: 'shop-3',
                ownerId: 'system-placeholder-2',
                name: '轻食沙拉派',
                description: '健康低脂，新鲜时蔬，减脂首选。',
                rating: 4.9,
                deliveryTime: '40分钟',
                minPrice: 35,
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
                dishes: [{ id: 'd-3-1', name: '鸡胸肉考伯沙拉', price: 38, description: '低温慢煮鸡胸肉，丰富配菜', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }],
            },
        ];
        localStorage.setItem(SHOPS_KEY, JSON.stringify(seedShops));
    }
})();

export const sendEmailCode = async (email: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    alert(`模拟邮件发送: 验证码是 ${code}`);
    return code;
};

export const registerUser = async (email: string, password: string, role: UserRole, username: string): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const users = getStorage<User[]>(USERS_KEY, []);

    if (users.find((u) => u.username === username)) throw new Error('该账号已被注册');
    if (users.find((u) => u.email === email)) throw new Error('该邮箱已被注册');

    const newUser: User = { id: Date.now().toString(), email, username, role, token: `mock-jwt-token-${Date.now()}` };

    users.push(newUser);
    setStorage(USERS_KEY, users);
    setStorage(CURRENT_USER_KEY, newUser);
    return newUser;
};

export const loginUser = async (username: string, password: string, role: UserRole): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const users = getStorage<User[]>(USERS_KEY, []);
    const user = users.find((u) => u.username === username);

    if (!user) throw new Error('账号不存在');

    const userWithToken = { ...user, role: user.role || role, token: `mock-jwt-token-${Date.now()}` };
    setStorage(CURRENT_USER_KEY, userWithToken);
    return userWithToken;
};

export const logoutUser = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
    return getStorage<User | null>(CURRENT_USER_KEY, null);
};

export const resetPassword = async (email: string, newPass: string, code: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const users = getStorage<User[]>(USERS_KEY, []);
    const userIdx = users.findIndex((u) => u.email === email);
    if (userIdx === -1) throw new Error('用户不存在');
    users[userIdx].token = `mock-reset-${Date.now()}`;
    setStorage(USERS_KEY, users);
    return true;
};

export const getShops = async (): Promise<Shop[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStorage<Shop[]>(SHOPS_KEY, []);
};

export const getMyShop = async (ownerId: string): Promise<Shop | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const shops = getStorage<Shop[]>(SHOPS_KEY, []);
    return shops.find((s) => s.ownerId === ownerId) || null;
};

export const saveMyShop = async (shopData: Shop): Promise<Shop> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const shops = getStorage<Shop[]>(SHOPS_KEY, []);

    const index = shops.findIndex((s) => s.id === shopData.id);
    if (index > -1) {
        shops[index] = shopData;
    } else {
        shops.push(shopData);
    }

    setStorage(SHOPS_KEY, shops);
    return shopData;
};

export const createOrder = async (
    orderData: Pick<Order, 'userId' | 'username' | 'content' | 'aiAnalysis' | 'shopId' | 'shopName'>,
): Promise<Order> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const orders = getStorage<Order[]>(ORDERS_KEY, []);

    const newOrder: Order = {
        id: Date.now().toString(),
        ...orderData,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    setStorage(ORDERS_KEY, orders);
    return newOrder;
};

export const getOrders = async (role: UserRole, userId: string): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const orders = getStorage<Order[]>(ORDERS_KEY, []);

    if (role === UserRole.MERCHANT) {
        const shops = getStorage<Shop[]>(SHOPS_KEY, []);
        const myShop = shops.find((s) => s.ownerId === userId);
        if (!myShop) return [];
        return orders.filter((o) => o.shopId === myShop.id);
    } else {
        return orders.filter((o) => o.userId === userId);
    }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const orders = getStorage<Order[]>(ORDERS_KEY, []);
    const index = orders.findIndex((o) => o.id === orderId);

    if (index === -1) throw new Error('订单未找到');

    orders[index].status = status;
    setStorage(ORDERS_KEY, orders);
    return orders[index];
};
