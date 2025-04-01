import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import useOrderStore from '@/store/orderStore';
import * as NavigationBar from 'expo-navigation-bar';

const VENDOR_NAMES: Record<string, string> = {
    'canteen': 'Canteen',
    'stationery': 'Stationery Store',
    'default': 'Campus Store'
};

const CheckoutPage = () => {
    const router = useRouter();
    const { carts, clearCart } = useCartStore();
    const { isAuthenticated, getAuthHeader } = useAuthStore();
    const { placeOrder } = useOrderStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentOrderIndex, setCurrentOrderIndex] = useState(-1);

    NavigationBar.setButtonStyleAsync("dark");
    NavigationBar.setBackgroundColorAsync("white");

    const totalAmount = carts?.reduce((sum, cart) => {
        const cartTotal = cart.items.reduce(
            (cartSum, item) => cartSum + (item.price * item.quantity), 
            0
        );
        return sum + cartTotal;
    }, 0) || 0;

    const platformFee = (carts?.length || 0) * 2;
    const finalTotal = totalAmount + platformFee;

    const handleMultipleCheckout = async () => {
        if (!isAuthenticated) {
            Alert.alert('Error', 'You need to be logged in to place orders');
            return router.push('/login');
        }

        setIsProcessing(true);
        const orderIds: string[] = [];
        const authHeader = getAuthHeader();

        try {
            for (let i = 0; i < carts.length; i++) {
                const cart = carts[i];
                const cartTotal = cart.items.reduce(
                    (sum, item) => sum + (item.price * item.quantity), 
                    0
                );
                
                const orderItems = cart.items.map(item => ({
                    productId: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }));

                setCurrentOrderIndex(i);
                const orderId = await placeOrder(
                    orderItems,
                    cartTotal + 2,
                    cart.vendor,
                    authHeader
                );
                
                if (!orderId) throw new Error(`Failed to place order for ${VENDOR_NAMES[cart.vendor]}`);
                orderIds.push(orderId);
            }

            await clearCart();
            router.replace({
                pathname: '/checkout-success',
                params: { orderIds: orderIds.join(',') }
            });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to place orders. Please try again.');
        } finally {
            setIsProcessing(false);
            setCurrentOrderIndex(-1);
        }
    };

    if (!carts?.length) {
        useEffect(() => {
            router.replace('/');
        }, []);
        return null;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar style="dark" />

            <View className="bg-white p-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-bold">Checkout</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="bg-white m-4 p-4 rounded-xl">
                    <Text className="text-lg font-bold mb-4">Order Summary</Text>
                    
                    {carts.map((cart, index) => {
                        const cartTotal = cart.items.reduce(
                            (sum, item) => sum + (item.price * item.quantity), 0
                        );
                        const itemCount = cart.items.reduce(
                            (count, item) => count + item.quantity, 0
                        );
                        
                        return (
                            <View key={cart.vendor} className="mb-4 pb-4 border-b border-gray-100">
                                <View className="flex-row justify-between items-center mb-2">
                                    <View className="flex-row items-center">
                                        <Image 
                                            source={{ uri: 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg' }} 
                                            className="w-10 h-10 rounded-full mr-2" 
                                        />
                                        <Text className="font-semibold">{VENDOR_NAMES[cart.vendor]}</Text>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => router.push(`/cart?vendor=${cart.vendor}`)}
                                        className="bg-green-50 px-3 py-1 rounded-md"
                                    >
                                        <Text className="text-green-700 text-xs">Edit</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <View className="ml-3">
                                    {cart.items.map(item => (
                                        <View key={item._id} className="flex-row justify-between py-1">
                                            <Text className="text-gray-700">
                                                {item.quantity}x {item.name}
                                            </Text>
                                            <Text className="text-gray-700">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                
                                <View className="flex-row justify-between mt-2 pb-1">
                                    <Text className="text-gray-500">Subtotal ({itemCount} items)</Text>
                                    <Text className="font-medium">₹{cartTotal.toFixed(2)}</Text>
                                </View>
                                
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-500">Platform fee</Text>
                                    <Text className="font-medium">₹2.00</Text>
                                </View>
                                
                                {isProcessing && currentOrderIndex === index && (
                                    <View className="flex-row items-center justify-center mt-2 bg-yellow-50 p-2 rounded-md">
                                        <ActivityIndicator size="small" color="#16a34a" />
                                        <Text className="ml-2 text-yellow-800">Processing...</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                    
                    <View className="border-t border-gray-200 mt-2 pt-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-700">Items Total</Text>
                            <Text className="font-medium">₹{totalAmount.toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-700">Platform Fees</Text>
                            <Text className="font-medium">₹{platformFee.toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between mt-2">
                            <Text className="font-bold text-lg">Total Amount</Text>
                            <Text className="font-bold text-lg">₹{finalTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
                
                <View className="bg-white m-4 p-4 rounded-xl">
                    <Text className="text-lg font-bold mb-2">Payment Method</Text>
                    <View className="flex-row items-center p-2 bg-gray-50 rounded-md">
                        <Image 
                            source={{ uri: 'https://www.srcu4u.com/creditunion/wp-content/uploads/2019/07/Google-Pay-Logo-01.png' }} 
                            className="w-8 h-8 rounded-md mr-3"
                        />
                        <View>
                            <Text className="font-medium">Google Pay UPI</Text>
                            <Text className="text-gray-500 text-xs">Default payment method</Text>
                        </View>
                    </View>
                </View>
                
                <View className="mx-4 mb-4">
                    <Text className="tracking-[2px] font-medium text-slate-500 mb-1">CANCELLATION POLICY</Text>
                    <Text className="tracking-wide text-xs text-slate-500">
                        To fairly compensate our vendors, we request you to cancel your order within 30 seconds of placing it. After that, you will be charged 50% of the total amount.
                    </Text>
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-white p-4">
                <TouchableOpacity
                    className={`rounded-lg py-3 ${isProcessing ? 'bg-gray-400' : 'bg-green-700'}`}
                    onPress={handleMultipleCheckout}
                    disabled={isProcessing}
                >
                    <View className="flex-row justify-center items-center">
                        {isProcessing ? (
                            <>
                                <ActivityIndicator size="small" color="white" />
                                <Text className="text-white font-bold ml-2">Processing Orders...</Text>
                            </>
                        ) : (
                            <>
                                <Text className="text-white font-bold">Place All Orders • ₹{finalTotal.toFixed(2)}</Text>
                                <FontAwesome name="arrow-right" size={16} color="white" className="ml-2" />
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default CheckoutPage;
