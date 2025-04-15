import React, { useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import useOrderStore from '@/store/orderStore';
import useAuthStore from '@/store/authStore';
import { VENDOR_NAMES } from '@/constants/types';
import { cn } from '@/lib/cn';
import AppStatusBar from '@/components/AppStatusBar';

export default function OrderDetails() {
    const { order } = useLocalSearchParams();
    const router = useRouter();
    const { updateOrderStatus } = useOrderStore();
    const { getAuthHeader } = useAuthStore();

    const orderData = useMemo(() => {
        if (!order) return null;
        try {
            return typeof order === 'string' ? JSON.parse(order) : order;
        } catch (err) {
            console.error('Error parsing order:', err);
            return null;
        }
    }, [order]);

    useEffect(() => {
        if (!orderData?.orderId) {
            router.back();
        }
    }, [orderData]);

    if (!orderData?.orderId) return null;

    const handleUpdateStatus = async (newStatus: 'ready' | 'completed') => {
        try {
            await updateOrderStatus(orderData._id, newStatus, getAuthHeader());
            router.back();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const openDocument = async (url?: string) => {
        try {
            if (!url) {
                return;
            }
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert('Error', 'Failed to open document. Please try again later.');
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <AppStatusBar />
            <View className="mx-3 mt-4">
                <View className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-bold mb-1">Order #{orderData.orderId}</Text>
                    <Text className="text-gray-500 text-sm mb-3">{new Date(orderData.createdAt).toLocaleString()}</Text>

                    <View className="border-t border-gray-100 pt-3">
                        <Text className="font-medium text-gray-800 mb-2">Customer Details</Text>
                        <Text className="text-gray-700">Name: {orderData.user.name || 'Anonymous'}</Text>
                        <Text className="text-gray-600">Email: {orderData.user.email || 'N/A'}</Text>
                    </View>
                </View>

                <View className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="font-medium text-gray-800 mb-3">Order Items</Text>
                    {orderData.items.map((item: any, index: number) => (
                        <View 
                            key={index} 
                            className={cn(
                                "py-2",
                                index !== orderData.items.length - 1 && "border-b border-gray-100"
                            )}
                        >
                            <View className="flex-row justify-between">
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium">{item.name}</Text>
                                    <Text className="text-gray-600">Quantity: {item.quantity}</Text>
                                </View>
                                <Text className="text-gray-800 font-medium">₹{(item.price * item.quantity).toFixed(2)}</Text>
                            </View>
                            
                            {item.isPrintItem && item.documentDetails && (
                                <View className="mt-2 bg-blue-50 rounded-lg p-3">
                                    <View className="space-y-1">
                                        <Text className="text-blue-700">
                                            {item.documentDetails.printingOptions.colorType === 'bw' ? 'Black & White' : 'Color'} • 
                                            {item.documentDetails.printingOptions.printSides === 'single' ? 'Single Sided' : 'Double Sided'} •
                                            {item.documentDetails.printingOptions.numberOfCopies} copies
                                        </Text>
                                    </View>
                                    {item.documentDetails?.url && (
                                        <TouchableOpacity 
                                            onPress={() => openDocument(item.documentDetails?.url)}
                                            className="flex-row items-center mt-2 bg-blue-100 p-2 rounded-lg"
                                        >
                                            <MaterialCommunityIcons name="file-pdf-box" size={20} color="#1e40af" />
                                            <Text className="text-blue-800 ml-2">Open Document</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    ))}

                    <View className="border-t border-gray-100 mt-2 pt-4">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-gray-800">Subtotal</Text>
                            <Text className="text-gray-800">₹{(orderData.totalAmount - 2).toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between items-center mt-2">
                            <Text className="text-gray-800">Platform Fee</Text>
                            <Text className="text-gray-800">₹2.00</Text>
                        </View>
                        <View className="flex-row justify-between items-center mt-4 pt-2 border-t border-gray-100">
                            <Text className="font-bold">Total</Text>
                            <Text className="font-bold">₹{orderData.totalAmount.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="font-medium text-gray-800 mb-2">Payment Details</Text>
                    <View className="flex-row items-center">
                        <FontAwesome name="google-wallet" size={20} color="#16a34a" />
                        <Text className="text-gray-700 ml-2">{orderData.paymentMethod}</Text>
                    </View>
                </View>

                <View className="bg-white rounded-2xl p-4 mb-6">
                    {orderData.status === 'preparing' && (
                        <TouchableOpacity
                            onPress={() => handleUpdateStatus('ready')}
                            className="bg-green-700 py-3 rounded-lg"
                        >
                            <Text className="text-white font-medium text-center">Mark as Ready</Text>
                        </TouchableOpacity>
                    )}
                    {orderData.status === 'ready' && (
                        <TouchableOpacity
                            onPress={() => handleUpdateStatus('completed')}
                            className="bg-blue-600 py-3 rounded-lg"
                        >
                            <Text className="text-white font-medium text-center">Complete Order</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
