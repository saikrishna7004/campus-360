import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import useCartStore from '../../store/cartStore'

interface Product {
    id: number
    name: string
    price: number
}

const Canteen: React.FC = () => {
    const { products, cart, addProduct, addToCart, removeFromCart, clearCart } = useCartStore()
    const [refreshing, setRefreshing] = useState(false)
    const router = useRouter()

    const menuItems: Product[] = [
        { id: 1, name: 'Burger', price: 50 },
        { id: 2, name: 'Pizza', price: 100 },
        { id: 3, name: 'Pasta', price: 80 },
        { id: 4, name: 'Sandwich', price: 40 },
        { id: 5, name: 'French Fries', price: 30 },
        { id: 6, name: 'Sushi', price: 150 },
        { id: 7, name: 'Ice Cream', price: 25 },
        { id: 8, name: 'Coke', price: 15 },
        { id: 9, name: 'Cheeseburger', price: 60 },
        { id: 10, name: 'Veg Wrap', price: 45 },
        { id: 11, name: 'Chicken Wings', price: 120 },
        { id: 12, name: 'Caesar Salad', price: 75 },
        { id: 13, name: 'Spring Rolls', price: 40 },
        { id: 14, name: 'Noodles', price: 90 },
        { id: 15, name: 'Smoothie', price: 55 },
        { id: 16, name: 'Frappuccino', price: 70 },
        { id: 17, name: 'Hot Dog', price: 50 },
        { id: 18, name: 'Grilled Cheese', price: 65 },
        { id: 19, name: 'Falafel', price: 50 },
        { id: 20, name: 'Lemonade', price: 20 },
    ]

    useEffect(() => {
        menuItems.forEach((item) => addProduct(item))
    }, [])

    const placeOrder = () => {
        if (cart.length === 0) {
            Alert.alert('Error', 'Your cart is empty!')
            return
        }
        Alert.alert('Order Placed', `You have ordered ${cart.length} items.`)
        clearCart()
    }

    const onRefresh = () => {
        setRefreshing(true)
        menuItems.forEach((item) => addProduct(item))
        setRefreshing(false)
    }

    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black p-4">
            <Text className="text-3xl font-bold text-black dark:text-white mb-4">Canteen Menu</Text>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const itemInCart = cart.find((cartItem) => cartItem.id === item.id)

                    return (
                        <View className="flex-row justify-between items-center mb-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-black dark:text-white">{item.name}</Text>
                                <Text className="text-md font-bold text-black dark:text-white">${item.price}</Text>
                            </View>
                            <View className="flex-row items-center space-x-2">
                                {itemInCart ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => removeFromCart(item.id)}
                                            className="px-4 py-2 bg-red-500 dark:bg-red-700 text-white rounded-lg"
                                        >
                                            <Text className="text-white text-sm">-</Text>
                                        </TouchableOpacity>
                                        <Text className="text-lg px-3 text-black dark:text-white">{itemInCart.quantity}</Text>
                                        <TouchableOpacity
                                            onPress={() => addToCart(item)}
                                            className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded-lg"
                                        >
                                            <Text className="text-white text-sm">+</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => addToCart(item)}
                                        className="px-4 py-2 bg-green-500 dark:bg-green-700 text-white rounded-lg"
                                    >
                                        <Text className="text-white text-sm">Add</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )
                }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#00f']} />
                }
            />
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 shadow-lg">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl text-black dark:text-white">Cart ({cart.length})</Text>
                    <Text className="text-lg text-black dark:text-white">${totalPrice}</Text>
                </View>
                <View className="flex-row justify-between items-center mb-2 gap-2">
                    <TouchableOpacity
                        onPress={() => router.push('/cart')}
                        className="w-1/2 py-2 bg-green-500 dark:bg-green-700 rounded-lg"
                    >
                        <Text className="text-white text-center text-lg">View Cart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={placeOrder}
                        className="w-1/2 py-2 bg-blue-500 dark:bg-blue-700 rounded-lg"
                    >
                        <Text className="text-white text-center text-lg">Place Order</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Canteen
