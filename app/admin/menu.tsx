import React, { useState, useEffect } from 'react'
import { View, Text, Switch, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import AdminCategorySection, { MenuItem } from '@/components/AdminCategorySection'

const Menu = () => {
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
        Food: true,
        Snacks: true,
        Drinks: true,
        Meals: true,
    })
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])

    useEffect(() => {
        fetchMenuItems()
    }, [])

    const fetchMenuItems = async (): Promise<void> => {
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/product/canteen`)
            setMenuItems(response.data)
        } catch (error) {
            console.error('Error fetching menu items:', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = (): void => {
        setRefreshing(true)
        fetchMenuItems().finally(() => setRefreshing(false))
    }

    const toggleCategory = (category: string): void => {
        setExpandedCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }))
    }

    const toggleInStock = (id: string): void => {
        setMenuItems((prevItems) =>
            prevItems.map((item) =>
                item._id === id ? { ...item, inStock: !item.inStock } : item
            )
        )
    }

    const getCategoryProducts = (category: string): MenuItem[] => {
        return menuItems.filter((item) => item.category === category)
    }

    const categories: string[] = Array.from(new Set(menuItems.map(item => item.category)))

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#00f']} />
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View className="flex flex-row mr-2">
                    <View className="w-[80%]">
                        <Text className="text-2xl font-bold mb-2 px-4">Menu</Text>
                        <Text className="text-sm text-gray-500 mb-4 px-4">Manage the items available in the canteen menu.</Text>
                    </View>
                </View>
                <StatusBar style="inverted" />

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    categories.map((category) => (
                        <AdminCategorySection
                            key={category}
                            category={category}
                            expanded={expandedCategories[category]}
                            toggleCategory={toggleCategory}
                            products={getCategoryProducts(category)}
                            toggleInStock={toggleInStock}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

export default Menu
