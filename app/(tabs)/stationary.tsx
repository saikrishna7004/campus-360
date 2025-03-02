import React, { useState } from 'react'
import { View, Text, FlatList, Button, Alert, TextInput, Modal, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import useCartStore from '../../store/cartStore'
import * as DocumentPicker from 'expo-document-picker'
import { Picker } from '@react-native-picker/picker'

interface Product {
    id: number
    name: string
    price: number
}

const Stationary: React.FC = () => {
    const { products, cart, addProduct, addToCart, removeFromCart, clearCart } = useCartStore()
    const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null)
    const [copies, setCopies] = useState<number>(1)
    const [paperSize, setPaperSize] = useState<string>('A4')
    const [color, setColor] = useState<string>('Color')
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
    const [refreshing, setRefreshing] = useState(false)

    const stationaryItems: Product[] = [
        { id: 21, name: 'Pen', price: 5 },
        { id: 22, name: 'Notebook', price: 20 },
        { id: 23, name: 'Pencil', price: 2 },
        { id: 24, name: 'Eraser', price: 1 },
    ]

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: '*/*' })
        setFile(result)
    }

    const placeOrder = () => {
        if (cart.length === 0 && !file) {
            Alert.alert('Error', 'Your cart is empty and no file selected for printing!')
            return
        }
        Alert.alert('Order Placed', `You have ordered ${cart.length} items and ${copies} copies of the document.`)
        clearCart()
        setFile(null)
        setCopies(1)
        setPaperSize('A4')
        setColor('Color')
    }

    const toggleModal = () => setIsModalVisible(!isModalVisible)

    const onRefresh = () => {
        setRefreshing(true)
        stationaryItems.forEach((item) => addProduct(item))
        setRefreshing(false)
    }

    const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black p-4">
            <Text className="text-3xl font-bold text-black dark:text-white mb-4">Stationary Items</Text>

            <FlatList
                data={stationaryItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const itemInCart = cart.find((cartItem) => cartItem.id === item.id)

                    return (
                        <View className="flex-row justify-between items-center mb-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-black dark:text-white">{item.name}</Text>
                                <Text className="text-md font-bold text-black dark:text-white">${item.price}</Text>
                            </View>
                            <View className="flex-row items-center">
                                {itemInCart ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => removeFromCart(item.id)}
                                            className="px-4 py-2 bg-red-500 dark:bg-red-700 text-white rounded-lg"
                                        >
                                            <Text className="text-white text-sm">-</Text>
                                        </TouchableOpacity>
                                        <Text className="text-lg px-3 text-black dark:text-white">{itemInCart.quantity}</Text>
                                        <TouchableOpacity
                                            onPress={() => addToCart(item)}
                                            className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded-lg"
                                        >
                                            <Text className="text-white text-sm">+</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => addToCart(item)}
                                        className="px-4 py-2 bg-green-500 dark:bg-green-700 text-white rounded-lg"
                                    >
                                        <Text className="text-white text-sm">Add</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )
                }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#00f']} />
                }
            />

            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 shadow-lg">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl text-black dark:text-white">Cart ({cart.length})</Text>
                    <Text className="text-lg text-black dark:text-white">${totalPrice}</Text>
                </View>
                <View className="flex-row justify-between items-center mb-2 gap-2">
                    <TouchableOpacity
                        onPress={toggleModal}
                        className="w-1/2 py-2 bg-green-500 dark:bg-green-700 rounded-lg"
                    >
                        <Text className="text-white text-center text-lg">Add Print Request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={placeOrder}
                        className="w-1/2 py-2 bg-blue-500 dark:bg-blue-700 rounded-lg"
                    >
                        <Text className="text-white text-center text-lg">Place Order</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end">
                    <View className="bg-black opacity-50 flex-1" />
                    <View className="bg-white dark:bg-gray-800 p-4 rounded-t-lg">
                        <Text className="text-xl font-bold text-black dark:text-white">Select Print Options</Text>
                        <View className="gap-4 mt-4">
                            <Text className="text-lg text-black dark:text-white">Paper Size</Text>
                            <Picker
                                selectedValue={paperSize}
                                onValueChange={(itemValue) => setPaperSize(itemValue)}
                                className="mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white"
                            >
                                <Picker.Item label="A4" value="A4" />
                                <Picker.Item label="A3" value="A3" />
                                <Picker.Item label="A5" value="A5" />
                            </Picker>
                            <Text className="text-lg mt-4 text-black dark:text-white">Print Color</Text>
                            <Picker
                                selectedValue={color}
                                onValueChange={(itemValue) => setColor(itemValue)}
                                className="mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white"
                            >
                                <Picker.Item label="Black" value="Black" />
                                <Picker.Item label="Color" value="Color" />
                            </Picker>
                            <TextInput
                                className="mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white"
                                value={copies.toString()}
                                onChangeText={(text) => setCopies(Number(text))}
                                keyboardType="numeric"
                                placeholder="Number of Copies"
                            />
                            <Button
                                title="Add Print Request"
                                onPress={() => {
                                    addToCart({ id: 6, name: 'Print Request', price: 10 })
                                    toggleModal()
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
        </SafeAreaView>
    )
}

export default Stationary
