import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import useOrderStore from '@/store/orderStore';
import useAuthStore from '@/store/authStore';

interface OrderStatusTrackerProps {
    orderId: string;
    refreshInterval?: number;
}

const OrderStatusTracker = ({ orderId, refreshInterval = 10000 }: OrderStatusTrackerProps) => {
    const { trackOrder } = useOrderStore();
    const { getAuthHeader } = useAuthStore();
    const [status, setStatus] = useState<string | null>(null);
    const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                setLoading(true);
                const order = await trackOrder(orderId, getAuthHeader());
                if (order) {
                    setStatus(order.status);
                    setEstimatedTime(order.estimatedDeliveryTime || null);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                setError('Failed to fetch order status');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderStatus();

        const intervalId = setInterval(fetchOrderStatus, refreshInterval);

        return () => clearInterval(intervalId);
    }, [orderId, refreshInterval]);

    if (loading && !status) {
        return (
            <View className="p-4 bg-white rounded-lg mb-4">
                <ActivityIndicator size="small" color="#16a34a" />
                <Text className="text-center mt-2 text-gray-500">Loading order status...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="p-4 bg-white rounded-lg mb-4">
                <Text className="text-center text-red-500">{error}</Text>
            </View>
        );
    }

    return (
        <View className="p-4 bg-white rounded-lg mb-4">
            <Text className="text-lg font-bold mb-4">Order Status</Text>
            
            <View className="flex-row items-center mb-3">
                <View className={`h-8 w-8 rounded-full ${status === 'preparing' || status === 'ready' || status === 'completed' ? 'bg-green-600' : 'bg-gray-300'} items-center justify-center`}>
                    <FontAwesome name="check" size={16} color="white" />
                </View>
                <View className="h-1 w-16 bg-gray-200 mx-1" />
                <View className={`h-8 w-8 rounded-full ${status === 'ready' || status === 'completed' ? 'bg-green-600' : 'bg-gray-300'} items-center justify-center`}>
                    <FontAwesome name="thumbs-up" size={16} color="white" />
                </View>
                <View className="h-1 w-16 bg-gray-200 mx-1" />
                <View className={`h-8 w-8 rounded-full ${status === 'completed' ? 'bg-green-600' : 'bg-gray-300'} items-center justify-center`}>
                    <FontAwesome name="check-circle" size={16} color="white" />
                </View>
            </View>
            
            <View className="flex-row justify-between px-2">
                <Text className={`text-xs ${status === 'preparing' || status === 'ready' || status === 'completed' ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                    Preparing
                </Text>
                <Text className={`text-xs ${status === 'ready' || status === 'completed' ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                    Ready for pickup
                </Text>
                <Text className={`text-xs ${status === 'completed' ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                    Completed
                </Text>
            </View>
            
            {estimatedTime && (
                <View className="mt-4 bg-green-50 p-3 rounded-md">
                    <Text className="text-green-800">
                        <FontAwesome name="clock-o" size={14} color="#16a34a" /> Expected ready in: {estimatedTime}
                    </Text>
                </View>
            )}
            
            {status === 'cancelled' && (
                <View className="mt-4 bg-red-50 p-3 rounded-md">
                    <Text className="text-red-800">
                        <FontAwesome name="exclamation-circle" size={14} color="#dc2626" /> This order has been cancelled
                    </Text>
                </View>
            )}
        </View>
    );
};

export default OrderStatusTracker;
