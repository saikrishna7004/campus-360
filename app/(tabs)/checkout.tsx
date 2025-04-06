import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useCartStore, { VendorType } from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import useOrderStore from '@/store/orderStore';
import * as NavigationBar from 'expo-navigation-bar';
import { VENDOR_NAMES } from '@/constants/types';
import CartProduct from '@/components/CartProduct';
import Product from '@/components/Product';

const CheckoutPage = () => {
    const router = useRouter();
    const { isAuthenticated, getAuthHeader } = useAuthStore();
    const { placeOrder } = useOrderStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentOrderIndex, setCurrentOrderIndex] = useState(-1);
    const params = useLocalSearchParams();
    const vendor = (params.vendor as VendorType) || 'default';
    const { carts, clearCart, fetchCartFromCloud, syncCartToCloud } = useCartStore()
    const { placeOrder: storePlaceOrder } = useOrderStore()
    const [refreshing, setRefreshing] = useState(false)
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)

    const totalPrice = carts.reduce((total, cartItems) => {
        const cartTotal = cartItems.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return total + cartTotal;
    }, 0);

    NavigationBar.setButtonStyleAsync("dark");
    NavigationBar.setBackgroundColorAsync("white");

    useEffect(() => {
        if (isAuthenticated) {
            const loadCart = async () => {
                try {
                    await fetchCartFromCloud(getAuthHeader());
                } catch (error) {
                    console.error('Failed to load cart:', error);
                }
            };
            loadCart();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && carts.length > 0) {
            const syncCart = async () => {
                try {
                    await syncCartToCloud(getAuthHeader());
                } catch (error) {
                    console.error('Failed to sync cart:', error);
                }
            };
            syncCart();
        }
    }, [carts, isAuthenticated]);

    useEffect(() => {
        if (!vendor) {
            router.replace('/');
        }
    }, [vendor]);

    const handlePlaceOrder = async () => {
        if (carts.length === 0) {
            Alert.alert('Error', 'Your cart is empty!')
            return
        }

        setIsPlacingOrder(true)

        try {
            if (!isAuthenticated) {
                Alert.alert('Error', 'You need to be logged in to place an order')
                router.replace('/login')
                return
            }

            const orderItems = carts.flatMap(cartItems =>
                cartItems.items.map(item => ({
                    productId: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            );

            const authHeader = getAuthHeader();
            const orderId = await storePlaceOrder(
                orderItems,
                totalPrice + 2,
                vendor,
                authHeader
            );

            clearCart(vendor)
            await syncCartToCloud(authHeader);

            const totalAmountStr = (totalPrice + 2).toString();
            const itemsStr = JSON.stringify(orderItems);

            router.replace({
                pathname: '/order-confirmation',
                params: {
                    orderId,
                    totalAmount: totalAmountStr,
                    items: encodeURIComponent(itemsStr),
                    vendor
                }
            });
        } catch (error) {
            console.error('Error placing order:', error)
            Alert.alert('Error', 'Failed to place order. Please try again.')
        } finally {
            setIsPlacingOrder(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        if (isAuthenticated) {
            try {
                await fetchCartFromCloud(getAuthHeader());
            } catch (error) {
                console.error('Failed to refresh cart:', error);
            }
        }
        setRefreshing(false)
    }

    NavigationBar.setButtonStyleAsync("dark");
    NavigationBar.setBackgroundColorAsync("white");

    const totalAmount = carts?.reduce((sum, cartItems) => {
        const cartTotal = cartItems.items.reduce(
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
            return router.replace('/login');
        }

        setIsProcessing(true);
        const orderIds: string[] = [];
        const authHeader = getAuthHeader();

        try {
            for (let i = 0; i < carts.length; i++) {
                const cartItems = carts[i];
                const cartTotal = cartItems.items.reduce(
                    (sum, item) => sum + (item.price * item.quantity),
                    0
                );

                const orderItems = cartItems.items.map(item => ({
                    productId: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }));

                setCurrentOrderIndex(i);
                const orderId = await placeOrder(
                    orderItems,
                    cartTotal + 2,
                    cartItems.vendor,
                    authHeader
                );

                if (!orderId) throw new Error(`Failed to place order for ${VENDOR_NAMES[cartItems.vendor]}`);
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

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
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

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="bg-white mx-4 mb-2 p-4 rounded-xl">
                    <Text className="text-green-600 font-medium">Orders to be picked separately.</Text>
                </View>

                {carts.map((cartItems, index) => {
                    const cartTotal = cartItems.items.reduce(
                        (sum, item) => sum + (item.price * item.quantity), 0
                    );
                    const itemCount = cartItems.items.reduce(
                        (count, item) => count + item.quantity, 0
                    );

                    return (
                        <View key={index} className="bg-white mx-4 my-2 py-2 rounded-xl">
                            <View className="flex flex-row items-center px-4">
                                <View className="w-[15%] me-2 items-center">
                                    <Image source={{ uri: 'https://icons.veryicon.com/png/o/object/downstairs-buffet/canteen-1.png' }} className="w-10 h-10" resizeMode="contain" />
                                </View>
                                <View className="w-[80%]">
                                    <Text className="font-semibold">{VENDOR_NAMES[cartItems.vendor]}</Text>
                                    <Text className="text-xs text-gray-500">{itemCount} items</Text>
                                </View>
                            </View>

                            <View className="mt-4 mb-2 mx-4 border-b border-gray-200 border-dashed" />

                            <View className="px-2">
                                {cartItems.items.map((item, itemIndex) => (
                                    <CartProduct
                                        rootClassName='px-2 py-2'
                                        iconClassName='h-[50px] w-[40px] object-contain'
                                        key={itemIndex}
                                        item={{
                                            ...item,
                                            vendor: cartItems.vendor,
                                            category: 'default',
                                            imageUrl: item.imageUrl || 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg'
                                        }}
                                    />
                                ))}
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

                <View className="bg-white mx-4 my-2 p-4 rounded-xl mb-8">
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

                <View className="flex mx-3 bg-white rounded-2xl py-4">
                    <View className="flex flex-row justify-between items-center px-4 mb-4">
                        <Text className="text-gray-800">Subtotal</Text>
                        <Text className="font-medium text-gray-800">₹{totalAmount.toFixed(2)}</Text>
                    </View>
                    <View className="flex flex-row justify-between items-center px-4">
                        <Text className="text-gray-800">Platform Fee</Text>
                        <Text className="font-medium text-gray-800">₹{platformFee.toFixed(2)}</Text>
                    </View>
                    <View className="flex flex-row justify-between items-center px-4 mt-4">
                        <View className="border-t border-gray-200 w-[50%]"></View>
                        <View className="border-t border-gray-200 w-[50%]"></View>
                    </View>
                    <View className="flex flex-row justify-between items-center px-4 mt-4">
                        <Text className="text-gray-800">Total</Text>
                        <Text className="font-medium text-gray-800">₹{finalTotal.toFixed(2)}</Text>
                    </View>
                </View>
                <View className='p-4 gap-1'>
                    <Text className="tracking-[2px] font-medium text-slate-500">CANCELLATION POLICY</Text>
                    <Text className="tracking-wide text-xs text-slate-500">To fairly compensate our vendors, we request you to cancel your order within 30 seconds of placing it. After that, you will be charged 50% of the total amount.</Text>
                </View>

                <View className="mx-4 mb-4">
                    <Text className="tracking-[2px] font-medium text-slate-500 mb-1">CANCELLATION POLICY</Text>
                    <Text className="tracking-wide text-xs text-slate-500">
                        To fairly compensate our vendors, we request you to cancel your order within 30 seconds of placing it. After that, you will be charged 50% of the total amount.
                    </Text>
                </View>
            </ScrollView>
            <View className="absolute bottom-0 left-0 right-0 pt-4 pb-2 px-2 rounded-t-xl bg-white" style={{ boxShadow: '0px 0px 10px #0a0a0a2e' }}>
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex flex-col ps-2 pb-3">
                        <View className="flex flex-row items-center gap-1">
                            <View className="flex flex-col items-center justify-center object-cover rounded-full h-8 me-1">
                                <Image className="rounded-full" source={{ uri: 'https://www.srcu4u.com/creditunion/wp-content/uploads/2019/07/Google-Pay-Logo-01.png' }} width={30} height={15} />
                            </View>
                            <Text className="text-xs font-medium text-gray-500">PAY USING</Text>
                            <Text className="font-medium text-gray-800 -rotate-90"><FontAwesome className='ms-2' name='caret-right' size={16} color='gray' /></Text>
                        </View>
                        <Text className="text-sm font-medium text-gray-800 tracking-wider">Google Pay UPI</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleMultipleCheckout}
                        disabled={isPlacingOrder}
                        className={`w-[60%] py-3 ${isPlacingOrder ? 'bg-gray-500' : 'bg-green-800'} rounded-lg px-4 flex flex-row justify-between items-center`}
                    >
                        <View className="flex flex-col">
                            <Text className="font-medium text-white">₹{finalTotal.toFixed(2)}</Text>
                            <Text className="text-xs text-gray-200">TOTAL</Text>
                        </View>
                        <View className="flex flex-row gap-2">
                            <Text className="text-white text-center text-lg">{isPlacingOrder ? 'Placing Order...' : 'Place Order'}</Text>
                            <Text className="text-white text-center text-lg"><FontAwesome className='ms-2' name='caret-right' size={20} /></Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default CheckoutPage;
