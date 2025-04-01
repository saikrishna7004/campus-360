import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';
import axios from 'axios';

interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
}

const InventoryScreen = () => {
    const { user, getAuthHeader } = useAuthStore();
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
        name: '',
        quantity: 0,
        price: 0,
        category: 'Food'
    });
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/inventory`,
                { headers: getAuthHeader() }
            );
            setInventoryItems(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load inventory items');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', 'Beverages', 'Food', 'Stationery'];

    const filteredItems = inventoryItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleEditItem = (item: InventoryItem) => {
        setEditingItem(item);
    };

    const handleSaveItem = async (updatedItem: InventoryItem) => {
        try {
            setLoading(true);
            await axios.put(
                `${process.env.EXPO_PUBLIC_API_URL}/inventory/${updatedItem.id}`,
                updatedItem,
                { headers: getAuthHeader() }
            );
            
            setInventoryItems(items => 
                items.map(item => item.id === updatedItem.id ? updatedItem : item)
            );
            
            setEditingItem(null);
            Alert.alert('Success', 'Item updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update item');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this item?',
            [
                { 
                    text: 'Cancel', 
                    style: 'cancel' 
                },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await axios.delete(
                                `${process.env.EXPO_PUBLIC_API_URL}/inventory/${id}`,
                                { headers: getAuthHeader() }
                            );
                            
                            setInventoryItems(items => items.filter(item => item.id !== id));
                            Alert.alert('Success', 'Item deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete item');
                            console.error(error);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.price) {
            Alert.alert('Error', 'Please enter a name and price');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/inventory`,
                newItem,
                { headers: getAuthHeader() }
            );
            
            setInventoryItems([...inventoryItems, response.data]);
            setShowAddForm(false);
            setNewItem({
                name: '',
                quantity: 0,
                price: 0,
                category: 'Food'
            });
            Alert.alert('Success', 'Item added successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to add item');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: InventoryItem }) => (
        <View className="bg-white p-4 rounded-lg mb-2 shadow-sm border border-gray-100">
            <View className="flex-row justify-between">
                <View>
                    <Text className="text-lg font-semibold">{item.name}</Text>
                    <Text className="text-gray-500">{item.category}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-green-700 font-bold">${item.price.toFixed(2)}</Text>
                    <Text className={`${item.quantity < 20 ? 'text-red-500' : 'text-gray-600'}`}>
                        Qty: {item.quantity}
                    </Text>
                </View>
            </View>
            
            <View className="flex-row justify-end mt-2 space-x-2">
                <TouchableOpacity 
                    onPress={() => handleEditItem(item)}
                    className="bg-blue-500 p-2 rounded-full"
                >
                    <MaterialIcons name="edit" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => handleDeleteItem(item.id)}
                    className="bg-red-500 p-2 rounded-full"
                >
                    <MaterialIcons name="delete" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (!user || (user.role !== 'admin' && user.role !== 'canteen')) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
                <MaterialIcons name="error-outline" size={48} color="#DC2626" />
                <Text className="text-xl font-semibold mt-4 text-center">
                    You don't have permission to access this page
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {loading && (
                <View className="absolute inset-0 bg-black bg-opacity-20 z-10 flex justify-center items-center">
                    <ActivityIndicator size="large" color="#166534" />
                </View>
            )}
            
            <View className="p-4">
                <Text className="text-2xl font-bold text-green-800 mb-4">Inventory Management</Text>
                
                <View className="bg-white rounded-lg px-3 py-2 mb-4 flex-row items-center border border-gray-200">
                    <MaterialIcons name="search" size={24} color="gray" />
                    <TextInput
                        placeholder="Search inventory..."
                        value={searchText}
                        onChangeText={setSearchText}
                        className="flex-1 ml-2 h-10"
                    />
                </View>
                
                <View className="flex-row mb-4">
                    <FlatList
                        data={categories}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                onPress={() => setSelectedCategory(item)}
                                className={`py-2 px-4 mr-2 rounded-full ${selectedCategory === item ? 'bg-green-700' : 'bg-gray-200'}`}
                            >
                                <Text 
                                    className={`${selectedCategory === item ? 'text-white' : 'text-gray-800'}`}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
                
                <FlatList
                    data={filteredItems}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-8">
                            <Text className="text-gray-500">No inventory items found</Text>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={fetchInventory}
                />
                
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowAddForm(true)}
                >
                    <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>
            
            {editingItem && (
                <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center p-4 z-20">
                    <View className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <Text className="text-xl font-bold mb-4">Edit Item</Text>
                        
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-1">Name</Text>
                            <TextInput
                                value={editingItem.name}
                                onChangeText={(text) => setEditingItem({...editingItem, name: text})}
                                className="border border-gray-300 rounded-lg p-2"
                            />
                        </View>
                        
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-1">Price</Text>
                            <TextInput
                                value={editingItem.price.toString()}
                                onChangeText={(text) => {
                                    const price = parseFloat(text) || 0;
                                    setEditingItem({...editingItem, price})
                                }}
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg p-2"
                            />
                        </View>
                        
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-1">Quantity</Text>
                            <TextInput
                                value={editingItem.quantity.toString()}
                                onChangeText={(text) => {
                                    const quantity = parseInt(text) || 0;
                                    setEditingItem({...editingItem, quantity})
                                }}
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg p-2"
                            />
                        </View>
                        
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-1">Category</Text>
                            <View className="flex-row flex-wrap">
                                {categories.filter(cat => cat !== 'All').map(category => (
                                    <TouchableOpacity
                                        key={category}
                                        onPress={() => setEditingItem({...editingItem, category})}
                                        className={`py-2 px-4 mr-2 mb-2 rounded-full ${editingItem.category === category ? 'bg-green-700' : 'bg-gray-200'}`}
                                    >
                                        <Text className={`${editingItem.category === category ? 'text-white' : 'text-gray-800'}`}>
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        <View className="flex-row justify-end space-x-2 mt-4">
                            <TouchableOpacity
                                onPress={() => setEditingItem(null)}
                                className="bg-gray-300 px-4 py-2 rounded-lg"
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => handleSaveItem(editingItem)}
                                className="bg-green-700 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white">Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {showAddForm && (
                <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center p-4 z-20">
                    <View className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <Text className="text-xl font-bold mb-4">Add New Item</Text>
                        
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-1">Name</Text>
                            <TextInput
                                value={newItem.name}
                                onChangeText={(text) => setNewItem({...newItem, name: text})}
                                className="border border-gray-300 rounded-lg p-2"
                                placeholder="Item name"
                            />
                        </View>
                        
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-1">Price</Text>
                            <TextInput
                                value={newItem.price?.toString() || ''}
                                onChangeText={(text) => {
                                    const price = parseFloat(text) || 0;
                                    setNewItem({...newItem, price})
                                }}
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg p-2"
                                placeholder="0.00"
                            />
                        </View>
                        
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-1">Quantity</Text>
                            <TextInput
                                value={newItem.quantity?.toString() || ''}
                                onChangeText={(text) => {
                                    const quantity = parseInt(text) || 0;
                                    setNewItem({...newItem, quantity})
                                }}
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg p-2"
                                placeholder="0"
                            />
                        </View>
                        
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-1">Category</Text>
                            <View className="flex-row flex-wrap">
                                {categories.filter(cat => cat !== 'All').map(category => (
                                    <TouchableOpacity
                                        key={category}
                                        onPress={() => setNewItem({...newItem, category})}
                                        className={`py-2 px-4 mr-2 mb-2 rounded-full ${newItem.category === category ? 'bg-green-700' : 'bg-gray-200'}`}
                                    >
                                        <Text className={`${newItem.category === category ? 'text-white' : 'text-gray-800'}`}>
                                            {category}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        <View className="flex-row justify-end space-x-2 mt-4">
                            <TouchableOpacity
                                onPress={() => setShowAddForm(false)}
                                className="bg-gray-300 px-4 py-2 rounded-lg"
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={handleAddItem}
                                className="bg-green-700 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white">Add Item</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#166534',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});

export default InventoryScreen;
