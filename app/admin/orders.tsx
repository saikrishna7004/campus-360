import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import useOrderStore, { Order } from '@/store/orderStore';
import useAuthStore from '@/store/authStore';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import AppStatusBar from '@/components/AppStatusBar';

const Orders = () => {
    const [activeTab, setActiveTab] = useState<'preparing' | 'ready'>('preparing');
    const [refreshing, setRefreshing] = useState(false);
    const { orders, updateOrderStatus, fetchOrders, fetchNewOrders, loading } = useOrderStore();
    const { getAuthHeader } = useAuthStore();
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            const authHeader = getAuthHeader();
            fetchOrders(authHeader);

            const interval = setInterval(() => fetchNewOrders(authHeader), 30000);

            return () => clearInterval(interval);
        }, [getAuthHeader, fetchOrders, fetchNewOrders])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders(getAuthHeader()).finally(() => setRefreshing(false));
    }, [getAuthHeader, fetchOrders]);

    const handleUpdateStatus = useCallback((orderId: string, newStatus: 'preparing' | 'ready' | 'completed') => {
        Alert.alert('Update Order Status', `Mark this order as ${newStatus}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Yes',
                onPress: async () => {
                    try {
                        await updateOrderStatus(orderId, newStatus, getAuthHeader());
                    } catch {
                        Alert.alert('Error', 'Failed to update order status.');
                    }
                }
            }
        ]);
    }, [updateOrderStatus, getAuthHeader]);

    const handleOrderPress = (order: Order) => {
        router.push({
            pathname: "/admin-order-details",
            params: { order: JSON.stringify(order) }
        });
    };

    const filteredOrders = useMemo(() => orders.filter(order => order.status === activeTab), [orders, activeTab]);

    return (
        <SafeAreaView className="flex-1 bg-gray-100" style={{ paddingTop: -28 }} edges={['top', 'left', 'right']}>
            <AppStatusBar />
            <View className="flex-row bg-white p-2 mb-2">
                {['preparing', 'ready'].map(tab => (
                    <TouchableOpacity 
                        key={tab}
                        onPress={() => setActiveTab(tab as 'preparing' | 'ready')} 
                        className={`flex-1 py-2 items-center rounded-md ${activeTab === tab ? 'bg-green-50' : 'border-gray-200'}`}
                    >
                        <Text className={`${activeTab === tab ? 'font-bold text-green-800' : ''}`}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#0000ff" className="mt-4" />
            ) : (
                <ScrollView 
                    className="p-4"
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            tintColor="#000" 
                            colors={['#00f']} 
                        />
                    }
                >
                    {filteredOrders.length === 0 ? (
                        <Text className="text-center text-gray-500 my-8">
                            No {activeTab} orders
                        </Text>
                    ) : (
                        filteredOrders.map(order => (
                            <TouchableOpacity 
                                key={order._id} 
                                onPress={() => handleOrderPress(order)}
                                className="bg-white rounded-xl shadow-sm mb-4 p-4 border border-gray-100"
                            >
                                <View className="flex-row justify-between mb-2">
                                    <View>
                                        <Text className="font-bold">Order #{order.orderId}</Text>
                                        <Text className="text-sm text-gray-600">
                                            {order.user.name || 'Anonymous Customer'}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-500 text-sm">
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </Text>
                                </View>

                                <View>
                                    {order.items.map((item, index) => (
                                        <View key={index} className="mb-2">
                                            <View className="flex-row justify-between items-start">
                                                <View className="flex-1">
                                                    <Text className="text-sm pr-2">
                                                        {item.name} x{item.quantity}
                                                    </Text>
                                                    {item.isPrintItem && item.documentDetails && (
                                                        <View className="mt-1">
                                                            <Text className="text-sm text-blue-600">
                                                                {item.documentDetails.printingOptions.colorType === 'bw' ? 'Black & White' : 'Color'} • 
                                                                {item.documentDetails.printingOptions.printSides === 'single' ? 'Single Sided' : 'Double Sided'}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text className="text-sm text-right ml-2">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                    
                                    <View className="border-t border-gray-200 my-3" />
                                    
                                    <View className="flex-row justify-between mb-4">
                                        <Text className="font-bold">Total:</Text>
                                        <Text className="font-bold text-right w-20 truncate">
                                            ₹{order.totalAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        onPress={() => handleUpdateStatus(
                                            order._id, 
                                            activeTab === 'preparing' ? 'ready' : 'completed'
                                        )}
                                        className={
                                            activeTab === 'preparing' 
                                                ? 'bg-green-600 py-2 rounded-md' 
                                                : 'bg-blue-600 py-2 rounded-md'
                                        }
                                    >
                                        <Text className="text-white font-medium text-center">
                                            {activeTab === 'preparing' ? 'Mark as Ready' : 'Mark as Completed'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default Orders;
