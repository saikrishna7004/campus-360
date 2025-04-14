import React, { useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import useOrderStore from '@/store/orderStore';
import useAuthStore from '@/store/authStore';

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
            console.error('Error opening document:', error);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-4">
                <Text className="text-2xl font-bold mb-2">Order #{orderData.orderId}</Text>
                <Text className="text-gray-500">{new Date(orderData.createdAt).toLocaleString()}</Text>

                <View className="mt-6">
                    {orderData.items.map((item: any, index: number) => (
                        <View key={index} className="mb-4 bg-gray-50 rounded-lg p-4">
                            <Text className="text-lg font-semibold">{item.name}</Text>
                            <Text className="text-gray-600">
                                Quantity: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                            </Text>
                            
                            {item.isPrintItem && item.documentDetails && (
                                <View className="mt-3 bg-blue-50 rounded-lg p-3">
                                    <Text className="font-medium text-blue-800 mb-2">Print Details:</Text>
                                    <View className="space-y-1">
                                        <Text className="text-blue-700">• Type: {item.documentDetails.printingOptions.colorType === 'bw' ? 'Black & White' : 'Color'}</Text>
                                        <Text className="text-blue-700">• Sides: {item.documentDetails.printingOptions.printSides === 'single' ? 'Single Sided' : 'Double Sided'}</Text>
                                        <Text className="text-blue-700">• Copies: {item.documentDetails.printingOptions.numberOfCopies}</Text>
                                        <Text className="text-blue-700">• Size: {item.documentDetails.printingOptions.pageSize}</Text>
                                        <Text className="text-blue-700">• Pages: {item.documentDetails.printingOptions.numberOfPages}</Text>
                                    </View>
                                    {item.documentDetails?.url && (
                                        <TouchableOpacity 
                                            onPress={() => openDocument(item.documentDetails?.url)}
                                            className="flex-row items-center mt-3 bg-blue-100 p-3 rounded-lg"
                                        >
                                            <MaterialCommunityIcons name="file-pdf-box" size={24} color="#1e40af" />
                                            <Text className="text-blue-800 ml-2 font-medium">Open Document</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    ))}

                    <View className="mt-2 bg-gray-50 rounded-lg p-4">
                        <Text className="text-lg font-bold">Total: ₹{orderData.totalAmount}</Text>
                        <Text className="text-gray-600">Payment via {orderData.paymentMethod}</Text>
                    </View>

                    <View className="flex-row justify-end space-x-3 mt-6">
                        {orderData.status === 'preparing' && (
                            <TouchableOpacity
                                onPress={() => handleUpdateStatus('ready')}
                                className="bg-green-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-medium">Mark Ready</Text>
                            </TouchableOpacity>
                        )}
                        {orderData.status === 'ready' && (
                            <TouchableOpacity
                                onPress={() => handleUpdateStatus('completed')}
                                className="bg-blue-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-medium">Complete</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
