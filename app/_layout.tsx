import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'
import "@/global.css"
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    const { fetchCartFromCloud } = useCartStore();
    const { isAuthenticated, getAuthHeader } = useAuthStore();

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    useEffect(() => {
        if (isAuthenticated) {
            const loadCart = async () => {
                try {
                    await fetchCartFromCloud(getAuthHeader());
                } catch (error) {
                    console.error('Failed to fetch latest cart:', error);
                }
            };
            loadCart();
        }
    }, [isAuthenticated]);

    if (!loaded) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
                        <Stack.Screen name="login" options={{ headerShown: false }} />
                        <Stack.Screen name="register" options={{ headerShown: false }} />
                        <Stack.Screen name="profile" options={{ headerTitle: "Profile", headerStyle: { backgroundColor: '#f5f5f5' }, headerTintColor: '#166534' }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="order-confirmation" options={{ headerTitle: "Order Confirmation", headerStyle: { backgroundColor: '#f5f5f5' }, headerTintColor: '#166534' }} />
                        <Stack.Screen 
                            name="admin/(tabs)/order-details" 
                            options={{ 
                                headerShown: true,
                                headerTitle: "Order Details",
                                headerStyle: { backgroundColor: '#f5f5f5' },
                                presentation: 'modal'
                            }} 
                        />
                        <Stack.Screen 
                            name="admin/news" 
                            options={{ 
                                headerShown: true,
                                headerTitle: "News Management",
                                headerStyle: { backgroundColor: '#f5f5f5' }
                            }} 
                        />
                        <Stack.Screen 
                            name="news" 
                            options={{ 
                                headerShown: true,
                                headerTitle: "News",
                                headerStyle: { backgroundColor: '#f5f5f5' }
                            }} 
                        />
                        <Stack.Screen name="admin-order-details" options={{ headerShown: true, headerTitle: "Order Details", headerStyle: { backgroundColor: '#f5f5f5' } }} />
                        <Stack.Screen name="not-found" />
                        <Stack.Screen name="forgot-password" options={{ headerTitle: "Reset Password", headerStyle: { backgroundColor: '#f5f5f5' } }} />
                    </Stack>
                    <StatusBar style="dark" />
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}
