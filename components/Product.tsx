import useCartStore from '@/store/cartStore'
import { FontAwesome } from '@expo/vector-icons'
import { View, Image, Text, TouchableOpacity } from 'react-native'

interface ProductItem {
    id: number
    name: string
    price: number
    category: string
}

const Product = ({ item }: { item: ProductItem }) => {
    const { cart, addToCart, removeFromCart } = useCartStore()
    const itemInCart = cart.find((cartItem) => cartItem.id === item.id)

    return (
        <View className="flex-row justify-between items-center px-4 py-2">
            <Image className="rounded-lg" width={60} height={60} source={{ uri: 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg' }} />
            <View className="flex-1 px-4">
                <Text className="font-semibold pb-1 text-black">{item.name}</Text>
                <Text className="text-md text-black">₹{item.price}</Text>
            </View>
            <View className="flex-row items-center space-x-2">
                {itemInCart ? (
                    <View className='flex flex-row border border-green-800 rounded-lg items-center justify-center bg-green-700'>
                        <TouchableOpacity
                            onPress={() => removeFromCart(item)}
                            className="px-4 py-1 text-white rounded-lg"
                        >
                            <Text className="text-white text-lg font-bold">-</Text>
                        </TouchableOpacity>
                        <Text className="text-lg px-1 text-white">{itemInCart.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => addToCart(item)}
                            className="px-4 py-1 text-white rounded-lg"
                        >
                            <Text className="text-white text-lg font-bold">+</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => addToCart(item)}
                        className='flex flex-row px-6 py-2 border border-green-800 rounded-lg items-center justify-center bg-green-50'
                    >
                        <View className='text-green-700 gap-2 text-lg font-bold flex flex-row justify-center items-center'>
                            <Text className='text-green-700 ps-1'>ADD</Text><FontAwesome name="plus" color='#166534' />
                        </View>
                    </TouchableOpacity>

                )}
            </View>
        </View>
    )
}

export default Product
export type { ProductItem }