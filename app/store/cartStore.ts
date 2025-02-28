import { create } from 'zustand'

interface Product {
    id: number
    name: string
    price: number
}

interface CartItem extends Product {
    quantity: number
}

interface CartStore {
    products: Product[]
    cart: CartItem[]
    addProduct: (product: Product) => void
    addToCart: (product: Product) => void
    removeFromCart: (productId: number) => void
    clearCart: () => void
}

const useCartStore = create<CartStore>((set) => ({
    products: [],
    cart: [],
    addProduct: (product: Product) => set((state: { products: Product[] }) => ({ products: [...state.products, product] })),
    addToCart: (product: { id: any }) => set((state: { cart: any[] }) => {
        const itemIndex = state.cart.findIndex((item) => item.id === product.id)
        if (itemIndex >= 0) {
            const updatedCart = [...state.cart]
            updatedCart[itemIndex].quantity += 1
            return { cart: updatedCart }
        } else {
            return { cart: [...state.cart, { ...product, quantity: 1 }] }
        }
    }),
    removeFromCart: (productId: any) => set((state: { cart: any[] }) => ({
        cart: state.cart.filter((item) => item.id !== productId)
    })),
    clearCart: () => set({ cart: [] })
}))

export default useCartStore
