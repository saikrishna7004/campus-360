import { useFonts } from 'expo-font'
import { Stack, useRouter } from 'expo-router'
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
    const { isAuthenticated, token, verifyToken, getAuthHeader } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    useEffect(() => {
        if (token && isAuthenticated) {
            const loadCart = async () => {
                try {
                    await fetchCartFromCloud(getAuthHeader());
                } catch (error) {
                    console.error('Failed to fetch latest cart:', error);
                }
            };
            loadCart();
        }
    }, [token, isAuthenticated]);

    useEffect(() => {
        if (token) {
            verifyToken();
        }
    }, [token]);

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
                        <Stack.Screen name="profile" options={{ headerTitle: "Profile", headerStyle: { backgroundColor: '#ffffff' }}} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="order-confirmation" options={{ headerTitle: "Order Confirmation", headerStyle: { backgroundColor: '#ffffff' }}} />
                        <Stack.Screen name="order-details" options={{ headerTitle: "Order Details", headerShown: true, headerStyle: { backgroundColor: '#ffffff' }}} />
                        <Stack.Screen name="my-orders" options={{ headerTitle: "My Orders", headerShown: true, headerStyle: { backgroundColor: '#ffffff' }}} />
                        <Stack.Screen name="news" options={{ headerShown: true, headerTitle: "News", headerStyle: { backgroundColor: '#ffffff' }}} />
                        <Stack.Screen name="admin-order-details" options={{ headerShown: true, headerTitle: "Order Details", headerStyle: { backgroundColor: '#ffffff' } }} />
                        <Stack.Screen name="not-found" />
                        <Stack.Screen name="forgot-password" options={{ headerTitle: "Reset Password", headerStyle: { backgroundColor: '#ffffff' } }} />
                    </Stack>
                    <StatusBar style="dark" />
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}
