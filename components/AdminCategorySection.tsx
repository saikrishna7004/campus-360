import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

export interface MenuItem {
    _id: string
    name: string
    price: number
    description: string
    category: string
    imageUrl?: string
    inStock: boolean
    type: string
}

interface AdminCategorySectionProps {
    category: string
    expanded: boolean
    toggleCategory: (category: string) => void
    products: MenuItem[]
    toggleInStock: (id: string) => void
}

const AdminCategorySection = ({
    category,
    expanded,
    toggleCategory,
    products,
    toggleInStock,
}: AdminCategorySectionProps) => {
    return (
        <View className="mb-4">
            <TouchableOpacity
                onPress={() => toggleCategory(category)}
                className="flex-row justify-between items-center px-4 py-3 bg-gray-100 rounded-md mb-2"
            >
                <Text className="text-lg font-medium">{category}</Text>
                <FontAwesome name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#666" />
            </TouchableOpacity>

            {expanded && (
                <View className="px-2">
                    {products.map((item) => (
                        <View key={item._id} className="flex-row items-center p-2 border-b border-gray-200">
                            <View className="w-12 h-12 mr-3">
                                {item.imageUrl ? (
                                    <Image source={{ uri: item.imageUrl }} className="w-full h-full rounded-md" />
                                ) : (
                                    <View className="w-full h-full rounded-md bg-gray-200 items-center justify-center">
                                        <FontAwesome name="image" size={20} color="#999" />
                                    </View>
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium">{item.name}</Text>
                                <Text className="text-sm text-gray-500">₹{item.price.toFixed(2)}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => toggleInStock(item._id)}
                                className={`px-3 py-1 rounded-full ${
                                    item.inStock ? 'bg-green-100' : 'bg-gray-200'
                                }`}
                            >
                                <Text className={`text-xs ${
                                    item.inStock ? 'text-green-800' : 'text-gray-600'
                                }`}>
                                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </View>
    )
}

export default AdminCategorySection