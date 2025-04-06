import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCartStore, { VendorType } from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/cn';
import { VENDOR_NAMES } from '@/constants/types';

const { height: screenHeight } = Dimensions.get('window');

const CartSummary = () => {
    const { carts = [], clearCart, fetchCartFromCloud } = useCartStore();
    const { isAuthenticated, getAuthHeader } = useAuthStore();
    const router = useRouter();
    const [viewAll, setViewAll] = useState(false);
    const [marginAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(1));
    const [opacityAnim] = useState(new Animated.Value(1));
    const [backdropOpacityAnim] = useState(new Animated.Value(0.3));
    const [showBackDrop, setShowBackDrop] = useState(false);

    useEffect(() => {
        Animated.timing(marginAnim, {
            toValue: viewAll ? 10 : -52,
            duration: 200,
            useNativeDriver: false,
        }).start();

        Animated.timing(scaleAnim, {
            toValue: viewAll ? 1 : 0.95,
            duration: 200,
            useNativeDriver: false,
        }).start();

        Animated.timing(opacityAnim, {
            toValue: viewAll ? 1 : 0.5,
            duration: 200,
            useNativeDriver: false,
        }).start();

        setShowBackDrop(true);

        Animated.timing(backdropOpacityAnim, {
            toValue: viewAll ? 0.3 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start(() => {
            setShowBackDrop(viewAll);
        });
    }, [viewAll]);

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

    interface ClearCartHandler {
        (vendor: VendorType): Promise<void>;
    }

    const handleClearCart: ClearCartHandler = async (vendor) => {
        try {
            await clearCart(vendor);
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    if (!carts || carts.length === 0) return null;

    return (
        <SafeAreaView className="relative bg-transparent flex-1">
            {showBackDrop && <Animated.View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: screenHeight,
                opacity: backdropOpacityAnim,
                backgroundColor: 'black',
            }} />}
            <View className={cn("absolute bottom-0 left-0 right-0", {
                "bg-transparent px-3 mb-4 py-2": !viewAll,
                "bg-gray-50 px-1 rounded-t-xl pt-2": viewAll,
            })} style={{ boxShadow: viewAll ? '0px 0px 15px #0a0a0a2e' : 'none' }}>
                <View className={cn("rounded-xl", {
                    "px-2 py-2 bg-gray-50": viewAll,
                })}>
                    {viewAll && <Animated.View style={{
                        opacity: opacityAnim,
                    }}>
                        <TouchableOpacity className="absolute flex flex-row items-center gap-1 self-center p-2 rounded-full" style={{ boxShadow: '0px 0px 10px #0a0a0a0f', backgroundColor: 'gray', top: -60 }} onPress={() => setViewAll(false)}>
                            <MaterialCommunityIcons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                        <View className="flex-row justify-between mb-4 mx-1 items-center">
                            <Text className="text-[18px] font-semibold">Your Carts ({carts.length})</Text>
                            <TouchableOpacity
                                className="flex flex-row items-center gap-2 bg-white border border-gray-200 px-3 py-1 rounded-lg"
                                onPress={() => router.push('/checkout')}
                                style={{ boxShadow: '0px 0px 10px #0a0a0a0f' }}
                            >
                                <Text className="text-green-700 text-sm font-semibold">Checkout all</Text>
                                <FontAwesome name="caret-right" size={14} color="#4A9D5B" style={{ marginLeft: 2 }} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>}

                    {!viewAll && carts.length > 1 && (
                        <TouchableOpacity className="absolute -top-2 flex flex-row items-center gap-1 self-center bg-white px-3 py-1 rounded-full z-10" style={{ boxShadow: '0px 0px 10px #0a0a0a0f' }} onPress={() => setViewAll(true)}>
                            <Text className="text-green-700 font-semibold text-xs">View All</Text>
                            <FontAwesome name="caret-up" size={10} color="#4A9D5B" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    )}

                    {carts.map((cart, index) => {
                        if (!cart || !cart.items) return null;

                        const vendorTotalPrice = cart.items.reduce(
                            (acc, item) => acc + parseFloat((item.price * item.quantity).toFixed(2)), 0
                        );
                        const vendorItemCount = cart.items.reduce(
                            (acc, item) => acc + item.quantity, 0
                        );
                        const displayName = VENDOR_NAMES[cart.vendor];
                        const isLastItem = index === carts.length - 1;
                        const scaleValue = isLastItem ? 1 : scaleAnim;

                        return (
                            <Animated.View key={cart.vendor} className={cn("flex-row justify-between bg-white px-2 rounded-lg", {
                                "-mb-12": !viewAll && (index !== carts.length - 1),
                                "mb-3": viewAll,
                            })} style={{
                                boxShadow: '0px 0px 10px #0a0a0a1f',
                                marginBottom: (index !== carts.length - 1) ? marginAnim : (viewAll ? 16 : 0),
                                transform: [{ scale: scaleValue }],
                                paddingVertical: 10,
                            }}>
                                <View className="flex-row items-center gap-x-2 justify-center">
                                    <Image width={40} height={40} className="rounded-full" source={{ uri: 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg' }} />
                                    <View>
                                        <Text className="text-[16px] font-semibold">{displayName} Order</Text>
                                        <Text className="text-xs text-zinc-700">Total: ₹{vendorTotalPrice.toFixed(2)}</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center gap-x-2">
                                    <TouchableOpacity className="bg-green-700 px-4 py-1 rounded-lg" onPress={() => router.push(`/cart?vendor=${cart.vendor}`)}>
                                        <Text className="text-white font-semibold">View Cart</Text>
                                        <Text className="text-zinc-100 text-xs text-center">{vendorItemCount} items</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="bg-gray-100 p-2 rounded-full" onPress={() => handleClearCart(cart.vendor)}>
                                        <FontAwesome name="times" color="gray" />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default CartSummary;
