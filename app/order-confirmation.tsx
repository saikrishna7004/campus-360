import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { FontAwesome } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as NavigationBar from 'expo-navigation-bar'
import * as Animatable from 'react-native-animatable'

interface OrderItem {
    name: string
    quantity: number
    price: number
}

const OrderConfirmation = () => {
    const router = useRouter()
    const params = useLocalSearchParams()

    const orderId = params.orderId as string
    const totalAmount = parseFloat(params.totalAmount as string)
    const orderItems = params.items ? JSON.parse(params.items as string) as OrderItem[] : []

    NavigationBar.setButtonStyleAsync("dark")
    NavigationBar.setBackgroundColorAsync("white")

    const goToHome = () => {
        router.push('/')
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />

            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
                <Animatable.View
                    animation="fadeIn"
                    duration={1000}
                    className="items-center mt-10 mb-6"
                >
                    <Animatable.View
                        animation="zoomIn"
                        duration={800}
                        className="bg-green-100 rounded-full p-5 mb-4"
                    >
                        <FontAwesome name="check" size={50} color="#22c55e" />
                    </Animatable.View>

                    <Text className="text-2xl font-bold text-green-700 mb-2">Order Placed!</Text>
                    <Text className="text-gray-600 text-center mb-4">
                        Your order has been successfully placed and will be ready shortly.
                    </Text>

                    <View className="bg-gray-100 px-5 py-3 rounded-lg mb-6 w-full">
                        <Text className="text-gray-500 text-sm">ORDER ID</Text>
                        <Text className="text-xl font-semibold">{orderId}</Text>
                    </View>
                </Animatable.View>

                <View className="bg-gray-50 rounded-xl p-4 mb-6">
                    <Text className="font-bold text-lg mb-3">Order Summary</Text>

                    {orderItems.map((item, index) => (
                        <View key={index} className="flex-row justify-between py-2 border-b border-gray-200">
                            <View className="flex-1 pr-2">
                                <Text className="text-gray-800">
                                    {item.quantity} x {item.name}
                                </Text>
                            </View>
                            <Text className="text-gray-800 text-right min-w-[60px]">₹{(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}

                    <View className="flex-row justify-between mt-3 pt-2">
                        <Text className="font-bold">Total</Text>
                        <Text className="font-bold">₹{totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                <View className="bg-gray-50 rounded-xl p-4 mb-6">
                    <Text className="font-bold text-lg mb-3">Estimated Delivery</Text>
                    <View className="flex-row items-center">
                        <FontAwesome name="clock-o" size={24} color="green" className="mr-3" />
                        <View>
                            <Text className="text-lg font-medium">10-15 minutes</Text>
                            <Text className="text-gray-500">Your order will be ready soon!</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View className="px-6 py-4 border-t border-gray-200">
                <TouchableOpacity
                    onPress={goToHome}
                    className="bg-green-700 py-4 rounded-xl items-center"
                >
                    <Text className="text-white font-bold text-lg">Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default OrderConfirmation
