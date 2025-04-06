import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useOrderStore, { Order } from '@/store/orderStore';
import useAuthStore from '@/store/authStore';
import * as NavigationBar from 'expo-navigation-bar';
import { VendorType } from '@/store/cartStore';
import { VENDOR_NAMES } from '@/constants/types';

const OrderDetails = () => {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const router = useRouter();
    const { fetchOrderById } = useOrderStore();
    const { getAuthHeader } = useAuthStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    NavigationBar.setButtonStyleAsync("dark");
    NavigationBar.setBackgroundColorAsync("white");

    const loadOrderDetails = async () => {
        if (!orderId) {
            Alert.alert('Error', 'Order ID is required');
            router.back();
            return;
        }

        try {
            setLoading(true);
            const orderData = await fetchOrderById(orderId, getAuthHeader());
            if (orderData) {
                setOrder(orderData);
            } else {
                Alert.alert('Error', 'Order not found');
                router.back();
            }
        } catch (error) {
            console.error('Failed to load order details:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrderDetails();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#16a34a" />
                <Text className="mt-4 text-gray-500">Loading order details...</Text>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-red-500">Order not found</Text>
                <TouchableOpacity
                    className="mt-4 bg-green-700 px-4 py-2 rounded-md"
                    onPress={() => router.back()}
                >
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar style="dark" />

            <View className="bg-white p-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold">Order Details</Text>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#16a34a']}
                        tintColor="#16a34a"
                    />
                }
            >
                <View className="bg-white p-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-bold text-lg">
                            {VENDOR_NAMES[order.vendor as VendorType]}
                        </Text>
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

                    <Text className="text-gray-600 mb-1">Order #{order.orderId}</Text>
                    <Text className="text-gray-600 mb-3">{formatDate(order.createdAt)}</Text>

                    <View className="border-t border-gray-200 pt-3 mb-3">
                        <Text className="font-medium mb-2">Payment Information</Text>
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-gray-600">Payment Method</Text>
                            <Text className="font-medium">{order.paymentMethod}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Total Amount</Text>
                            <Text className="font-medium">₹{order.totalAmount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-white p-4 mb-4">
                    <Text className="font-medium mb-3">Order Items</Text>

                    {order.items.map((item, index) => (
                        <View key={index} className="flex-row justify-between mb-3">
                            <View className="flex-row">
                                <View className="h-6 w-6 bg-green-100 rounded-full items-center justify-center mr-2">
                                    <Text className="text-green-800 text-xs">{item.quantity}x</Text>
                                </View>
                                <Text className="text-gray-800">{item.name}</Text>
                            </View>
                            <Text className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}

                    <View className="border-t border-gray-200 mt-2 pt-3">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Subtotal</Text>
                            <Text className="font-medium">₹{(order.totalAmount - 2).toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Platform Fee</Text>
                            <Text className="font-medium">₹2.00</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="font-bold">Total</Text>
                            <Text className="font-bold">₹{order.totalAmount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {order.status === 'completed' && (
                    <View className="bg-green-50 p-4 mb-4 mx-4 rounded-lg">
                        <View className="flex-row items-center">
                            <FontAwesome name="check-circle" size={20} color="#16a34a" />
                            <Text className="ml-2 text-green-800 font-medium">This order has been completed</Text>
                        </View>
                        <Text className="text-green-700 text-sm mt-1">
                            Thank you for your order! We hope you enjoyed it.
                        </Text>
                    </View>
                )}

                {order.status === 'cancelled' && (
                    <View className="bg-red-50 p-4 mb-4 mx-4 rounded-lg">
                        <View className="flex-row items-center">
                            <FontAwesome name="times-circle" size={20} color="#dc2626" />
                            <Text className="ml-2 text-red-800 font-medium">This order was cancelled</Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    className="mx-4 mb-8 bg-white p-4 rounded-lg border border-gray-200"
                    onPress={() => {
                        router.push('/');
                    }}
                >
                    <View className="flex-row items-center justify-center">
                        <FontAwesome name="shopping-basket" size={16} color="#16a34a" />
                        <Text className="ml-2 text-green-700 font-medium">Place a New Order</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default OrderDetails;
