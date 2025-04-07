import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useOrderStore, { Order, OrderItem } from '@/store/orderStore';
import useAuthStore from '@/store/authStore';
import * as NavigationBar from 'expo-navigation-bar';
import { VENDOR_NAMES } from '@/constants/types';

const OrderCard = ({ order, onPress }: { order: Order; onPress: () => void }) => {
    const formattedDate = new Date(order.createdAt).toLocaleString();

    return (
        <TouchableOpacity
            className="bg-white p-4 rounded-xl mb-3 shadow-sm"
            onPress={onPress}
        >
            <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-lg">{VENDOR_NAMES[order.vendor]}</Text>
                <View className={`px-2 py-1 rounded-full ${order.status === 'preparing' ? 'bg-yellow-100' :
                    order.status === 'ready' ? 'bg-blue-100' :
                        order.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    <Text className={`text-xs font-medium ${order.status === 'preparing' ? 'text-yellow-800' :
                        order.status === 'ready' ? 'text-blue-800' :
                            order.status === 'completed' ? 'text-green-800' : 'text-red-800'
                        }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Order #{order.orderId}</Text>
                <Text className="text-gray-600">{formattedDate}</Text>
            </View>

            <View className="mt-2">
                {order.items.slice(0, 2).map((orderItem: OrderItem, index: number) => (
                    <Text key={index} className="text-gray-700">
                        {orderItem.quantity}x {orderItem.name}
                    </Text>
                ))}
                {order.items.length > 2 && (
                    <Text className="text-gray-500">+{order.items.length - 2} more items</Text>
                )}
            </View>

            <View className="flex-row justify-between items-center mt-3">
                <Text className="font-bold">₹{order.totalAmount.toFixed(2)}</Text>
                <View className="flex-row items-center">
                    <Text className="text-green-700 mr-1">View Details</Text>
                    <FontAwesome name="chevron-right" size={12} color="#15803d" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const MyOrders = () => {
    const router = useRouter();
    const { activeOrders, orderHistory, fetchOrderHistory, loading } = useOrderStore();
    const { isAuthenticated, getAuthHeader } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [error, setError] = useState<string | null>(null);

    NavigationBar.setButtonStyleAsync("dark");
    NavigationBar.setBackgroundColorAsync("white");

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const header = getAuthHeader();
        if (!header) {
            setError('Authentication required');
            return;
        }

        loadOrders();
    }, [isAuthenticated]);

    const loadOrders = async () => {
        try {
            setError(null);
            const header = getAuthHeader();
            if (!header) {
                throw new Error('Authentication required');
            }
            await fetchOrderHistory(header);
        } catch (error: any) {
            console.error('Failed to load orders:', error);
            setError(error?.message || 'Failed to load orders. Please try again.');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const navigateToOrderDetails = (order: Order) => {
        router.push({
            pathname: '/order-details',
            params: { orderId: order._id }
        });
    };

    const renderItem = ({ item }: { item: Order }) => (
        <OrderCard order={item} onPress={() => navigateToOrderDetails(item)} />
    );

    const EmptyState = () => (
        <View className="flex-1 items-center justify-center py-8">
            <FontAwesome name="shopping-bag" size={64} color="#d1d5db" />
            <Text className="mt-4 text-gray-500 text-lg font-medium">No orders found</Text>
            <Text className="mt-2 text-gray-400 text-center px-8">
                {activeTab === 'active'
                    ? "You don't have any active orders at the moment."
                    : "You haven't placed any orders yet."}
            </Text>
            <TouchableOpacity
                className="mt-6 bg-green-700 px-6 py-2 rounded-full"
                onPress={() => router.push('/')}
            >
                <Text className="text-white font-medium">Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#16a34a" />
                    <Text className="mt-4 text-gray-500">Loading orders...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const orders = activeTab === 'active' ? (activeOrders || []) : (orderHistory || []);

    return (
        <SafeAreaView className="flex-1 bg-gray-100" style={{ paddingTop: -28 }}>
            <StatusBar style="dark" />

            <View className="flex-row bg-white mb-4 p-2">
                <TouchableOpacity
                    className={`flex-1 py-2 items-center rounded-md ${activeTab === 'active' ? 'bg-green-50' : ''}`}
                    onPress={() => setActiveTab('active')}
                >
                    <Text className={`font-medium ${activeTab === 'active' ? 'text-green-700' : 'text-gray-500'}`}>
                        Active Orders
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-2 items-center rounded-md ${activeTab === 'history' ? 'bg-green-50' : ''}`}
                    onPress={() => setActiveTab('history')}
                >
                    <Text className={`font-medium ${activeTab === 'history' ? 'text-green-700' : 'text-gray-500'}`}>
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
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 8,
                        paddingBottom: 20,
                        flexGrow: orders.length === 0 ? 1 : undefined
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#16a34a']}
                            tintColor="#16a34a"
                        />
                    }
                    ListEmptyComponent={<EmptyState />}
                />
            )}
        </SafeAreaView>
    );
};

export default MyOrders;
