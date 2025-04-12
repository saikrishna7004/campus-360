import React, { useState, useEffect } from 'react'
import { Text, RefreshControl, ScrollView, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CartSummary from '@/components/Cart'
import CategorySection from '@/components/CategorySection'
import { ProductItem } from '@/components/Product'
import { StatusBar } from 'expo-status-bar'
import { FontAwesome } from '@expo/vector-icons'
import axios from 'axios'
import useAuthStore from '@/store/authStore'

const VENDOR_TYPE = 'canteen';

const Canteen: React.FC = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
        Snacks: true,
        Drinks: true,
        Meals: true,
    })
    const [menuItems, setMenuItems] = useState<ProductItem[]>([])
    const [isOffline, setIsOffline] = useState(false)
    const { getAuthHeader } = useAuthStore();

    const fetchVendorStatus = async () => {
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/vendor/status/canteen`, {
                headers: getAuthHeader()
            })
            setIsOffline(!response.data.isAvailable)
        } catch (error) {
            console.error('Error fetching vendor status:', error)
            setIsOffline(true)
        }
    }

    useEffect(() => {
        fetchVendorStatus()
    }, [])

    useEffect(() => {
        if(!isOffline) {
            fetchMenuItems();
        }
    }, [isOffline])

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/product/canteen`)
            // console.log('Menu items fetched:', response.data)
            if(response.data?.isAvailable === false) {
                setIsOffline(true)
            }
            else {
                setMenuItems(response.data)
            }
        } catch (error) {
            console.error('Error fetching menu items:', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = () => {
        setRefreshing(true)
        fetchVendorStatus().finally(() => setRefreshing(false))
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

    const categories = ['Snacks', 'Drinks', 'Meals']

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: -28 }}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#00f']} />
                }
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
            >
                <View className="flex flex-row me-2">
                    <View className="w-[80%]">
                        <Text className="text-2xl font-bold mb-2 px-4">Srinivas Canteen</Text>
                        <Text className="text-sm text-gray-500 mb-4 px-4">Food and Snacks by Srinivas Uncle Team with their experience of serving KMIT for over 17+ years.</Text>
                        {isOffline && (
                            <View className="bg-red-100 mx-4 p-3 rounded-lg mb-4">
                                <Text className="text-red-600 text-center font-medium">Currently Offline • Come back later</Text>
                            </View>
                        )}
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

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    !isOffline && categories.map((category) => (
                        <CategorySection
                            key={category}
                            category={category}
                            expanded={expandedCategories[category]}
                            toggleCategory={toggleCategory}
                            products={getCategoryProducts(category).map(item => ({
                                ...item,
                                vendor: VENDOR_TYPE
                            }))}
                            vendor={VENDOR_TYPE}
                        />
                    ))
                )}
            </ScrollView>
            <CartSummary />
        </SafeAreaView>
    )
}

export default Canteen
