import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, RefreshControl, Dimensions, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExternalPathString, Redirect, RelativePathString, useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';
import CartSummary from '@/components/Cart';
import { adminOptions, studentOptions, vendorOptions } from '@/constants/types';
import Sidebar from '@/components/Sidebar';
import { Icon } from '@roninoss/icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

const EXTERNAL_LINKS = [
    {
        name: 'Netra',
        icon: 'http://kmit-netra.teleuniv.in/assets/sanjaya_about-DDG5ALmJ.png',
        url: 'http://kmit-netra.teleuniv.in',
    },
    {
        name: 'Sanjaya',
        icon: 'http://kmit-netra.teleuniv.in/assets/sanjaya_about-DDG5ALmJ.png',
        url: 'http://kmit-sanjaya.teleuniv.in',
    },
    {
        name: 'Tesseract',
        icon: 'https://tesseractonline.com/favicon-orange.png',
        url: 'https://tesseractonline.com',
    },
    {
        name: 'KMIT',
        icon: 'https://kmit.in/favicon.ico',
        url: 'https://kmit.in',
    },
    {
        name: 'KMIT Alumni',
        icon: 'https://media.almabaseapp.com/268/meta/KMIT.png',
        url: 'https://alumni.kmit.in',
    },
    {
        name: 'Telescope',
        icon: 'http://kmitonline.com/theme/image.php/universo/theme/1739203259/favicon',
        url: 'http://kmitonline.com/login/index.php',
    },
    {
        name: 'Alumnx',
        icon: 'https://alumnx.com/logo.png',
        url: 'https://play.google.com/store/apps/details?id=com.alumnx.app&hl=en_IN&pli=1',
    },
];

const Home = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
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

    const handleRefresh = () => {
        setRefreshing(true);
        router.replace('/');
        setRefreshing(false);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            router.replace('/');
            setRefreshing(false);
        }, 500);
    }, []);

    const ServiceCard = ({ name, icon, color, url }: { name: string; icon: string; color?: string; url: RelativePathString | ExternalPathString; }) => (
        <TouchableOpacity
            onPress={() => {
                if (url.startsWith('http')) {
                    Linking.openURL(url);
                } else {
                    router.push(url);
                }
            }}
            style={[styles.card]}
            className="p-4 rounded-lg flex justify-center items-center"
        >
            <Image source={{ uri: icon }} style={{ width: 70, height: 50 }} resizeMode="contain" />
            <Text className="text-green-900 text-sm mt-3 text-center w-[100px]">{name}</Text>
        </TouchableOpacity>
    );

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
            <StatusBar barStyle="default" />

            <View className="flex-row align-items-center p-4" style={styles.header}>
                <TouchableOpacity onPress={openSidebar}>
                    <MaterialCommunityIcons name="menu" size={24} color="black" />
                </TouchableOpacity>
                <Text className="ml-4 font-bold text-[18px]">Campus 360</Text>
                <TouchableOpacity onPress={handleRefresh} style={{ marginLeft: 'auto' }}>
                    <MaterialCommunityIcons name="refresh" size={24} color="black" />
                </TouchableOpacity>
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

            <ScrollView 
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View className="mb-4 px-4">
                    <Image
                        source={require('@/assets/images/banner.png')}
                        style={styles.banner}
                        resizeMode="cover"
                    />
                </View>
                <View className="px-4">
                    <Text className="text-lg font-bold text-zinc-900 mb-4">Services</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                        {(!user?.role || user?.role === 'student' || user?.role === 'admin') && (
                            <>
                                {
                                    Object.entries(studentOptions).map(([key, { name, icon, color, url }]) => (
                                        <ServiceCard key={key} name={name} icon={icon} color={color} url={url as RelativePathString | ExternalPathString} />
                                    ))
                                }
                            </>
                        )}
                    </View>
                </View>
                
                <View className="px-4 mt-6">
                    <Text className="text-lg font-bold text-zinc-900 mb-4">College Apps</Text>
                    <View className="flex flex-row flex-wrap gap-2">
                        {EXTERNAL_LINKS.map((link, index) => (
                            <ServiceCard key={index} name={link.name} icon={link.icon} url={link.url as RelativePathString | ExternalPathString} />
                        ))}
                    </View>
                </View>
                {(user?.role === 'admin' || user?.role === 'vendor') && (
                    <View className="px-4 mt-6">
                        <Text className="text-lg font-bold text-zinc-900 mb-4">Admin & Vendor</Text>
                        <View className="flex flex-row flex-wrap gap-2">
                            <>
                                {
                                    Object.entries(vendorOptions).map(([key, { name, icon, color, url }]) => (
                                        <ServiceCard key={key} name={name} icon={icon} color={color} url={url as RelativePathString | ExternalPathString} />
                                    ))
                                }
                                {
                                    Object.entries(adminOptions).map(([key, { name, icon, color, url }]) => (
                                        <ServiceCard key={key} name={name} icon={icon} color={color} url={url as RelativePathString | ExternalPathString} />
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
