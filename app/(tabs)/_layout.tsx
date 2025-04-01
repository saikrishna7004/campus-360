import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';
import { TouchableOpacity, Text, SafeAreaView } from 'react-native';

export default function TabsLayout() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (!isAuthenticated && segments[0] === '(tabs)') {
            router.replace('/login');
        }
    }, [isAuthenticated, segments]);
    
    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <Stack />
    )
}
