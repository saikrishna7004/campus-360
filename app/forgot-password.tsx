import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email) {
            setError('Email is required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`, { 
                email 
            });
            setSuccess(true);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setError('No account found with this email');
            } else {
                setError('Failed to send reset email. Please try again later.');
            }
            console.error('Forgot password error:', error);
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
                <View className="flex-1 justify-center px-8">
                    {!success ? (
                        <>
                            <View className="items-center mb-8">
                                <View className="w-32 h-32 mb-4 bg-green-100 rounded-full justify-center items-center">
                                    <FontAwesome name="lock" size={50} color="#166534" />
                                </View>
                                <Text className="text-2xl font-bold text-green-800">Reset Password</Text>
                                <Text className="text-sm text-gray-500 mt-2 text-center">Enter your email and we'll send you instructions to reset your password</Text>
                            </View>

                            <View className="space-y-4">
                                <View>
                                    <Text className="text-gray-700 mb-2 ml-1">Email</Text>
                                    <TextInput
                                        className="bg-gray-100 px-4 py-3 rounded-lg text-gray-800"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                {error ? (
                                    <Text className="text-red-500 text-center">{error}</Text>
                                ) : null}

                                <TouchableOpacity
                                    className="bg-green-800 py-3 rounded-lg mt-4"
                                    onPress={handleResetPassword}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white text-center font-semibold text-lg">Send Reset Link</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="py-3 mt-2"
                                    onPress={() => router.push('/login')}
                                >
                                    <Text className="text-green-800 text-center">Back to Login</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View className="items-center p-4">
                            <View className="w-40 h-40 mb-6 bg-green-100 rounded-full justify-center items-center">
                                <FontAwesome name="envelope" size={60} color="#166534" />
                            </View>
                            <Text className="text-2xl font-bold text-green-800 mb-4">Email Sent!</Text>
                            <Text className="text-gray-600 text-center mb-6">
                                We've sent instructions to reset your password to {email}. Please check your inbox.
                            </Text>
                            <TouchableOpacity
                                className="bg-green-800 py-3 px-8 rounded-lg"
                                onPress={() => router.push('/login')}
                            >
                                <Text className="text-white text-center font-semibold">Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPassword;
