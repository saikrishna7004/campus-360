import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useAuthStore from '@/store/authStore';

const Sidebar = (
    { translateX, openSidebar, closeSidebar }: { translateX: Animated.Value; openSidebar: () => void; closeSidebar: () => void; }
) => {
    const SCREEN_WIDTH = Dimensions.get('window').width;
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (_, gestureState) => gestureState.dx > 20,
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dx > 20,
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dx > 0 && gestureState.dx < SCREEN_WIDTH * 0.75) {
                translateX.setValue(gestureState.dx - SCREEN_WIDTH * 0.75);
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dx > SCREEN_WIDTH * 0.25) {
                openSidebar();
            } else {
                closeSidebar();
            }
        },
    });

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    return (
        <Animated.View style={[styles.sidebar, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
            <View style={styles.sidebarTop}>
                <View style={styles.sidebarHeader}>
                    <Text style={styles.sidebarText}>Hello, {user?.name}</Text>
                    {user?.type && <Text style={styles.sidebarSubText}>Vendor: {user.type}</Text>}
                    <Text style={styles.sidebarSubText}>Role: {user?.role || 'Student'}</Text>
                </View>
            </View>
            <View style={styles.sidebarContent}>
                <TouchableOpacity onPress={() => { closeSidebar(); router.push('/my-orders'); }} style={styles.sidebarItem}>
                    <FontAwesome name="shopping-bag" size={20} color="#166534" />
                    <Text style={styles.sidebarItemText}>My Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { closeSidebar(); router.push('/profile'); }} style={styles.sidebarItem}>
                    <FontAwesome name="user" size={20} color="#166534" />
                    <Text style={styles.sidebarItemText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.sidebarItem}>
                    <FontAwesome name="sign-out" size={20} color="#166534" />
                    <Text style={styles.sidebarItemText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}


const styles = StyleSheet.create({
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
});

export default Sidebar
