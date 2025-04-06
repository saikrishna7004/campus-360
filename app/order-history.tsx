import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useOrderStore, { Order, OrderItem } from '@/store/orderStore';
import useAuthStore from '@/store/authStore';
import * as NavigationBar from 'expo-navigation-bar';
import { VENDOR_NAMES } from '@/constants/types';

const OrderHistory = (): React.ReactElement => {
    const router = useRouter();
    const { orderHistory, fetchOrderHistory, loading } = useOrderStore();
    const { isAuthenticated, getAuthHeader } = useAuthStore();
    const [refreshing, setRefreshing] = useState<boolean>(false);

    NavigationBar.setButtonStyleAsync("dark");
    NavigationBar.setBackgroundColorAsync("white");

    useEffect(() => {
        if (isAuthenticated) {
            loadOrders();
        } else {
            router.replace('/login');
        }
    }, [isAuthenticated]);

    const loadOrders = async (): Promise<void> => {
        try {
            await fetchOrderHistory(getAuthHeader());
        } catch (error) {
            console.error('Failed to load order history:', error);
        }
    };

    const onRefresh = async (): Promise<void> => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const renderOrderCard = (item: Order): React.ReactElement => {
        const formattedDate = new Date(item.createdAt).toLocaleDateString();
        const totalItems = item.items.reduce((sum, orderItem) => sum + orderItem.quantity, 0);

        return (
            <TouchableOpacity
                key={item._id}
                className="bg-white p-4 rounded-xl mb-3"
                onPress={() => router.push({
                    pathname: '/order-details',
                    params: { orderId: item._id }
                })}
            >
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-bold text-lg">{VENDOR_NAMES[item.vendor]}</Text>
                    <View className={`px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Text className={`text-xs font-medium ${item.status === 'completed' ? 'text-green-800' : 'text-red-800'}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>

                <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600">Order #{item.orderId}</Text>
                    <Text className="text-gray-600">{formattedDate}</Text>
                </View>

                <View className="flex-row justify-between">
                    <Text className="text-gray-700">{totalItems} items</Text>
                    <Text className="font-semibold">₹{item.totalAmount.toFixed(2)}</Text>
                </View>

                <View className="mt-2 flex-row items-center">
                    <FontAwesome name="arrow-right" size={14} color="#16a34a" />
                    <Text className="text-green-700 ml-1 text-sm">View Details</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#16a34a" />
                <Text className="mt-4 text-gray-500">Loading order history...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar style="dark" />

            <View className="bg-white p-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold">Order History</Text>
            </View>

            <ScrollView
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 24,
                    flexGrow: orderHistory.length === 0 ? 1 : undefined
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#16a34a']}
                    />
                }
            >
                {orderHistory.length > 0 ? (
                    orderHistory.map(item => renderOrderCard(item))
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <FontAwesome name="history" size={64} color="#d1d5db" />
                        <Text className="mt-4 text-gray-500 text-lg font-medium">No order history</Text>
                        <Text className="mt-2 text-gray-400 text-center">
                            You haven't completed any orders yet
                        </Text>
                        <TouchableOpacity
                            className="mt-6 bg-green-700 px-6 py-2 rounded-lg"
                            onPress={() => router.push('/')}
                        >
                            <Text className="text-white font-medium">Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default OrderHistory;
