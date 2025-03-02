import React, { useState } from 'react'
import { Text, RefreshControl, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CartSummary from '@/components/Cart'
import CategorySection from '@/components/CategorySection'
import { ProductItem } from '@/components/Product'
import { StatusBar } from 'expo-status-bar'

const Canteen: React.FC = () => {
    const [refreshing, setRefreshing] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
        Snacks: true,
        Drinks: false,
        Desserts: false,
    })

    const menuItems: ProductItem[] = [
        // Hyderabadi Fast Food items (Snacks)
        { id: 1, name: 'Hyderabadi Biryani', price: 150, category: 'Snacks' },
        { id: 2, name: 'Fried Rice', price: 120, category: 'Snacks' },
        { id: 3, name: 'Mixed Fried Rice', price: 130, category: 'Snacks' },
        { id: 4, name: 'Paneer Fried Rice', price: 140, category: 'Snacks' },
        { id: 5, name: 'Noodles', price: 100, category: 'Snacks' },
        { id: 6, name: 'Vegetable Shezwan Noodles', price: 130, category: 'Snacks' },
        { id: 7, name: 'Chicken Noodles', price: 150, category: 'Snacks' },
        { id: 8, name: 'Vegetable Manchurian', price: 120, category: 'Snacks' },
        { id: 9, name: 'Paneer Tikka', price: 160, category: 'Snacks' },

        // Drinks
        { id: 10, name: 'Lemon Soda', price: 50, category: 'Drinks' },
        { id: 11, name: 'Mango Lassi', price: 70, category: 'Drinks' },
        { id: 12, name: 'Sweet Lime Juice', price: 40, category: 'Drinks' },

        // Desserts
        { id: 13, name: 'Gulab Jamun', price: 40, category: 'Desserts' },
        { id: 14, name: 'Jalebi', price: 50, category: 'Desserts' },
        { id: 15, name: 'Kulfi', price: 80, category: 'Desserts' },

        // Meals
        { id: 16, name: 'Hyderabadi Mutton Biryani', price: 200, category: 'Meals' },
        { id: 17, name: 'Chicken Biryani', price: 180, category: 'Meals' },
        { id: 18, name: 'Paneer Butter Masala with Roti', price: 130, category: 'Meals' },
        { id: 19, name: 'Dal Tadka with Rice', price: 90, category: 'Meals' },

        // Chocolates & Snacks
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

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#00f']} />
                }
            >
                <Text className="text-2xl font-bold mb-2 px-4">Canteen Menu</Text>
                <Text className="text-sm text-gray-500 mb-4 px-4">Food made by Srinivas Uncle and Team with their experience of serving KMIT for over 17 years.</Text>
                <StatusBar style="inverted" />

                <CategorySection
                    category="Snacks"
                    expanded={expandedCategories['Snacks']}
                    toggleCategory={toggleCategory}
                    products={getCategoryProducts('Snacks')}
                />
                <CategorySection
                    category="Drinks"
                    expanded={expandedCategories['Drinks']}
                    toggleCategory={toggleCategory}
                    products={getCategoryProducts('Drinks')}
                />
                <CategorySection
                    category="Desserts"
                    expanded={expandedCategories['Desserts']}
                    toggleCategory={toggleCategory}
                    products={getCategoryProducts('Desserts')}
                />
            </ScrollView>
            <CartSummary />
        </SafeAreaView>
    )
}

export default Canteen
