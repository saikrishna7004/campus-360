import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function Admin() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Food');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddProduct = async () => {
        if (!name || !price) return;

        setIsSubmitting(true);
        try {
            await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/product`, {
                name,
                price: Number(price),
                category
            });

            setName('');
            setPrice('');
            alert('Product added successfully');
        } catch (error) {
            alert('Failed to add product');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="p-4">
                <Text className="text-2xl font-bold mb-6">Admin Panel</Text>

                <View className="bg-gray-50 p-4 rounded-xl mb-6">
                    <Text className="text-xl font-semibold mb-4">Add New Product</Text>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Product Name</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter product name"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">Price</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                            value={price}
                            onChangeText={setPrice}
                            placeholder="Enter price"
                            keyboardType="numeric"
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-700 mb-2">Category</Text>
                        <View className="flex-row">
                            <TouchableOpacity
                                className={`flex-1 p-3 rounded-l-lg ${category === 'Food' ? 'bg-green-700' : 'bg-gray-200'}`}
                                onPress={() => setCategory('Food')}
                            >
                                <Text className={`text-center ${category === 'Food' ? 'text-white' : 'text-gray-700'}`}>
                                    Food
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-1 p-3 rounded-r-lg ${category === 'Stationery' ? 'bg-green-700' : 'bg-gray-200'}`}
                                onPress={() => setCategory('Stationery')}
                            >
                                <Text className={`text-center ${category === 'Stationery' ? 'text-white' : 'text-gray-700'}`}>
                                    Stationery
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`p-3 rounded-lg ${isSubmitting ? 'bg-gray-500' : 'bg-green-700'}`}
                        onPress={handleAddProduct}
                        disabled={isSubmitting}
                    >
                        <Text className="text-white text-center font-bold">
                            {isSubmitting ? 'Adding...' : 'Add Product'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
