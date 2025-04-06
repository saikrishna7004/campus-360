import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, PanResponder, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';
import CartSummary from '@/components/Cart';
import { adminOptions, studentOptions, vendorOptions } from '@/constants/types';
import Sidebar from '@/components/Sidebar';
import { Icon } from '@roninoss/icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

const Home = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const translateX = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;
    const router = useRouter();

    const openSidebar = () => {
        setSidebarVisible(true);
        Animated.timing(translateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeSidebar = () => {
        Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH * 0.75,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSidebarVisible(false));
    };

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="white" />

            <View className="flex-row align-items-center p-4" style={styles.header}>
                <TouchableOpacity onPress={openSidebar}>
                    <MaterialCommunityIcons name="menu" size={24} color="black" />
                </TouchableOpacity>
                <Text className="ml-4 font-bold text-[18px]">Campus 360</Text>
            </View>

            {sidebarVisible && (
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={closeSidebar}
                    activeOpacity={1}
                />
            )}

            <Sidebar
                openSidebar={openSidebar}
                closeSidebar={closeSidebar}
                translateX={translateX}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="mb-4 px-4">
                    <Image
                        source={require('@/assets/images/banner.png')}
                        style={styles.banner}
                        resizeMode="cover"
                    />
                </View>
                <View className="px-4">
                    <Text className="text-lg font-bold text-green-900 mb-4">Services</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                        {(!user?.role || user?.role === 'student' || user?.role === 'admin') && (
                            <>
                                {
                                    Object.entries(studentOptions).map(([key, { name, icon, color, url }]) => (
                                        <TouchableOpacity key={key} onPress={() => router.push(url)} style={styles.card} className="p-4 rounded-lg flex justify-center items-center">
                                            <Image source={{ uri: icon }} style={{ width: 60, height: 60 }} />
                                            <Text className="text-green-900 text-sm mt-2">{name}</Text>
                                        </TouchableOpacity>
                                    ))
                                }
                            </>
                        )}
                    </View>
                </View>
                {(user?.role === 'admin' || user?.role === 'vendor') && (
                    <View className="px-4 mt-6">
                        <Text className="text-lg font-bold text-green-900 mb-4">Admin & Vendor</Text>
                        <View className="flex flex-row flex-wrap gap-2">
                            <>
                                {
                                    Object.entries(vendorOptions).map(([key, { name, icon, color, url }]) => (
                                        <TouchableOpacity key={key} onPress={() => router.push(url)} style={styles.card} className="p-4 rounded-lg flex justify-center items-center">
                                            <Image source={{ uri: icon }} style={{ width: 60, height: 60 }} />
                                            <Text className="text-green-900 text-sm mt-2">{name}</Text>
                                        </TouchableOpacity>
                                    ))
                                }
                                {
                                    Object.entries(adminOptions).map(([key, { name, icon, color, url }]) => (
                                        <TouchableOpacity key={key} onPress={() => router.push(url)} style={styles.card} className="p-4 rounded-lg flex justify-center items-center">
                                            <Image source={{ uri: icon }} style={{ width: 60, height: 60 }} />
                                            <Text className="text-green-900 text-sm mt-2">{name}</Text>
                                        </TouchableOpacity>
                                    ))
                                }
                            </>
                        </View>
                    </View>
                )}
            </ScrollView>
            <CartSummary />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '75%',
        backgroundColor: 'white',
        zIndex: 10,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
    },
    sidebarTop: {
        backgroundColor: '#166534',
        padding: 16,
        paddingTop: 40,
        borderBottomLeftRadius: 20,
    },
    sidebarHeader: {
        marginBottom: 16,
        paddingTop: 20
    },
    sidebarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    sidebarSubText: {
        fontSize: 14,
        color: 'white',
        marginTop: 4,
    },
    sidebarContent: {
        padding: 8,
        paddingTop: 30,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
    },
    sidebarItemText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#166534',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 5,
    },
    banner: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    card: {
        flexDirection: 'column',
        width: '31%',
        height: 120,
        borderRadius: 10,
        backgroundColor: '#efefef',
    },
});

export default Home;
