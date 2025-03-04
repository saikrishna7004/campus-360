import { create } from 'zustand'

interface Product {
    _id: number
    name: string
    price: number
}

interface CartItem extends Product {
    quantity: number
}

interface CartStore {
    cart: CartItem[]
    addToCart: (product: Product) => void
    removeFromCart: (productId: Product) => void
    clearCart: () => void
}

const useCartStore = create<CartStore>((set) => ({
    cart: [],
    addToCart: (product) => set((state) => {
        const itemIndex = state.cart.findIndex((item) => item._id === product._id)
        if (itemIndex >= 0) {
            const updatedCart = [...state.cart]
            updatedCart[itemIndex].quantity += 1
            return { cart: updatedCart }
        } else {
            return { cart: [...state.cart, { ...product, quantity: 1 }] }
        }
    }),
    removeFromCart: (product) => set((state) => {
        const itemIndex = state.cart.findIndex((item) => item._id === product._id)
        if (itemIndex >= 0) {
            const updatedCart = [...state.cart]
            updatedCart[itemIndex].quantity -= 1
            if (updatedCart[itemIndex].quantity === 0) {
                updatedCart.splice(itemIndex, 1)
            }
            return { cart: updatedCart }
        }
        return { cart: state.cart }
    }),
    clearCart: () => set({ cart: [] })
}))

export default useCartStore
