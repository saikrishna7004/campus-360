import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import fetchWithHeader from '@/utils/fetchWithHeader';

const VENDOR_TYPES = ['canteen', 'stationery', 'default'] as const;
type VendorType = typeof VENDOR_TYPES[number];

interface CartItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    vendor: VendorType;
}

interface VendorCart {
    vendor: VendorType;
    items: CartItem[];
}

interface CartStore {
    carts: VendorCart[];
    loading: boolean;
    error: string | null;
    authHeader?: () => any;
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string, vendor: string) => void;
    increaseQuantity: (id: string, vendor: string) => void;
    decreaseQuantity: (id: string, vendor: string) => void;
    clearCart: (vendor?: string) => void;
    syncCartToCloud: (authHeader: any) => Promise<void>;
    fetchCartFromCloud: (authHeader: any) => Promise<void>;
    getCartByVendor: (vendor: string) => CartItem[];
    getVendorCarts: () => VendorCart[];
    getTotalItems: () => number;
}

const syncCartWithCloud = async (get: any, set: any) => {
    try {
        const authHeader = useAuthStore.getState().getAuthHeader();
        if (authHeader) {
            await fetchWithHeader(`${process.env.EXPO_PUBLIC_API_URL}/cart/sync`, 'post', {
                carts: get().carts || []
            });
            set({ loading: false });
        } else {
            set({ loading: false, error: 'No authentication header available' });
        }
    } catch (error) {
        set({ error: 'Failed to sync cart to cloud' });
    }
};

const useCartStore = create<CartStore>((set, get) => ({
    carts: [],
    loading: false,
    error: null,

    addToCart: (item) => {
        set((state) => {
            const vendor = item.vendor || 'default';
            const existingCartIndex = state.carts.findIndex(cart => cart.vendor === vendor);

            if (existingCartIndex >= 0) {
                const updatedCarts = [...state.carts];
                const existingCart = updatedCarts[existingCartIndex];
                const existingItemIndex = existingCart.items.findIndex(cartItem => cartItem._id === item._id);

                if (existingItemIndex >= 0) {
                    existingCart.items[existingItemIndex].quantity += 1;
                } else {
                    existingCart.items.push({
                        ...item,
                        quantity: 1,
                        imageUrl: item.imageUrl || 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg',
                    });
                }

                return { carts: updatedCarts };
            }

            return {
                carts: [
                    ...state.carts,
                    {
                        vendor,
                        items: [{
                            ...item,
                            quantity: 1,
                            imageUrl: item.imageUrl || 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg',
                        }],
                    },
                ],
            };
        });

        syncCartWithCloud(get, set);
    },

    removeFromCart: (id, vendor) => {
        set((state) => ({
            carts: state.carts.map(cart =>
                cart.vendor === vendor
                    ? { ...cart, items: cart.items.filter(item => item._id !== id) }
                    : cart
            ).filter(cart => cart.items.length > 0)
        }));

        syncCartWithCloud(get, set);
    },

    increaseQuantity: (id, vendor) => {
        set((state) => ({
            carts: state.carts.map(cart =>
                cart.vendor === vendor
                    ? {
                        ...cart,
                        items: cart.items.map(item =>
                            item._id === id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    }
                    : cart
            )
        }));

        syncCartWithCloud(get, set);
    },

    decreaseQuantity: (id, vendor) => {
        set((state) => ({
            carts: state.carts.map(cart =>
                cart.vendor === vendor
                    ? {
                        ...cart,
                        items: cart.items.map(item =>
                            item._id === id
                                ? { ...item, quantity: item.quantity - 1 }
                                : item
                        ).filter(item => item.quantity > 0)
                    }
                    : cart
            ).filter(cart => cart.items.length > 0)
        }));

        syncCartWithCloud(get, set);
    },

    clearCart: (vendor) => {
        set((state) => ({
            carts: vendor
                ? state.carts.filter(cart => cart.vendor !== vendor)
                : []
        }));

        syncCartWithCloud(get, set);
    },

    syncCartToCloud: async () => {
        set({ loading: true, error: null });
        try {
            await fetchWithHeader(`${process.env.EXPO_PUBLIC_API_URL}/cart/sync`, 'post', {
                carts: get().carts || []
            });
            set({ loading: false });
        } catch (error) {
            set({ loading: false, error: 'Failed to sync cart to cloud' });
        }
    },

    fetchCartFromCloud: async (authHeader) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/cart/latest`,
                { headers: authHeader }
            );
            if (response.data?.cart) {
                const groupedCarts: Record<VendorType, CartItem[]> = response.data.cart.items.reduce((acc: Record<VendorType, CartItem[]>, cartItem: any) => {
                    const vendor = cartItem.item.type || 'default';
                    if (!acc[vendor as VendorType]) {
                        acc[vendor as VendorType] = [];
                    }
                    acc[vendor as VendorType].push({
                        _id: cartItem.item._id,
                        name: cartItem.item.name,
                        price: cartItem.item.price,
                        quantity: cartItem.quantity,
                        imageUrl: cartItem.item.imageUrl || cartItem.item.image,
                        vendor: vendor as VendorType,
                    });
                    return acc;
                }, {} as Record<VendorType, CartItem[]>);

                const normalizedCarts: VendorCart[] = Object.entries(groupedCarts).map(([vendor, items]) => ({
                    vendor: vendor as VendorType,
                    items,
                }));

                set({ carts: normalizedCarts, loading: false });
            } else {
                set({ carts: [], loading: false });
            }
        } catch (error: any) {
            console.error('Error fetching latest cart:', error.response?.data || error.message);
            set({ loading: false, error: 'Failed to fetch cart from cloud' });
        }
    },

    getCartByVendor: (vendor) => {
        const cart = get().carts.find(cart => cart.vendor === vendor);
        return cart ? cart.items : [];
    },

    getVendorCarts: () => get().carts,

    getTotalItems: () => get().carts.reduce((total, cart) =>
        total + cart.items.reduce((sum, item) => sum + parseFloat((item.quantity * item.price).toFixed(2)), 0), 0)
}));

export default useCartStore;
export type { CartItem, VendorCart, VendorType };
