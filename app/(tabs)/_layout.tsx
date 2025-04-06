import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import useAuthStore from '@/store/authStore';

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
