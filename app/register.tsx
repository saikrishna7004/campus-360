import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuthStore();
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const success = await register(name, email, password);
            if (success) {
                router.replace('/');
            } else {
                setError('Registration failed. Email may already be in use.');
            }
        } catch (err) {
            setError('An error occurred during registration');
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-1 justify-center px-8 py-12">
                        <View className="items-center mb-6">
                            <View className="w-32 h-32 mb-2 bg-green-100 rounded-full justify-center items-center">
                                <FontAwesome name="user-plus" size={50} color="#166534" />
                            </View>
                            <Text className="text-2xl font-bold text-green-800">Create Account</Text>
                        </View>

                        <View className="gap-4">
                            <View>
                                <Text className="text-gray-700 mb-2 ml-1">Full Name</Text>
                                <TextInput
                                    className="bg-gray-100 px-4 py-3 rounded-lg text-gray-800"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

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
                            
                            <View>
                                <Text className="text-gray-700 mb-2 ml-1">Password</Text>
                                <TextInput
                                    className="bg-gray-100 px-4 py-3 rounded-lg text-gray-800"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <View>
                                <Text className="text-gray-700 mb-2 ml-1">Confirm Password</Text>
                                <TextInput
                                    className="bg-gray-100 px-4 py-3 rounded-lg text-gray-800"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                            </View>

                            {error ? (
                                <Text className="text-red-500 text-center">{error}</Text>
                            ) : null}

                            <TouchableOpacity
                                className="bg-green-800 py-3 rounded-lg mt-4"
                                onPress={handleRegister}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-center font-semibold text-lg">Register</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="py-3 mt-2"
                                onPress={() => router.push('/login')}
                            >
                                <Text className="text-green-800 text-center">Already have an account? Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Register;
