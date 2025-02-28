import React, { useState } from 'react';
import { View, Text, FlatList, Button, Alert, TextInput, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import useCartStore from '@/store/cartStore';
import * as DocumentPicker from 'expo-document-picker';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Picker } from '@react-native-picker/picker';

interface Product {
    id: number;
    name: string;
    price: number;
}

const Stationary: React.FC = () => {
    const { cart, addToCart, removeFromCart, clearCart } = useCartStore();
    const colors = {
        background: useThemeColor({ light: '#fff', dark: '#000' }, 'background'),
        text: useThemeColor({ light: '#000', dark: '#fff' }, 'text'),
        card: useThemeColor({ light: '#f8f8f8', dark: '#1c1c1c' }, 'background'),
        border: useThemeColor({ light: '#ccc', dark: '#333' }, 'background'),
    };

    const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
    const [copies, setCopies] = useState<number>(1);
    const [paperSize, setPaperSize] = useState<string>('A4');
    const [color, setColor] = useState<string>('Color');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const stationaryItems: Product[] = [
        { id: 1, name: 'Pen', price: 5 },
        { id: 2, name: 'Notebook', price: 20 },
        { id: 3, name: 'Pencil', price: 2 },
        { id: 4, name: 'Eraser', price: 1 },
    ];

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
        setFile(result);
    };

    const placeOrder = () => {
        if (cart.length === 0 && !file) {
            Alert.alert('Error', 'Your cart is empty and no file selected for printing!');
            return;
        }
        Alert.alert('Order Placed', `You have ordered ${cart.length} items and ${copies} copies of the document.`);
        clearCart();
        setFile(null);
        setCopies(1);
        setPaperSize('A4');
        setColor('Color');
    };

    const toggleModal = () => setIsModalVisible(!isModalVisible);

    return (
        <SafeAreaView className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
            <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Stationary Items</Text>

            <FlatList
                data={stationaryItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const itemInCart = cart.find((cartItem) => cartItem.id === item.id);

                    return (
                        <View className="flex-row justify-between items-center mb-4 p-4" style={{ backgroundColor: colors.card, borderRadius: 8 }}>
                            <View className="flex-1">
                                <Text className="text-lg font-bold" style={{ color: colors.text }}>{item.name}</Text>
                                <Text className="text-md font-bold" style={{ color: colors.text }}>${item.price}</Text>
                            </View>
                            <View className="flex-row items-center">
                                {itemInCart ? (
                                    <>
                                        <Button
                                            onPress={() => removeFromCart(item.id)}
                                            title="-"
                                            color="#f44336"
                                        />
                                        <Text className="text-lg" style={{ color: colors.text }}>{itemInCart.quantity}</Text>
                                        <Button
                                            onPress={() => addToCart(item)}
                                            title="+"
                                            color="#2196F3"
                                        />
                                    </>
                                ) : (
                                    <Button
                                        onPress={() => addToCart(item)}
                                        title="Add"
                                        color="#4CAF50"
                                    />
                                )}
                            </View>
                        </View>
                    );
                }}
            />

            <View className="my-4">
                <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Print Document</Text>
                <Button title="Add Print Request" onPress={toggleModal} />
                {file && (
                    <View className="mt-4">
                        <Text className="text-lg" style={{ color: colors.text }}>Selected File: {file?.assets?.[0]?.name}</Text>
                        <TextInput
                            className="mt-2 p-2 border border-border rounded-lg"
                            placeholder="Number of Copies"
                            keyboardType="numeric"
                            value={copies.toString()}
                            onChangeText={(text) => setCopies(Number(text))}
                        />
                        <View className="mt-4">
                            <Text className="text-lg" style={{ color: colors.text }}>Paper Size</Text>
                            <Picker
                                selectedValue={paperSize}
                                onValueChange={(itemValue) => setPaperSize(itemValue)}
                                style={{ height: 50, color: colors.text }}
                            >
                                <Picker.Item label="A4" value="A4" />
                                <Picker.Item label="A3" value="A3" />
                                <Picker.Item label="A5" value="A5" />
                            </Picker>
                        </View>
                        <View className="mt-4">
                            <Text className="text-lg" style={{ color: colors.text }}>Print Color</Text>
                            <Picker
                                selectedValue={color}
                                onValueChange={(itemValue) => setColor(itemValue)}
                                style={{ height: 50, color: colors.text }}
                            >
                                <Picker.Item label="Black" value="Black" />
                                <Picker.Item label="Color" value="Color" />
                            </Picker>
                        </View>
                    </View>
                )}
            </View>

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end">
                    <View className="bg-black opacity-50 flex-1" />
                    <View className="bg-card p-4 rounded-t-lg" style={{ backgroundColor: colors.card }}>
                        <Text className="text-xl font-bold" style={{ color: colors.text }}>Select Print Options</Text>
                        <View className="gap-4 mt-4">
                            <Text className="text-lg" style={{ color: colors.text }}>Paper Size</Text>
                            <Picker
                                selectedValue={paperSize}
                                onValueChange={(itemValue) => setPaperSize(itemValue)}
                                style={{ height: 50, color: colors.text, borderColor: colors.border, backgroundColor: colors.card }}
                            >
                                <Picker.Item label="A4" value="A4" />
                                <Picker.Item label="A3" value="A3" />
                                <Picker.Item label="A5" value="A5" />
                            </Picker>
                            <Text className="text-lg mt-4" style={{ color: colors.text }}>Print Color</Text>
                            <Picker
                                selectedValue={color}
                                onValueChange={(itemValue) => setColor(itemValue)}
                                style={{ height: 50, color: colors.text, borderColor: colors.border, backgroundColor: colors.card }}
                            >
                                <Picker.Item label="Black" value="Black" />
                                <Picker.Item label="Color" value="Color" />
                            </Picker>
                            <TextInput
                                className="mt-2 p-2 border border-border rounded-lg"
                                value={copies.toString()}
                                onChangeText={(text) => setCopies(Number(text))}
                                keyboardType="numeric"
                                placeholder="Number of Copies"
                                style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.card }}
                            />
                            <Button
                                title="Add Print Request"
                                onPress={() => {
                                    addToCart({ id: 6, name: 'Print Request', price: 10 });
                                    toggleModal();
                                }}
                                color="#4CAF50"
                            />
                            <Button
                                title="Cancel"
                                onPress={toggleModal}
                                color="#f44336"
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <Button title="Place Order" onPress={placeOrder} />
        </SafeAreaView>
    );
};

export default Stationary;
