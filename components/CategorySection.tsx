// CategorySection.tsx
import React from 'react'
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import Product, { ProductItem } from '@/components/Product'

interface CategorySectionProps {
    category: string
    expanded: boolean
    toggleCategory: (category: string) => void
    products: ProductItem[]
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, expanded, toggleCategory, products }) => {

    return (
        <SafeAreaView className="flex-1">
            <TouchableOpacity onPress={() => toggleCategory(category)} className="p-4 flex-row justify-between items-center">
                <Text className="text-xl font-bold">{category}</Text>
                <Text className={`text-xl me-4 ${expanded ? 'rotate-90' : ''}`}>
                    <FontAwesome name="caret-right" size={20} />
                </Text>
            </TouchableOpacity>
            {expanded && (
                <View>
                    {products.map((item) => {
                        return (
                            <Product key={item.id} item={item} />
                        )
                    })}
                </View>
            )}
        </SafeAreaView>
    )
}

export default CategorySection
