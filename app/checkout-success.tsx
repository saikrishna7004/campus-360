import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const CheckoutSuccess = () => {
    const router = useRouter();
    const { orderIds } = useLocalSearchParams<{ orderIds: string }>();
    
    const orderIdArray = orderIds ? orderIds.split(',') : [];
    
    return (
        <SafeAreaView className="flex-1 bg-green-50">
            <StatusBar style="dark" />
            
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
                <View className="items-center mb-8">
                    <View className="bg-green-100 w-24 h-24 rounded-full items-center justify-center mb-6">
                        <FontAwesome name="check" size={48} color="#16a34a" />
                    </View>
                    <Text className="text-2xl font-bold text-center mb-2">Orders Placed Successfully!</Text>
                    <Text className="text-gray-600 text-center mb-4">
                        Your {orderIdArray.length > 1 ? `${orderIdArray.length} orders have` : 'order has'} been placed successfully.
                    </Text>
                    
                    {orderIdArray.length > 0 && (
                        <View className="bg-white p-4 rounded-xl w-full mb-6">
                            <Text className="font-bold mb-2">Order {orderIdArray.length > 1 ? 'IDs' : 'ID'}:</Text>
                            {orderIdArray.map((id, index) => (
                                <Text key={id + index} className="text-gray-600 mb-1">
                                    {index + 1}. {id}
                                </Text>
                            ))}
                        </View>
                    )}
                    
                    <Text className="text-gray-600 text-center mb-6">
                        You can track the status of your {orderIdArray.length > 1 ? 'orders' : 'order'} from the My Orders section.
                    </Text>
                    
                    <View className="w-full gap-3">
                        <TouchableOpacity 
                            className="bg-green-700 py-3 rounded-lg items-center"
                            onPress={() => router.replace('/my-orders')}
                        >
                            <Text className="text-white font-bold">View My Orders</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            className="bg-white border border-green-700 py-3 rounded-lg items-center"
                            onPress={() => router.replace('/')}
                        >
                            <Text className="text-green-700 font-bold">Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CheckoutSuccess;
