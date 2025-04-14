import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import fetchWithHeader from '@/utils/fetchWithHeader';
import { PrintingOptions } from '@/components/PrintingOptionsModal';

const VENDOR_TYPES = ['canteen', 'stationery', 'default'] as const;
type VendorType = typeof VENDOR_TYPES[number];

interface CartItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    vendor: VendorType;
    imageUrl?: string;
    isPrintItem?: boolean;
    pricePerPageBW?: number;
    pricePerPageColor?: number;
    supportedSizes?: string[];
    printingOptions?: PrintingOptions;
}

interface VendorCart {
    vendor: VendorType;
    items: CartItem[];
}

interface DocumentItem {
    id: string;
    name: string;
    url: string;
    printingOptions: PrintingOptions;
    cartItemId?: string;
}

interface CartResponse {
    item: {
        _id: string;
        name: string;
        price: number;
        imageUrl?: string;
        image?: string;
        isPrintItem?: boolean;
        pricePerPageBW?: number;
        pricePerPageColor?: number;
        supportedSizes?: string[];
        printingOptions?: PrintingOptions;
    };
    quantity: number;
    vendor: VendorType;
}

interface CartStore {
    carts: VendorCart[];
    loading: boolean;
    error: string | null;
    authHeader?: () => any;
    documents: DocumentItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
    removeFromCart: (id: string, vendor: string) => void;
    increaseQuantity: (id: string, vendor: string) => void;
    decreaseQuantity: (id: string, vendor: string) => void;
    clearCart: (vendor?: string) => void;
    syncCartToCloud: (authHeader?: any) => Promise<void>;
    fetchCartFromCloud: (authHeader: any) => Promise<void>;
    getCartByVendor: (vendor: string) => CartItem[];
    getVendorCarts: () => VendorCart[];
    getTotalItems: () => number;
    addDocument: (document: DocumentItem) => void;
    removeDocument: (id: string) => void;
    getDocumentById: (id: string) => DocumentItem | undefined;
}

const useCartStore = create<CartStore>((set, get) => ({
    carts: [],
    loading: false,
    error: null,
    documents: [],

    addDocument: (document) => {
        set(state => ({
            documents: [...state.documents, document]
        }));
    },

    removeDocument: (id) => {
        set(state => {
            const newState = {
                documents: state.documents.filter(doc => doc.id !== id),
                carts: state.carts.map(cart => ({
                    ...cart,
                    items: cart.items.filter(item => !item.isPrintItem || item._id !== id)
                })).filter(cart => cart.items.length > 0)
            };
            get().syncCartToCloud();
            return newState;
        });
    },

    getDocumentById: (id) => {
        return get().documents.find(doc => doc.id === id);
    },

    addToCart: async (item) => {
        const uniqueId = item.isPrintItem ? `print_${new Date().getTime()}` : item._id;
        
        set((state) => {
            const vendor = item.vendor || 'default';
            const existingCartIndex = state.carts.findIndex(cart => cart.vendor === vendor);
            const newItem = {
                ...item,
                _id: uniqueId,
                quantity: 1
            };

            let newCarts;
            if (existingCartIndex >= 0) {
                newCarts = [...state.carts];
                newCarts[existingCartIndex].items.push(newItem);
            } else {
                newCarts = [
                    ...state.carts,
                    {
                        vendor,
                        items: [newItem]
                    }
                ];
            }

            return { carts: newCarts };
        });

        if (item.isPrintItem && item.printingOptions) {
            const document = {
                id: uniqueId,
                name: item.name,
                url: item.printingOptions.documentUrl || '',
                printingOptions: item.printingOptions,
                cartItemId: uniqueId
            };
            get().addDocument(document);
        }

        await get().syncCartToCloud();
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
        try {
            const header = authHeader || useAuthStore.getState().getAuthHeader();
            if (!header) throw new Error('No auth header available');

            const payload = {
                carts: get().carts,
                documents: get().documents
            };

            const { data } = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/cart/sync`,
                payload,
                { headers: header }
            );

            set({ error: null });
            return data;
        } catch (error) {
            console.error('Sync error:', error);
            set({ error: 'Failed to sync cart' });
            throw error;
        }
    },

    fetchCartFromCloud: async (authHeader) => {
        set({ loading: true });
        try {
            const { data } = await axios.get<{
                cart: {
                    items: Array<{
                        _id: string;
                        name: string;
                        price: number;
                        quantity: number;
                        vendor: string;
                        imageUrl?: string;
                        isPrintItem?: boolean;
                        printingOptions?: PrintingOptions;
                    }>;
                };
                documents: DocumentItem[];
            }>(`${process.env.EXPO_PUBLIC_API_URL}/cart/latest`, { headers: authHeader });

            if (!data?.cart?.items) {
                set({ carts: [], documents: [], loading: false });
                return;
            }

            const vendorGroups = data.cart.items.reduce<Record<VendorType, CartItem[]>>((acc, item) => {
                const vendor = (item.vendor || 'default') as VendorType;
                if (!acc[vendor]) acc[vendor] = [];
                
                const cartItem: CartItem = {
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1,
                    vendor,
                    imageUrl: item.imageUrl,
                    isPrintItem: item.isPrintItem,
                    printingOptions: item.printingOptions
                };
                
                acc[vendor].push(cartItem);
                return acc;
            }, {} as Record<VendorType, CartItem[]>);

            const normalizedCarts: VendorCart[] = Object.entries(vendorGroups)
                .map(([vendor, items]): VendorCart => ({
                    vendor: vendor as VendorType,
                    items
                }));

            set({
                carts: normalizedCarts,
                documents: data.documents || [],
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching cart:', error);
            set({ loading: false, error: 'Failed to fetch cart' });
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
export type { CartItem, VendorCart, VendorType, DocumentItem };
