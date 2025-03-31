import React from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, Switch, Image } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { cn } from '@/lib/cn'

type MenuItem = {
    _id: string;
    name: string;
    inStock: boolean;
    price: number;
    category: string;
}

interface AdminCategorySectionProps {
    category: string
    expanded: boolean
    toggleCategory: (category: string) => void
    products: MenuItem[]
    toggleInStock: (id: string) => void
}

const AdminCategorySection: React.FC<AdminCategorySectionProps> = ({ category, expanded, toggleCategory, products, toggleInStock }) => {
    return (
        <SafeAreaView className="flex-1">
            <TouchableOpacity onPress={() => toggleCategory(category)} className="p-4 flex-row justify-between items-center">
                <Text className="text-xl font-bold">{category}</Text>
                <Text className={cn("text-xl me-4", {
                    'rotate-90': expanded
                })}>
                    <FontAwesome name="caret-right" size={20} />
                </Text>
            </TouchableOpacity>
            {expanded && (
                <View className='p-4'>
                    {products.map((item) => (
                        <View key={item._id} className="mb-2 rounded-lg">
                            <View className="flex-row justify-between items-center">
                                <Image className="rounded-lg h-[60px] w-[60px]" width={60} height={60} source={{ uri: 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg' }} />
                                <View className="flex-1 px-4">
                                    <Text className="font-semibold pb-1 text-black">{item.name}</Text>
                                    <Text className="text-md text-black">₹{item.price}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center justify-between space-x-2">
                                <TouchableOpacity
                                    onPress={() => { alert('You can edit items here') }}
                                    className="flex-row items-center p-2"
                                >
                                    <Text className="text-sm text-gray-500">Edit</Text>
                                </TouchableOpacity>
                                <View className="flex flex-row items-center">
                                    <Text className="text-sm text-gray-500">In Stock</Text>
                                    <Switch
                                        value={item.inStock}
                                        onValueChange={() => toggleInStock(item._id)}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </SafeAreaView>
    )
}

export default AdminCategorySection
export type { MenuItem }