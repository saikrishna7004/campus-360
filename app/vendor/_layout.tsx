import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import useAuthStore, { User } from '@/store/authStore';
import axios from 'axios';
import useRoleProtection from '@/hooks/useRoleProtection';

const VendorLayout = () => {
    const [isOnline, setIsOnline] = useState(true);
    const { user } = useAuthStore();
    const { isLoading } = useRoleProtection(['vendor']);

    const toggleOnlineStatus = async (value: boolean) => {
        setIsOnline(value);
        try {
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/vendor/status`, {
                isOnline: value,
                type: user?.type,
            });
        } catch {}
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4A9D5B" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#FFFFFF',
                    },
                    headerTintColor: '#4A9D5B',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerShadowVisible: false,
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Vendor Dashboard', headerTitleAlign: 'center' }} />
                <Stack.Screen name="inventory" options={{ title: 'Inventory Management', headerTitleAlign: 'center' }} />
                <Stack.Screen name="orders" options={{ title: 'Orders', headerTitleAlign: 'center' }} />
                <Stack.Screen name="sales" options={{ title: 'Sales Analytics', headerTitleAlign: 'center' }} />
                <Stack.Screen name="profile" options={{ title: 'Vendor Profile', headerTitleAlign: 'center' }} />
            </Stack>
        </SafeAreaView>
    );
};

export default VendorLayout;
