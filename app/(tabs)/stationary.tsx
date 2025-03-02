import React, { useState } from 'react'
import { Text, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CartSummary from '@/components/Cart'
import CategorySection from '@/components/CategorySection'
import { ProductItem } from '@/components/Product'
import { StatusBar } from 'expo-status-bar'
import { FontAwesome } from '@expo/vector-icons'

const Stationery: React.FC = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
        Stationery: true
    })

    const menuItems: ProductItem[] = [
        { "id": 111, "name": "Ballpoint Pen", "price": 15, "category": "Stationery" },
        { "id": 112, "name": "Notebook", "price": 50, "category": "Stationery" },
        { "id": 113, "name": "Pencil", "price": 10, "category": "Stationery" },
        { "id": 114, "name": "Eraser", "price": 5, "category": "Stationery" },
        { "id": 115, "name": "Highlighter", "price": 20, "category": "Stationery" },
        { "id": 116, "name": "Marker", "price": 30, "category": "Stationery" },
        { "id": 117, "name": "Ruler", "price": 25, "category": "Stationery" },
        { "id": 118, "name": "Stapler", "price": 60, "category": "Stationery" },
        { "id": 119, "name": "Paper Clips", "price": 10, "category": "Stationery" },
        { "id": 1110, "name": "Glue Stick", "price": 20, "category": "Stationery" },
        { "id": 121, "name": "Scissors", "price": 50, "category": "Stationery" },
        { "id": 122, "name": "Post-it Notes", "price": 35, "category": "Stationery" },
        { "id": 123, "name": "Folder", "price": 40, "category": "Stationery" },
        { "id": 124, "name": "Sticky Notes", "price": 15, "category": "Stationery" },
        { "id": 125, "name": "Tape", "price": 20, "category": "Stationery" }
    ]

    const onRefresh = () => {
        setRefreshing(true)
        setRefreshing(false)
    }

    const toggleCategory = (category: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }))
    }

    const getCategoryProducts = (category: string) => {
        return menuItems.filter((item) => item.category === category)
    }

    const categories = ['Stationery']

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#00f']} />
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View className="flex flex-row me-2">
                    <View className="w-[80%]">
                        <Text className="text-2xl font-bold mb-2 px-4">Stationery</Text>
                        <Text className="text-sm text-gray-500 mb-4 px-4">Food and Snacks by Srinivas Uncle Team with their experience of serving KMIT for over 17+ years.</Text>
                    </View>
                    <View className="flex-1 w-[100px] items-center">
                        <View className="flex-row items-center bg-green-800 rounded-lg my-2 py-2 px-3 h-[40px] justify-center">
                            <Text className="font-semibold text-white flex-row ms-1">4.5 <FontAwesome name="star" /></Text>
                        </View>
                        <Text className="text-xs text-zinc-600 text-center">1k ratings</Text>
                        <Text className="-mt-2" ellipsizeMode="clip" numberOfLines={1}> - - - - - - -</Text>
                    </View>
                </View>
                <StatusBar style="inverted" />

                {categories.map((category) => (
                    <CategorySection
                        key={category}
                        category={category}
                        expanded={expandedCategories[category]}
                        toggleCategory={toggleCategory}
                        products={getCategoryProducts(category)}
                    />
                ))}
            </ScrollView>
            <CartSummary />
        </SafeAreaView>
    )
}

export default Stationery
