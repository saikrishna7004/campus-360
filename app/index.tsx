import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';

const Home = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <View className="px-2 mb-4">
                <View className="flex-row justify-between items-center mb-6 mt-4 px-2">
                    <View>
                        <Text className="text-2xl font-bold text-green-800">Campus 360</Text>
                        <Text className="text-base text-gray-700">Welcome, {user?.name}</Text>
                        {user?.type && (
                            <Text className="text-sm text-blue-700">Vendor: {user.type}</Text>
                        )}
                    </View>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => router.push('/my-orders')}
                            className="p-2 rounded-full bg-green-100"
                        >
                            <FontAwesome name="shopping-bag" size={24} color="#166534" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/profile')}
                            className="p-2 rounded-full bg-green-100"
                        >
                            <FontAwesome name="user" size={24} color="#166534" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="p-2 rounded-full bg-red-100"
                        >
                            <FontAwesome name="sign-out" size={24} color="#DC2626" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex flex-row flex-wrap justify-center gap-4">
                    {(!user?.role || user?.role === 'student' || user?.role === 'admin' || (user?.role === 'canteen' && user?.type === 'food')) && (
                        <TouchableOpacity onPress={() => router.push('/canteen')} style={styles.card} className="bg-green-500 p-6 rounded-xl shadow-lg flex justify-center items-center">
                            <MaterialCommunityIcons name="food" size={40} color="white" />
                            <Text className="text-white text-lg mt-4">Canteen</Text>
                        </TouchableOpacity>
                    )}

                    {(!user?.role || user?.role === 'student' || user?.role === 'admin') && (
                        <TouchableOpacity onPress={() => router.push('/library')} style={styles.card} className="bg-blue-500 p-6 rounded-xl shadow-lg flex justify-center items-center">
                            <MaterialCommunityIcons name="book-open" size={40} color="white" />
                            <Text className="text-white text-lg mt-4">Library</Text>
                        </TouchableOpacity>
                    )}

                    {(!user?.role || user?.role === 'student' || user?.role === 'admin' || (user?.role === 'canteen' && user?.type === 'stationery')) && (
                        <TouchableOpacity onPress={() => router.push('/stationary')} style={styles.card} className="bg-yellow-500 p-6 rounded-xl shadow-lg flex justify-center items-center">
                            <MaterialCommunityIcons name="pencil" size={40} color="white" />
                            <Text className="text-white text-lg mt-4">Stationery</Text>
                        </TouchableOpacity>
                    )}

                    {(!user?.role || user?.role === 'student' || user?.role === 'admin') && (
                        <TouchableOpacity onPress={() => router.push('/office')} style={styles.card} className="bg-gray-600 p-6 rounded-xl shadow-lg flex justify-center items-center">
                            <MaterialCommunityIcons name="briefcase" size={40} color="white" />
                            <Text className="text-white text-lg mt-4">Office</Text>
                        </TouchableOpacity>
                    )}

                    {(user?.role === 'admin' || (user?.role === 'canteen' && (!user?.type || user?.type === 'food'))) && (
                        <TouchableOpacity onPress={() => router.push('/admin/menu')} style={styles.card} className="bg-red-600 p-6 rounded-xl shadow-lg flex justify-center items-center">
                            <MaterialCommunityIcons name="chef-hat" size={40} color="white" />
                            <Text className="text-white text-lg mt-4">Vendor</Text>
                        </TouchableOpacity>
                    )}

                    {user?.role === 'admin' && (
                        <TouchableOpacity onPress={() => router.push('/admin/menu')} style={styles.card} className="bg-blue-600 p-6 rounded-xl shadow-lg flex justify-center items-center">
                            <MaterialCommunityIcons name="shield-account" size={40} color="white" />
                            <Text className="text-white text-lg mt-4">Admin</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 150,
        height: 150,
    },
})

export default Home;
