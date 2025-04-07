import { create } from 'zustand';
import axios from 'axios';
import { VendorType } from './cartStore';

export interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    _id: string;
    orderId: string;
    user: string;
    vendor: VendorType;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    status: 'preparing' | 'ready' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    estimatedDeliveryTime?: string;
    deliveryLocation?: string;
}

interface OrderStore {
    orders: Order[];
    activeOrders: Order[];
    orderHistory: Order[];
    loading: boolean;
    error: string | null;
    lastFetchTime: string | null;
    fetchOrders: (authHeader: any) => Promise<void>;
    fetchOrderHistory: (authHeader: any) => Promise<void>;
    fetchNewOrders: (authHeader: any) => Promise<Order[]>;
    fetchOrderById: (orderId: string, authHeader: any) => Promise<Order | null>;
    placeOrder: (
        items: OrderItem[], 
        totalAmount: number, 
        vendor: VendorType,
        authHeader: any
    ) => Promise<string>;
    updateOrderStatus: (
        orderId: string, 
        status: 'preparing' | 'ready' | 'completed' | 'cancelled', 
        authHeader: any
    ) => Promise<void>;
    trackOrder: (orderId: string, authHeader: any) => Promise<Order | null>;
}

const useOrderStore = create<OrderStore>((set, get) => ({
    orders: [],
    activeOrders: [],
    orderHistory: [],
    loading: false,
    error: null,
    lastFetchTime: null,
    
    fetchOrders: async (authHeader) => {
        set({ loading: true });
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/orders/admin`, {
                headers: authHeader
            });
            set({ 
                orders: response.data,
                loading: false,
                lastFetchTime: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            set({ loading: false });
        }
    },
    
    fetchOrderHistory: async (authHeader) => {
        if (!authHeader) {
            set({ 
                loading: false, 
                error: 'Authentication required',
                orderHistory: [],
                activeOrders: []
            });
            throw new Error('Authentication required');
        }

        set({ loading: true, error: null });
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/orders/history`,
                { headers: authHeader }
            );
            
            const orders = (response.data || []).map((order: Order) => ({
                ...order,
                vendor: order.vendor || 'default'
            }));
            
            set({ 
                orderHistory: orders.filter(
                    (order: Order) => order.status === 'completed' || order.status === 'cancelled'
                ),
                activeOrders: orders.filter(
                    (order: Order) => order.status === 'preparing' || order.status === 'ready'
                ),
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Failed to fetch order history:', error);
            set({ 
                loading: false, 
                orderHistory: [], 
                activeOrders: [],
                error: 'Failed to load orders. Please try again later.'
            });
            throw error;
        }
    },
    
    placeOrder: async (items, totalAmount, vendor, authHeader) => {
        set({ loading: true });
        try {
            const orderPayload = {
                items,
                totalAmount,
                vendor,
                paymentMethod: 'Google Pay UPI',
                status: 'preparing'
            };
            
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/orders`,
                orderPayload,
                {
                    headers: authHeader
                }
            );
            
            const newOrder = response.data;
            
            set(state => ({
                activeOrders: [newOrder, ...state.activeOrders],
                loading: false
            }));
            
            return response.data.orderId;
        } catch (error) {
            set({ loading: false });
            throw new Error('Failed to place order');
        }
    },
    
    fetchNewOrders: async (authHeader) => {
        const { lastFetchTime } = get();
        if (!lastFetchTime) {
            await get().fetchOrders(authHeader);
            return get().orders;
        }
        
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/orders/admin`, {
                headers: authHeader,
                params: { lastFetchTime }
            });
            
            const newOrders = response.data;
            
            if (newOrders.length > 0) {
                set(state => {
                    const updatedOrders = [...state.orders];
                    
                    newOrders.forEach((newOrder: Order) => {
                        const existingOrderIndex = updatedOrders.findIndex((order) => order._id === newOrder._id);
                        
                        if (existingOrderIndex >= 0) {
                            updatedOrders[existingOrderIndex] = newOrder;
                        } else {
                            updatedOrders.unshift(newOrder);
                        }
                    });
                    
                    return {
                        orders: updatedOrders.filter(order => 
                            order.status === 'preparing' || order.status === 'ready'
                        ),
                        lastFetchTime: new Date().toISOString()
                    };
                });
            }
            
            return newOrders;
        } catch (error) {
            console.error('Failed to fetch new orders:', error);
            return [];
        }
    },
    
    fetchOrderById: async (orderId, authHeader) => {
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/orders/${orderId}`,
                { headers: authHeader }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch order by ID:', error);
            return null;
        }
    },
    
    updateOrderStatus: async (orderId, status, authHeader) => {
        if (!authHeader) {
            throw new Error('Authentication required');
        }

        try {
            const response = await axios.patch(
                `${process.env.EXPO_PUBLIC_API_URL}/orders/${orderId}/status`,
                { status },
                {
                    headers: {
                        ...authHeader,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update order status');
            }

            const updatedOrder = response.data.order;
            
            set(state => {
                const updatedOrders = state.orders.map(order =>
                    order._id === orderId ? updatedOrder : order
                );
                
                const updatedActiveOrders = state.activeOrders.map(order =>
                    order._id === orderId ? updatedOrder : order
                );
                
                let updatedOrderHistory = [...state.orderHistory];
                
                if (status === 'completed' || status === 'cancelled') {
                    updatedOrderHistory = [
                        updatedOrder,
                        ...updatedOrderHistory.filter(o => o._id !== orderId)
                    ];
                }
                
                return {
                    orders: updatedOrders.filter(order => 
                        !['completed', 'cancelled'].includes(order.status)
                    ),
                    activeOrders: updatedActiveOrders.filter(order => 
                        !['completed', 'cancelled'].includes(order.status)
                    ),
                    orderHistory: updatedOrderHistory
                };
            });
        } catch (error: any) {
            console.error('Failed to update order status:', error);
            throw new Error(error?.response?.data?.message || 'Failed to update order status');
        }
    },
    
    trackOrder: async (orderId, authHeader) => {
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/orders/${orderId}/track`,
                { headers: authHeader }
            );
            
            const trackedOrder = response.data;
            
            set(state => {
                const updatedActiveOrders = state.activeOrders.map(order =>
                    order._id === trackedOrder._id ? trackedOrder : order
                );
                
                return {
                    activeOrders: updatedActiveOrders
                };
            });
            
            return trackedOrder;
        } catch (error) {
            console.error('Failed to track order:', error);
            return null;
        }
    }
}));

export default useOrderStore;
