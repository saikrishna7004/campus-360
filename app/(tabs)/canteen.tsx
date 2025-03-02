import React, { useState } from 'react'
import { Text, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CartSummary from '@/components/Cart'
import CategorySection from '@/components/CategorySection'
import { ProductItem } from '@/components/Product'
import { StatusBar } from 'expo-status-bar'
import { FontAwesome } from '@expo/vector-icons'

const Canteen: React.FC = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
        Snacks: true,
        Drinks: true,
        Desserts: true,
        Meals: true,
    })

    const menuItems: ProductItem[] = [
        { id: 1, name: 'Hyderabadi Biryani', price: 150, category: 'Snacks' },
        { id: 2, name: 'Fried Rice', price: 120, category: 'Snacks' },
        { id: 3, name: 'Mixed Fried Rice', price: 130, category: 'Snacks' },
        { id: 4, name: 'Paneer Fried Rice', price: 140, category: 'Snacks' },
        { id: 5, name: 'Noodles', price: 100, category: 'Snacks' },
        { id: 6, name: 'Vegetable Shezwan Noodles', price: 130, category: 'Snacks' },
        { id: 7, name: 'Chicken Noodles', price: 150, category: 'Snacks' },
        { id: 8, name: 'Vegetable Manchurian', price: 120, category: 'Snacks' },
        { id: 9, name: 'Paneer Tikka', price: 160, category: 'Snacks' },
        { id: 10, name: 'Lemon Soda', price: 50, category: 'Drinks' },
        { id: 11, name: 'Mango Lassi', price: 70, category: 'Drinks' },
        { id: 12, name: 'Sweet Lime Juice', price: 40, category: 'Drinks' },
        { id: 13, name: 'Gulab Jamun', price: 40, category: 'Desserts' },
        { id: 14, name: 'Jalebi', price: 50, category: 'Desserts' },
        { id: 15, name: 'Kulfi', price: 80, category: 'Desserts' },
        { id: 16, name: 'Hyderabadi Mutton Biryani', price: 200, category: 'Meals' },
        { id: 17, name: 'Chicken Biryani', price: 180, category: 'Meals' },
        { id: 18, name: 'Paneer Butter Masala with Roti', price: 130, category: 'Meals' },
        { id: 19, name: 'Dal Tadka with Rice', price: 90, category: 'Meals' },
        { id: 20, name: 'Dairy Milk Chocolate', price: 50, category: 'Snacks' },
        { id: 21, name: 'Perk', price: 20, category: 'Snacks' },
        { id: 22, name: 'KitKat', price: 30, category: 'Snacks' },
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

    const categories = ['Snacks', 'Drinks', 'Desserts', 'Meals']

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
                        <Text className="text-2xl font-bold mb-2 px-4">Srinivas Canteen</Text>
                        <Text className="text-sm text-gray-500 mb-4 px-4">Food made by Srinivas Uncle Team with their experience of serving KMIT for over 17 years.</Text>
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

export default Canteen
