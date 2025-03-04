import useCartStore from '@/store/cartStore'
import { FontAwesome } from '@expo/vector-icons'
import { View, Text, TouchableOpacity } from 'react-native'

interface CartProductItem {
    _id: number
    name: string
    price: number
    category?: string
}

const CartProduct = ({ item }: { item: CartProductItem }) => {
    const { cart, addToCart, removeFromCart } = useCartStore()
    const itemInCart = cart.find((cartItem) => cartItem._id === item._id)

    return (
        <View className="flex-row justify-between items-center ps-2 pe-4 py-2 my-2">
            <FontAwesome className='ps-2' name="leaf" size={20} color="green" />
            <View className="flex-1 px-4">
                <Text className="font-semibold pb-1 text-black">{item.name}</Text>
                <Text className="text-md text-black">₹{item.price}</Text>
            </View>
            <View className="flex-row items-center space-x-2">
                {itemInCart ? (
                    <View className='flex flex-row border border-green-700 rounded-md items-center justify-center bg-green-50'>
                        <TouchableOpacity
                            onPress={() => removeFromCart(item)}
                            className="px-3 py-1 text-green-700 rounded-lg"
                        >
                            <Text className="text-green-700 font-bold">-</Text>
                        </TouchableOpacity>
                        <Text className="text-lg px-1 text-black">{itemInCart.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => addToCart(item)}
                            className="px-3 py-1 text-green-700 rounded-lg"
                        >
                            <Text className="text-green-700 font-bold">+</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => addToCart(item)}
                        className='flex flex-row pe-3 ps-4 py-1 border border-green-700 rounded-md items-center justify-center bg-green-50'
                    >
                        <View className='text-green-700 gap-2 flex flex-row justify-center items-center'>
                            <Text className='text-green-700 text-xs font-semibold ps-1 leading-5'>ADD</Text>
                            <Text className='text-green-700 text-lg ps-1 leading-5'>+</Text>
                        </View>
                    </TouchableOpacity>

                )}
            </View>
        </View>
    )
}

export default CartProduct
export type { CartProductItem }