import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const success = await login(email, password);
            if (success) {
                router.replace('/');
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred during login');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 justify-center px-6 py-8 mx-auto max-w-md">
                    <View className="items-center mb-8">
                        <View className="w-28 h-28 mb-4 bg-green-100 rounded-full justify-center items-center">
                            <FontAwesome name="graduation-cap" size={60} color="#166534" />
                        </View>
                        <Text className="text-2xl font-bold text-green-800">Campus 360</Text>
                        <Text className="text-sm text-gray-500 mt-1">Your one-stop campus solution</Text>
                    </View>

                    <View className="space-y-4 bg-white p-5 rounded-lg shadow-sm">
                        <View>
                            <Text className="text-gray-700 mb-1 ml-1 font-medium">Email</Text>
                            <TextInput
                                className="bg-gray-100 px-4 py-3 rounded-md text-gray-800 border border-gray-200"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        
                        <View>
                            <Text className="text-gray-700 mb-1 ml-1 font-medium">Password</Text>
                            <TextInput
                                className="bg-gray-100 px-4 py-3 rounded-md text-gray-800 border border-gray-200"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {error ? (
                            <Text className="text-red-500 text-center py-1">{error}</Text>
                        ) : null}

                        <TouchableOpacity
                            className="bg-green-700 py-3 rounded-md mt-2"
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-semibold">Login</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="py-2 mt-1"
                            onPress={() => router.push('/register')}
                        >
                            <Text className="text-green-700 text-center">Don't have an account? Register</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            className="py-1"
                            onPress={() => router.push('/forgot-password')}
                        >
                            <Text className="text-gray-500 text-center text-sm">Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-xs text-center text-gray-400 mt-6">© 2023 Campus 360. All rights reserved.</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Login;
