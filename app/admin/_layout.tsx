import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Switch, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Audio } from 'expo-av';
import Orders from './orders';
import Menu from './menu';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useOrderStore from '@/store/orderStore';
import useAuthStore, { User } from '@/store/authStore';

const Tab = createBottomTabNavigator();

const AdminLayout = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastOrderCount, setLastOrderCount] = useState(0);
    const sound = useRef<Audio.Sound | null>(null);
    const { orders, fetchOrders, loading } = useOrderStore();
    const { getAuthHeader, user } = useAuthStore();

    const preparingOrdersCount = orders.filter((order) => order.status === 'preparing').length;

    const loadSound = async () => {
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(require('@/assets/sounds/notification.mp3'));
            sound.current = newSound;
        } catch { }
    };

    const playNotificationSound = async () => {
        try {
            if (sound.current) {
                await sound.current.replayAsync();
            }
        } catch { }
    };

    useEffect(() => {
        loadSound();
        fetchOrders(getAuthHeader());
        const interval = setInterval(() => {
            setIsRefreshing(true);
            fetchOrders(getAuthHeader()).finally(() => {
                setIsRefreshing(false);
            });
        }, 10000);
        return () => {
            clearInterval(interval);
            if (sound.current) {
                sound.current.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        if (preparingOrdersCount > lastOrderCount && lastOrderCount !== 0) {
            playNotificationSound();
        }
        setLastOrderCount(preparingOrdersCount);
    }, [preparingOrdersCount]);

    const toggleOnlineStatus = async (value: boolean) => {
        setIsOnline(value);
        try {
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/vendor/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isOnline: value }),
            });
        } catch { }
    };

    const refreshData = () => {
        setIsRefreshing(true);
        fetchOrders(getAuthHeader()).finally(() => {
            setIsRefreshing(false);
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Tab.Navigator
                screenOptions={({ route }: { route: any }) => ({
                    header: () => (
                        <View className="flex-row justify-between items-center px-4 py-2 bg-white border-b border-gray-200">
                            <View className="flex-row items-center">
                                <Text className="text-lg font-bold mr-2">{route.name}</Text>
                                {isRefreshing && <ActivityIndicator size="small" color="#666" />}
                            </View>
                            <View className="flex-row items-center">
                                <TouchableOpacity onPress={refreshData} className="mr-4" disabled={isRefreshing || loading}>
                                    <MaterialCommunityIcons name="refresh" size={24} color={isRefreshing || loading ? '#999' : '#333'} />
                                </TouchableOpacity>
                                <Text className="text-sm me-2">{isOnline ? 'Online' : 'Offline'}</Text>
                                <Switch value={isOnline} onValueChange={toggleOnlineStatus} />
                            </View>
                        </View>
                    ),
                    tabBarStyle: {
                        backgroundColor: '#fff',
                        borderTopWidth: 0,
                        elevation: 0,
                        height: 60,
                    },
                    tabBarActiveTintColor: '#4A9D5B',
                    tabBarInactiveTintColor: '#999',
                    tabBarLabelStyle: {
                        fontSize: 12,
                        marginBottom: 4,
                    },
                    tabBarIconStyle: {
                        marginTop: 4,
                        marginBottom: 0,
                    },
                    tabBarItemStyle: {
                        borderTopWidth: 0,
                    },
                })}
            >
                <Tab.Screen
                    name="Orders"
                    component={Orders}
                    options={{
                        tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="clipboard-list" color={color} size={size} />,
                        tabBarBadge: preparingOrdersCount > 0 ? preparingOrdersCount : undefined,
                    }}
                />
                <Tab.Screen
                    name="Menu"
                    component={Menu}
                    options={{
                        tabBarIcon: ({ color, size }: { color: string; size: number }) => <MaterialCommunityIcons name="food" color={color} size={size} />,
                    }}
                />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export default AdminLayout;
