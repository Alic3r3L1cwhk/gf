export enum UserRole {
    USER = 'user',
    MERCHANT = 'merchant',
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    token?: string;
}

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface OrderItem {
    name: string;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    username: string;
    shopId: string;
    shopName: string;
    content: string;
    aiAnalysis?: {
        summary: string;
        estimatedPrice: number;
        nutritionTip: string;
    };
    status: OrderStatus;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Dish {
    id: string;
    name: string;
    price: number;
    description?: string;
    image?: string;
}

export interface Shop {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    rating: number;
    deliveryTime: string;
    minPrice: number;
    image: string;
    chefName?: string;
    chefImage?: string;
    chefIntro?: string;
    dishes: Dish[];
}
