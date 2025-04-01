import useCartStore from '@/store/cartStore'
import { FontAwesome } from '@expo/vector-icons'
import { View, Text, TouchableOpacity } from 'react-native'

interface CartProductItem {
    _id: string
    name: string
    price: number
    category?: string
    vendor: string
}

const CartProduct = ({ item }: { item: CartProductItem }) => {
    const { getCartByVendor, addToCart, decreaseQuantity } = useCartStore()
    
    const vendor: 'canteen' | 'stationery' | 'default' = (item.vendor as 'canteen' | 'stationery' | 'default') || 'default'
    const cart = getCartByVendor(vendor)
    const itemInCart = cart.find((cartItem) => cartItem._id === item._id)

    const handleAddToCart = () => {
        addToCart({
            _id: item._id,
            name: item.name,
            price: item.price,
            vendor
        })
    }

    if (!itemInCart) {
        return null;
    }

    return (
        <View className="flex-row justify-between items-center ps-2 pe-4 py-2 my-2">
            <FontAwesome className='ps-2' name="leaf" size={20} color="green" />
            <View className="flex-1 px-4">
                <Text className="font-semibold pb-1 text-black">{item.name}</Text>
                <Text className="text-md text-black">₹{item.price}</Text>
            </View>
            <View className="flex-row items-center space-x-2">
                <View className='flex flex-row border border-green-700 rounded-md items-center justify-center bg-green-50'>
                    <TouchableOpacity
                        onPress={() => decreaseQuantity(item._id, vendor)}
                        className="px-3 py-1 text-green-700 rounded-lg"
                    >
                        <Text className="text-green-700 font-bold">-</Text>
                    </TouchableOpacity>
                    <Text className="text-lg px-1 text-black">{itemInCart.quantity}</Text>
                    <TouchableOpacity
                        onPress={handleAddToCart}
                        className="px-3 py-1 text-green-700 rounded-lg"
                    >
                        <Text className="text-green-700 font-bold">+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default CartProduct
export type { CartProductItem }