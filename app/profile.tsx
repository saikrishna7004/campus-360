import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';

const Profile = () => {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-white">
            <View className="flex-1 p-6">
                <View className="items-center mt-6 mb-8">
                    <View className="bg-green-100 p-6 rounded-full mb-4">
                        <FontAwesome name="user" size={60} color="#166534" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">{user?.name}</Text>
                    <Text className="text-lg text-gray-600">{user?.email}</Text>
                    <View className="bg-green-100 px-4 py-1 rounded-full mt-2">
                        <Text className="text-green-800 capitalize">{user?.role}</Text>
                    </View>
                    {user?.type && (
                        <View className="bg-blue-100 px-4 py-1 rounded-full mt-2">
                            <Text className="text-blue-800 capitalize">Vendor Type: {user.type}</Text>
                        </View>
                    )}
                </View>

                <View className="space-y-4 mt-6">
                    <View className="bg-gray-100 p-4 rounded-xl">
                        <Text className="text-lg font-semibold text-gray-700">Account Information</Text>
                        <View className="mt-2">
                            <View className="flex-row justify-between py-2 border-b border-gray-200">
                                <Text className="text-gray-600">User ID</Text>
                                <Text className="text-gray-800">{user?.id}</Text>
                            </View>
                            <View className="flex-row justify-between py-2 border-b border-gray-200">
                                <Text className="text-gray-600">Role</Text>
                                <Text className="text-gray-800 capitalize">{user?.role}</Text>
                            </View>
                            {user?.type && (
                                <View className="flex-row justify-between py-2 border-b border-gray-200">
                                    <Text className="text-gray-600">Vendor Type</Text>
                                    <Text className="text-gray-800 capitalize">{user.type}</Text>
                                </View>
                            )}
                            <View className="flex-row justify-between py-2">
                                <Text className="text-gray-600">Email</Text>
                                <Text className="text-gray-800">{user?.email}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity 
                    onPress={handleLogout}
                    className="bg-red-500 py-3 rounded-xl mt-8"
                >
                    <Text className="text-white text-center font-semibold text-lg">Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Profile;
