import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import useCartStore, { VendorType } from '@/store/cartStore'
import useAuthStore from '@/store/authStore'
import { FontAwesome } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const VENDOR_NAMES: Record<VendorType, string> = {
    'canteen': 'Canteen',
    'stationery': 'Stationery Store',
    'default': 'Campus Store'
};

const Cart = () => {
    const { carts, clearCart, fetchCartFromCloud } = useCartStore()
    const { isAuthenticated, getAuthHeader } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated) {
            const syncCart = async () => {
                try {
                    await fetchCartFromCloud(getAuthHeader());
                    await useCartStore.getState().syncCartToCloud(getAuthHeader());
                } catch (error) {
                    console.error('Failed to sync cart:', error);
                }
            };
            syncCart();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && carts.length > 0) {
            const syncCartToCloud = async () => {
                try {
                    await useCartStore.getState().syncCartToCloud(getAuthHeader());
                } catch (error) {
                    console.error('Failed to sync cart to cloud:', error);
                }
            };
            syncCartToCloud();
        }
    }, [carts, isAuthenticated]);

    if (carts.length === 0) return <SafeAreaView className="flex-1 -mb-12"></SafeAreaView>;

    const totalItems = carts.reduce((total, cart) => 
        total + cart.items.reduce((sum, item) => sum + item.quantity, 0), 0);
    
    const totalPrice = carts.reduce((total, cart) => 
        total + cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 0);

    return (
        <SafeAreaView className="relative flex-1 mb-4 mx-2">
            <View className="absolute bottom-0 left-0 right-0 px-2 py-2 rounded-xl bg-white" style={{ boxShadow: '0px 0px 15px #0a0a0a2e' }}>
                {carts.map((cart) => {
                    const vendorTotalPrice = cart.items.reduce(
                        (acc, item) => acc + item.price * item.quantity, 0
                    );
                    const vendorItemCount = cart.items.reduce(
                        (acc, item) => acc + item.quantity, 0
                    );
                    
                    const displayName = VENDOR_NAMES[cart.vendor];
                    
                    return (
                        <View key={cart.vendor} className="flex-row justify-between mb-2">
                            <View className="flex-row items-center gap-x-2 justify-center">
                                <Image width={40} height={40} className='rounded-full' source={{ uri: 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg' }} />
                                <View>
                                    <Text className="text-[16px] font-semibold">
                                        {displayName} Order
                                    </Text>
                                    <Text className="text-xs text-zinc-700">Total: ₹{vendorTotalPrice}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center gap-x-2">
                                <TouchableOpacity 
                                    className="bg-green-700 px-4 py-1 rounded-lg" 
                                    onPress={() => router.push(`/cart?vendor=${cart.vendor}`)}
                                >
                                    <Text className="text-white font-semibold">View Cart</Text>
                                    <Text className="text-zinc-100 text-xs text-center">{vendorItemCount} items</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className="bg-gray-100 p-2 rounded-full" 
                                    onPress={() => clearCart(cart.vendor)}
                                >
                                    <FontAwesome name="times" color='gray' />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
                
                {carts.length > 1 && (
                    <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
                        <View className="flex-row items-center gap-x-2">
                            <TouchableOpacity 
                                className="bg-blue-600 px-4 py-2 rounded-lg"
                                onPress={() => router.push('/my-orders')}
                            >
                                <Text className="text-white font-semibold">My Orders</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                            className="bg-green-700 px-4 py-2 rounded-lg"
                            onPress={() => router.push('/checkout')}
                        >
                            <Text className="text-white font-semibold">Checkout All</Text>
                            <Text className="text-zinc-100 text-xs text-center">₹{totalPrice} • {totalItems} items</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    )
}

export default Cart
