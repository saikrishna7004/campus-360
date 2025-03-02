import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import useCartStore from '@/store/cartStore'
import { FontAwesome } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const Cart = () => {
    const { cart, clearCart } = useCartStore()
    const router = useRouter()

    const totalPrice = cart.reduce((acc: number, item: { price: number; quantity: number }) => acc + item.price * item.quantity, 0)

    if (cart && cart?.length == 0) return null;

    return (
        <SafeAreaView className="relative flex-1 mb-4 mx-2">
            <View className="absolute bottom-0 left-0 right-0 px-4 py-2 rounded-xl bg-white" style={{boxShadow: '0px 0px 15px #0a0a0a2e'}}>
                <View className="flex-row justify-between">
                    <View className="flex-row items-center gap-x-2">
                        <Image className='w-[40px] h-[40px] rounded-full' source={{ uri: 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg' }}/>
                        <View>
                            <Text className="text-[16px] font-semibold">Canteen Order</Text>
                            <Text className="text-sm text-zinc-700">Total: ₹{totalPrice}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-x-2">
                        <TouchableOpacity className="bg-green-700 px-2 py-1 rounded-lg" onPress={() => router.push('/cart')}>
                            <Text className="text-white font-semibold">View Cart</Text>
                            <Text className="text-zinc-100 text-xs text-center">{cart.length} items</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-gray-50 p-2 rounded-full" onPress={clearCart}>
                            <FontAwesome name="times" color='gray' />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    ) 
}

export default Cart
