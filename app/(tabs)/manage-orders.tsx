import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useOrderStore from '@/store/orderStore';

export default function ManageOrders() {
    const { fetchOrders, orders, updateOrderStatus } = useOrderStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchOrders();

        const interval = setInterval(() => {
            fetchOrders();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    const activeOrders = orders.filter(order =>
        order.status === 'preparing' || order.status === 'ready'
    );

    const handleStatusChange = async (orderId: string, newStatus: 'preparing' | 'ready' | 'completed' | 'cancelled') => {
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Text className="text-2xl font-bold p-4">Manage Orders</Text>

            <FlatList
                data={activeOrders}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="p-4 items-center">
                        <Text className="text-gray-500">No active orders</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="p-4 border-b border-gray-200">
                        <View className="flex-row justify-between">
                            <Text className="font-bold">Order #{item.orderId}</Text>
                            <Text className={
                                item.status === 'preparing' ? 'text-orange-500' : 'text-green-600'
                            }>
                                {item.status.toUpperCase()}
                            </Text>
                        </View>

                        <Text className="text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</Text>

                        <View className="mt-2">
                            {item.items.map((orderItem, index) => (
                                <Text key={index} className="text-gray-700">
                                    {orderItem.quantity}x {orderItem.name} - ₹{orderItem.price * orderItem.quantity}
                                </Text>
                            ))}
                        </View>

                        <Text className="font-bold mt-2">Total: ₹{item.totalAmount}</Text>

                        <View className="flex-row justify-end mt-3 space-x-3">
                            {item.status === 'preparing' && (
                                <TouchableOpacity
                                    className="bg-green-600 px-4 py-2 rounded"
                                    onPress={() => handleStatusChange(item._id, 'ready')}
                                >
                                    <Text className="text-white font-bold">Mark Ready</Text>
                                </TouchableOpacity>
                            )}

                            {item.status === 'ready' && (
                                <TouchableOpacity
                                    className="bg-blue-600 px-4 py-2 rounded"
                                    onPress={() => handleStatusChange(item._id, 'completed')}
                                >
                                    <Text className="text-white font-bold">Complete Order</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                className="bg-red-600 px-4 py-2 rounded"
                                onPress={() => handleStatusChange(item._id, 'cancelled')}
                            >
                                <Text className="text-white font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}
