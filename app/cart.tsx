import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Alert, ScrollView, RefreshControl, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import useCartStore from '@/store/cartStore'
import { StatusBar } from 'expo-status-bar'
import { FontAwesome } from '@expo/vector-icons'
import CartProduct from '@/components/CartProduct'
import * as NavigationBar from 'expo-navigation-bar';
import { useRouter } from 'expo-router'

const Cart = () => {
    const { cart, clearCart } = useCartStore()
    const [refreshing, setRefreshing] = useState(false)
    const router = useRouter()

    NavigationBar.setButtonStyleAsync("dark");
    NavigationBar.setBackgroundColorAsync("white");

    const placeOrder = () => {
        if (cart.length === 0) {
            Alert.alert('Error', 'Your cart is empty!')
            return
        }
        Alert.alert('Order Placed', `You have ordered ${cart.length} items.`)
        clearCart()
    }

    useEffect(() => {
        if (cart.length === 0) {
            router.back()
        }
    }, [cart])

    const onRefresh = () => {
        setRefreshing(true)
        setRefreshing(false)
    }

    const totalPrice = cart.reduce((acc: number, item: { price: number; quantity: number }) => acc + item.price * item.quantity, 0)

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar style="inverted" />
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#00f']} />
                }
                contentContainerStyle={{ paddingBottom: 340 }}
            >
                <View className="flex mx-3 mb-4 bg-white rounded-2xl">
                    {cart.map((item) => {
                        return (
                            <CartProduct key={item._id} item={item} />
                        )
                    })}
                </View>
                <View className="flex flex-row mx-3 mb-4 bg-white rounded-2xl p-4">
                    <View className="flex flex-row justify-between items-center mb-4">
                        <FontAwesome name='clock-o' size={24} color='green' />
                    </View>
                    <View>
                        <View className="flex flex-row items-center px-4">
                            <Text className="text-gray-800 me-1">Delivery in</Text>
                            <Text className="font-bold text-gray-800">10 min</Text>
                        </View>
                        <View className="flex flex-row justify-between items-center px-4 mt-1">
                            <Text className="font-medium text-gray-800">Schedule for later</Text>
                        </View>
                    </View>
                </View>
                <View className="flex mx-3 bg-white rounded-2xl py-4">
                    <View className="flex flex-row justify-between items-center px-4 mb-4">
                        <Text className="text-gray-800">Subtotal</Text>
                        <Text className="font-medium text-gray-800">₹{totalPrice}.00</Text>
                    </View>
                    <View className="flex flex-row justify-between items-center px-4">
                        <Text className="text-gray-800">Platform Fee</Text>
                        <Text className="font-medium text-gray-800">₹2.00</Text>
                    </View>
                    <View className="flex flex-row justify-between items-center px-4 mt-4">
                        <View className="border-t border-gray-200 w-[50%]"></View>
                        <View className="border-t border-gray-200 w-[50%]"></View>
                    </View>
                    <View className="flex flex-row justify-between items-center px-4 mt-4">
                        <Text className="text-gray-800">Total</Text>
                        <Text className="font-medium text-gray-800">₹{totalPrice + 2}.00</Text>
                    </View>
                </View>
                <View className='p-4 gap-1'>
                    <Text className="tracking-[2px] font-medium text-slate-500">CANCELLATION POLICY</Text>
                    <Text className="tracking-wide text-xs text-slate-500">To fairly compensate our canteen staff, we request you to cancel your order within 30 seconds of placing it. After that, you will be charged 50% of the total amount.</Text>
                </View>
            </ScrollView>
            <View className="absolute bottom-0 left-0 right-0 pt-4 pb-2 px-2 rounded-t-xl bg-white" style={{ boxShadow: '0px 0px 10px #0a0a0a2e' }}>
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex flex-col ps-2 pb-3">
                        <View className="flex flex-row items-center gap-1">
                            <View className="flex flex-col items-center justify-center object-cover rounded-full h-8 me-1">
                                <Image className="rounded-full" source={{ uri: 'https://www.srcu4u.com/creditunion/wp-content/uploads/2019/07/Google-Pay-Logo-01.png' }} width={30} height={15} />
                            </View>
                            <Text className="text-xs font-medium text-gray-500">PAY USING</Text>
                            <Text className="font-medium text-gray-800 -rotate-90"><FontAwesome className='ms-2' name='caret-right' size={16} color='gray' /></Text>
                        </View>
                        <Text className="text-sm font-medium text-gray-800 tracking-wider">Google Pay UPI</Text>
                    </View>
                    <TouchableOpacity
                        onPress={placeOrder}
                        className="w-[60%] py-3 bg-green-800 rounded-lg px-4 flex flex-row justify-between items-center"
                    >
                        <View className="flex fl0x-col">
                            <Text className="font-medium text-white">₹{totalPrice + 2}.00</Text>
                            <Text className="text-xs text-gray-200">TOTAL</Text>
                        </View>
                        <View className="flex flex-row gap-2">
                            <Text className="text-white text-center text-lg">Place Order</Text>
                            <Text className="text-white text-center text-lg"><FontAwesome className='ms-2' name='caret-right' size={20} /></Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Cart
