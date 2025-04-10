import { cn } from '@/lib/cn'
import useCartStore from '@/store/cartStore'
import { FontAwesome } from '@expo/vector-icons'
import { View, Text, TouchableOpacity, Image } from 'react-native'

interface CartProductItem {
    _id: string
    name: string
    price: number
    category?: string
    vendor: string
    imageUrl?: string
}

const CartProduct = ({ item, rootClassName, iconClassName }: { item: CartProductItem, rootClassName?: string, iconClassName?: string }) => {
    const { getCartByVendor, increaseQuantity, decreaseQuantity } = useCartStore()

    const vendor: 'canteen' | 'stationery' | 'default' = (item.vendor as 'canteen' | 'stationery' | 'default') || 'default'
    const cart = getCartByVendor(vendor)
    const itemInCart = cart.find((cartItem) => cartItem._id === item._id)

    if (!itemInCart) {
        return null;
    }

    return (
        <View className={cn("flex-row justify-between items-center px-4 py-2", rootClassName)}>
            <Image
                className={cn("rounded-lg h-[60px] w-[60px]", iconClassName)}
                width={60}
                height={60}
                source={{
                    uri: item.imageUrl || 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg',
                }}
            />
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
                    <Text className="px-1 text-black">{itemInCart.quantity}</Text>
                    <TouchableOpacity
                        onPress={() => increaseQuantity(item._id, vendor)}
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