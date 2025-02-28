import React from 'react'
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import useCartStore from '@/store/cartStore'

const Cart = () => {
    const { cart, clearCart } = useCartStore()
    const navigation = useNavigation()

    const placeOrder = () => {
        if (cart.length === 0) {
            Alert.alert('Error', 'Your cart is empty!')
            return
        }
        Alert.alert('Order Placed', `You have ordered ${cart.length} items.`)
        clearCart()
        navigation.goBack()
    }

    const totalPrice = cart.reduce((acc: number, item: { price: number; quantity: number }) => acc + item.price * item.quantity, 0)

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black p-4">
            <Text className="text-3xl font-bold text-black dark:text-white mb-4">Your Cart</Text>
            <FlatList
                data={cart}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="flex-row justify-between items-center mb-4 p-4 bg-white dark:bg-gray-800">
                        <View className="flex-1">
                            <Text className="text-lg text-black font-bold dark:text-white">{item.name}</Text>
                            <Text className="text-md text-black font-bold dark:text-white">${item.price}</Text>
                            <Text className="text-md text-black font-bold dark:text-white">Quantity: {item.quantity}</Text>
                        </View>
                    </View>
                )}
            />
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 shadow-lg">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl text-black dark:text-white">Total Price</Text>
                    <Text className="text-lg text-black dark:text-white">${totalPrice}</Text>
                </View>
                <TouchableOpacity
                    onPress={placeOrder}
                    className="w-full py-4 bg-blue-500 dark:bg-blue-700 rounded-lg"
                >
                    <Text className="text-white text-center text-lg">Place Order</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Cart
