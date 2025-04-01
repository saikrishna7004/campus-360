import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import useOrderStore from '@/store/orderStore';
import useAuthStore from '@/store/authStore';
import { VendorType } from '@/store/cartStore';

const VENDOR_NAMES: Record<VendorType, string> = {
    'canteen': 'Canteen',
    'stationery': 'Stationery Store',
    'default': 'Campus Store'
};

const ActiveOrder = () => {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const router = useRouter();
    const { trackOrder } = useOrderStore();
    const { getAuthHeader } = useAuthStore();
    const [order, setOrder] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchOrderStatus();
        // Remove interval tracking
    }, [orderId]);

    const fetchOrderStatus = async () => {
        if (!orderId) return;
        const orderData = await trackOrder(orderId, getAuthHeader());
        if (orderData) {
            setOrder(orderData);
            if (orderData.status === 'completed' || orderData.status === 'cancelled') {
                router.replace(`/order-details?orderId=${orderId}`);
            }
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrderStatus();
        setRefreshing(false);
    };

    if (!order) return null;

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                className="flex-1"
            >
                <View className="bg-white p-4 mb-4">
                    <Text className="text-xl font-bold">
                        {VENDOR_NAMES[order.vendor as VendorType] || VENDOR_NAMES.default}
                    </Text>
                    <Text className="text-gray-600">Order #{order.orderId}</Text>
                    <View className="mt-4 p-4 bg-yellow-50 rounded-lg">
                        <Text className="font-medium text-yellow-800">
                            {order.status === 'preparing' ? 'Preparing your order...' : 'Ready for pickup!'}
                        </Text>
                        <Text className="text-yellow-700 text-sm mt-1">
                            {order.status === 'preparing' ? 'We\'ll notify you when it\'s ready' : 'Please collect your order'}
                        </Text>
                    </View>
                </View>

                <View className="bg-white p-4">
                    <Text className="font-bold mb-2">Order Items</Text>
                    {order.items.map((item: any, index: number) => (
                        <View key={index} className="flex-row justify-between py-2">
                            <Text>{item.quantity}x {item.name}</Text>
                            <Text>₹{(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View className="mt-4 pt-4 border-t border-gray-200">
                        <View className="flex-row justify-between">
                            <Text>Total</Text>
                            <Text className="font-bold">₹{order.totalAmount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ActiveOrder;
