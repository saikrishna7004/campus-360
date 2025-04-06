import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useOrderStore from '@/store/orderStore';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { VendorType } from '@/store/cartStore';
import { VENDOR_NAMES } from '@/constants/types';

const Orders = () => {
    const { fetchOrderHistory, activeOrders = [], orderHistory = [] } = useOrderStore();
    const { isAuthenticated, getAuthHeader } = useAuthStore();
    const [selectedTab, setSelectedTab] = useState('active');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }
        loadOrders();
    }, [isAuthenticated]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            await fetchOrderHistory(getAuthHeader());
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setError('Could not load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    interface OrderItem {
        quantity: number;
        name: string;
    }

    interface Order {
        _id: string;
        vendorName: string;
        status: 'preparing' | 'ready' | 'completed' | 'cancelled';
        orderId: string;
        createdAt: string;
        items: OrderItem[];
        totalAmount: number;
    }

    const navigateToOrderDetails = (orderId: string): void => {
        router.push({
            pathname: '/order-details',
            params: { orderId }
        });
    };

    const OrderCard = (item: Order) => (
        <TouchableOpacity
            key={item._id}
            className="p-4 bg-white rounded-lg mb-3 mx-4"
            onPress={() => navigateToOrderDetails(item._id)}
        >
            <View className="flex-row justify-between">
                <Text className="font-bold">{VENDOR_NAMES[item.vendorName as VendorType] || item.vendorName}</Text>
                <View className={`px-2 py-1 rounded-full ${item.status === 'preparing' ? 'bg-yellow-100' :
                        item.status === 'ready' ? 'bg-blue-100' :
                            item.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    <Text className={`text-xs font-medium ${item.status === 'preparing' ? 'text-yellow-800' :
                            item.status === 'ready' ? 'text-blue-800' :
                                item.status === 'completed' ? 'text-green-800' : 'text-red-800'
                        }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                </View>
            </View>

            <Text className="text-gray-500 mt-1">Order #{item.orderId}</Text>
            <Text className="text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</Text>

            <View className="mt-2">
                {item.items.slice(0, 2).map((orderItem: OrderItem, index: number) => (
                    <Text key={index} className="text-gray-700">
                        {orderItem.quantity}x {orderItem.name}
                    </Text>
                ))}
                {item.items.length > 2 && (
                    <Text className="text-gray-500">+{item.items.length - 2} more items</Text>
                )}
            </View>

            <View className="flex-row justify-between items-center mt-2">
                <Text className="font-bold">₹{item.totalAmount.toFixed(2)}</Text>
                <View className="flex-row items-center">
                    <Text className="text-green-700 mr-1">View Details</Text>
                    <FontAwesome name="chevron-right" size={12} color="#15803d" />
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="p-4 bg-white">
                    <Text className="text-2xl font-bold">My Orders</Text>
                </View>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#16a34a" />
                    <Text className="mt-4 text-gray-500">Loading orders...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentData = selectedTab === 'active' ? activeOrders : orderHistory;

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="p-4 bg-white">
                <Text className="text-2xl font-bold">My Orders</Text>
            </View>

            <View className="flex-row bg-white mb-4 p-2">
                <TouchableOpacity
                    className={`flex-1 py-2 items-center rounded-md ${selectedTab === 'active' ? 'bg-green-50' : ''}`}
                    onPress={() => setSelectedTab('active')}
                >
                    <Text className={`font-medium ${selectedTab === 'active' ? 'text-green-700' : 'text-gray-500'}`}>
                        Active Orders
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-2 items-center rounded-md ${selectedTab === 'history' ? 'bg-green-50' : ''}`}
                    onPress={() => setSelectedTab('history')}
                >
                    <Text className={`font-medium ${selectedTab === 'history' ? 'text-green-700' : 'text-gray-500'}`}>
                        Order History
                    </Text>
                </TouchableOpacity>
            </View>

            {error ? (
                <View className="flex-1 items-center justify-center p-4">
                    <FontAwesome name="exclamation-circle" size={48} color="#EF4444" />
                    <Text className="mt-4 text-red-600 text-center">{error}</Text>
                    <TouchableOpacity
                        className="mt-4 bg-green-700 px-4 py-2 rounded-md"
                        onPress={loadOrders}
                    >
                        <Text className="text-white">Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={loadOrders}
                            colors={['#16a34a']}
                        />
                    }
                    contentContainerStyle={[
                        { paddingVertical: 8 },
                        !currentData.length && { flex: 1 }
                    ]}
                >
                    {currentData.length > 0 ? (
                        currentData.map(item => OrderCard({ ...item, vendorName: item.vendor }))
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <FontAwesome name="shopping-bag" size={48} color="#d1d5db" />
                            <Text className="text-gray-500 text-lg mt-4">
                                {selectedTab === 'active' ? 'No active orders' : 'No past orders'}
                            </Text>
                            <TouchableOpacity
                                className="mt-4 bg-green-700 px-4 py-2 rounded-md"
                                onPress={() => router.push('/')}
                            >
                                <Text className="text-white">Start Shopping</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default Orders;
