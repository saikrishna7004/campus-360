import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Stationary = () => {
    const [cart, setCart] = useState<any[]>([])
    const [stationary, setStationary] = useState([
        { id: 1, name: 'Pen', price: 5 },
        { id: 2, name: 'Notebook', price: 20 },
        { id: 3, name: 'Pencil', price: 2 },
        { id: 4, name: 'Eraser', price: 1 },
    ])

    const addToCart = (item: any) => {
        setCart([...cart, item])
    }

    const placeOrder = () => {
        if (cart.length === 0) {
            Alert.alert('Error', 'Your cart is empty!')
            return
        }
        Alert.alert('Order Placed', `You have ordered ${cart.length} items.`)
        setCart([])
    }

    return (
        <SafeAreaView className="flex-1 p-4">
            <Text className="text-2xl font-bold mb-4">Stationary Items</Text>
            <FlatList
                data={stationary}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-lg">{item.name}</Text>
                        <Text className="text-lg">${item.price}</Text>
                        <TouchableOpacity onPress={() => addToCart(item)}>
                            <Text className="text-blue-500">Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <Button title="Place Order" onPress={placeOrder} />
        </SafeAreaView>
    )
}

export default Stationary
