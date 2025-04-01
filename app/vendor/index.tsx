import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';
import axios from 'axios';

const VendorDashboard = () => {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const toggleOnlineStatus = async (value: boolean) => {
        setIsOnline(value);
        try {
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/vendor/status`, {
                isOnline: value,
                type: user?.type
            });
        } catch (error) {
            console.error('Failed to update online status', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A9D5B']} />}
        >
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.nameText}>{user?.name}</Text>
            </View>

            <View style={styles.onlineStatusContainer}>
                <Text style={styles.onlineStatusText}>
                    Store Status: {isOnline ? 'Online' : 'Offline'}
                </Text>
                <Switch
                    value={isOnline}
                    onValueChange={toggleOnlineStatus}
                    trackColor={{ false: '#E5E5E5', true: '#E1F5E4' }}
                    thumbColor={isOnline ? '#4A9D5B' : '#f4f3f4'}
                />
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>32</Text>
                    <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>12</Text>
                    <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>₹8.5k</Text>
                    <Text style={styles.statLabel}>Sales</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Menu</Text>

            <View style={styles.menuGrid}>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/vendor/inventory')}>
                    <View style={styles.menuIconContainer}>
                        <FontAwesome5 name="box" size={22} color="#4A9D5B" />
                    </View>
                    <Text style={styles.menuLabel}>Inventory</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/vendor/orders')}>
                    <View style={styles.menuIconContainer}>
                        <FontAwesome5 name="shopping-bag" size={22} color="#4A9D5B" />
                    </View>
                    <Text style={styles.menuLabel}>Orders</Text>
                </TouchableOpacity>
{/* 
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/vendor/sales')}>
                    <View style={styles.menuIconContainer}>
                        <FontAwesome5 name="chart-line" size={22} color="#4A9D5B" />
                    </View>
                    <Text style={styles.menuLabel}>Analytics</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/vendor/profile')}>
                    <View style={styles.menuIconContainer}>
                        <FontAwesome5 name="user-circle" size={22} color="#4A9D5B" />
                    </View>
                    <Text style={styles.menuLabel}>Profile</Text>
                </TouchableOpacity> */}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <FontAwesome5 name="sign-out-alt" size={18} color="#FF6B6B" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        padding: 16,
    },
    welcomeSection: {
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    onlineStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    onlineStatusText: {
        fontSize: 16,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    menuItem: {
        width: '48%',
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    menuIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E1F5E4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#FF6B6B',
        borderRadius: 8,
    },
    logoutText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
        color: '#FF6B6B',
    },
});

export default VendorDashboard;
