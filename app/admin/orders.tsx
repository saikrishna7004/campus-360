import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

type Item = {
    name: string;
    price: number;
    quantity: number;
};

type Order = {
    id: number;
    items: Item[];
};

type OrdersType = {
    preparing: Order[];
    ready: Order[];
};

const mockOrders: OrdersType = {
    preparing: [
        {
            id: 1,
            items: [
                { name: 'Burger', price: 5.99, quantity: 2 },
                { name: 'Fries', price: 2.99, quantity: 1 },
            ],
        },
        {
            id: 2,
            items: [
                { name: 'Pizza', price: 8.99, quantity: 1 },
                { name: 'Soda', price: 1.99, quantity: 2 },
            ],
        },
    ],
    ready: [
        {
            id: 3,
            items: [
                { name: 'Pasta', price: 7.49, quantity: 1 },
                { name: 'Garlic Bread', price: 3.49, quantity: 1 },
            ],
        },
        {
            id: 4,
            items: [
                { name: 'Salad', price: 4.49, quantity: 3 },
                { name: 'Water', price: 1.49, quantity: 1 },
            ],
        },
    ],
}

const Orders = () => {
    const [activeTab, setActiveTab] = useState<'preparing' | 'ready'>('preparing')

    const calculateTotalPrice = (items: Item[]) => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="inverted" />
            <View className="flex-row gap-4 px-4">
                <TouchableOpacity 
                    onPress={() => setActiveTab('preparing')} 
                    className={`rounded-xl border py-2 px-4 ${activeTab === 'preparing' ? 'border-green-800' : 'border-gray-200'}`}
                >
                    <Text className={`text-lg ${activeTab === 'preparing' ? 'font-bold text-green-800' : ''}`}>Preparing</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setActiveTab('ready')} 
                    className={`rounded-xl border py-2 px-4 ${activeTab === 'ready' ? 'border-green-800' : 'border-gray-200'}`}
                >
                    <Text className={`text-lg ${activeTab === 'ready' ? 'font-bold text-green-800' : ''}`}>Ready</Text>
                </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
                {mockOrders[activeTab].map(order => (
                    <View key={order.id} className="py-4 mb-4 rounded-lg border-b border-gray-300">
                        <Text className="text-lg font-bold">Order ID: {order.id}</Text>
                        <View className="mt-2">
                            {order.items.map((item, index) => (
                                <View key={index} className="mb-4">
                                    <Text className="text-lg">{item.name}</Text>
                                    <Text className="text-sm text-gray-500">Quantity: {item.quantity}</Text>
                                    <Text className="text-sm text-gray-700">Price: ${item.price.toFixed(2)} each</Text>
                                    <Text className="text-sm text-gray-700">Total: ${(item.price * item.quantity).toFixed(2)}</Text>
                                    <View className="border-t border-gray-300 my-2"></View>
                                </View>
                            ))}
                        </View>
                        <Text className="text-lg font-bold">
                            Total Order Price: ${calculateTotalPrice(order.items).toFixed(2)}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

export default Orders
