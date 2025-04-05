import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Alert, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'
import AdminCategorySection, { MenuItem } from '@/components/AdminCategorySection'
import useAuthStore from '@/store/authStore'

const Menu = () => {
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({})
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const { getAuthHeader, user } = useAuthStore()

    useEffect(() => {
        fetchMenuItems()
    }, [])

    const vendorType = user?.type || 'canteen'

    const fetchMenuItems = async (): Promise<void> => {
        try {
            const response = await axios.get<MenuItem[]>(`${process.env.EXPO_PUBLIC_API_URL}/product/${vendorType}`, {
                headers: getAuthHeader()
            })
            setMenuItems(response.data)

            const uniqueCategories = Array.from(new Set(response.data.map((item: MenuItem) => item.category)))
            const initialExpandedState: { [key: string]: boolean } = uniqueCategories.reduce((acc: { [key: string]: boolean }, category: string): { [key: string]: boolean } => {
                acc[category] = true
                return acc
            }, {})

            setExpandedCategories(initialExpandedState)
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch menu items. Pull down to refresh.')
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

    const toggleInStock = async (id: string): Promise<void> => {
        try {
            const item = menuItems.find(item => item._id === id)
            if (!item) return

            setMenuItems((prevItems) =>
                prevItems.map((item) =>
                    item._id === id ? { ...item, inStock: !item.inStock } : item
                )
            )

            await axios.patch(`${process.env.EXPO_PUBLIC_API_URL}/product/${id}`, {
                inStock: !item.inStock
            }, {
                headers: getAuthHeader()
            })
        } catch (error) {
            Alert.alert('Error', 'Failed to update item status')
            setMenuItems((prevItems) =>
                prevItems.map((item) =>
                    item._id === id ? { ...item, inStock: !item.inStock } : item
                )
            )
        }
    }

    const getCategoryProducts = (category: string): MenuItem[] => {
        return menuItems.filter((item) => item.category === category)
    }

    const categories: string[] = Array.from(new Set(menuItems.map(item => item.category)))

    return (
        <SafeAreaView className="flex-1 bg-white -mt-3" edges={['top', 'left', 'right']}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#00f']} />
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View className="flex flex-row mr-2">
                    <View className="w-[20%] ms-2 items-center">
                        <Image source={{ uri: 'https://icons.veryicon.com/png/o/object/downstairs-buffet/canteen-1.png' }} className="w-16 h-16" resizeMode="contain" />
                    </View>
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
