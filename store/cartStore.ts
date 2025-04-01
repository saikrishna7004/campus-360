import { create } from 'zustand';
import axios from 'axios';

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
                    existingCart.items.push({ ...item, quantity: 1 });
                }
                
                return { carts: updatedCarts };
            }
            
            return {
                carts: [
                    ...state.carts,
                    {
                        vendor,
                        items: [{ ...item, quantity: 1 }]
                    }
                ]
            };
        });
    },
    
    removeFromCart: (id, vendor) => {
        set((state) => ({
            carts: state.carts.map(cart => 
                cart.vendor === vendor 
                    ? { ...cart, items: cart.items.filter(item => item._id !== id) }
                    : cart
            ).filter(cart => cart.items.length > 0)
        }));
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
    },
    
    clearCart: (vendor) => {
        set((state) => ({
            carts: vendor 
                ? state.carts.filter(cart => cart.vendor !== vendor)
                : []
        }));
    },
    
    syncCartToCloud: async (authHeader) => {
        set({ loading: true, error: null });
        try {
            await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/cart/sync`,
                { carts: get().carts },
                { headers: authHeader }
            );
            set({ loading: false });
        } catch (error) {
            set({ loading: false, error: 'Failed to sync cart to cloud' });
        }
    },
    
    fetchCartFromCloud: async (authHeader) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/cart`,
                { headers: authHeader }
            );
            if (response.data?.carts) {
                set({ carts: response.data.carts, loading: false });
            }
        } catch (error) {
            set({ loading: false, error: 'Failed to fetch cart from cloud' });
        }
    },
    
    getCartByVendor: (vendor) => {
        const cart = get().carts.find(cart => cart.vendor === vendor);
        return cart ? cart.items : [];
    },
    
    getVendorCarts: () => get().carts,
    
    getTotalItems: () => get().carts.reduce((total, cart) => 
        total + cart.items.reduce((sum, item) => sum + item.quantity, 0), 0)
}));

export default useCartStore;
export type { CartItem, VendorCart, VendorType };
