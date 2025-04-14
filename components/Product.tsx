import useCartStore from '@/store/cartStore'
import { View, Image, Text, TouchableOpacity } from 'react-native'
import type { VendorType } from '@/store/cartStore'
import { cn } from '@/lib/cn'
import { PrintingOptions } from './PrintingOptionsModal'

interface ProductItem {
    _id: string
    name: string
    price: number
    category: string
    vendor?: VendorType
    inStock?: boolean
    imageUrl?: string
}

const Product = ({ item, vendor, rootClassName, onPrintingOptions }: { 
    item: ProductItem, 
    vendor?: VendorType, 
    rootClassName?: string,
    onPrintingOptions?: (item: ProductItem) => void 
}) => {
    const { getCartByVendor, addToCart, decreaseQuantity } = useCartStore()

    const isPrintItem = item.name.toLowerCase().includes('print')
    const vendorValue = vendor || 'default'
    const cartItems = getCartByVendor(vendorValue)
    const itemInCart = !isPrintItem ? cartItems.find((cartItem) => cartItem._id === item._id) : null

    const handleAddToCart = () => {
        if (isPrintItem) {
            onPrintingOptions?.(item);
            return;
        }

        addToCart({
            _id: item._id,
            name: item.name,
            price: item.price,
            vendor: vendorValue,
            imageUrl: item.imageUrl,
            isPrintItem: false
        });
    }

    if (item.inStock === false) {
        return null;
    }

    return (
        <View className={cn("flex-row justify-between items-center px-4 py-2", rootClassName)}>
            <Image 
                className="rounded-lg h-[60px] w-[60px]" 
                width={60} 
                height={60} 
                source={{ uri: item.imageUrl || 'https://restaurantclicks.com/wp-content/uploads/2022/05/Most-Popular-American-Foods.jpg' }} 
            />
            <View className="flex-1 px-4">
                <Text className="font-semibold pb-1 text-black">{item.name}</Text>
                <Text className="text-md text-black">₹{item.price}</Text>
            </View>
            <View className="flex-row items-center space-x-2">
                {itemInCart && !isPrintItem ? (
                    <View className='flex flex-row border border-green-700 rounded-md items-center justify-center bg-green-700'>
                        <TouchableOpacity
                            onPress={() => decreaseQuantity(item._id, vendorValue)}
                            className="px-3 py-1 text-white rounded-lg"
                        >
                            <Text className="text-white font-bold">-</Text>
                        </TouchableOpacity>
                        <Text className="text-lg px-1 text-white">{itemInCart.quantity}</Text>
                        <TouchableOpacity
                            onPress={handleAddToCart}
                            className="px-3 py-1 text-white rounded-lg"
                        >
                            <Text className="text-white font-bold">+</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handleAddToCart}
                        className='flex flex-row pe-3 ps-4 py-1 border border-green-700 rounded-md items-center justify-center bg-green-50'
                    >
                        <View className='text-green-700 gap-2 flex flex-row justify-center items-center'>
                            <Text className='text-green-700 text-xs font-semibold ps-1 leading-5'>
                                {isPrintItem ? 'PRINT' : 'ADD'}
                            </Text>
                            <Text className='text-green-700 text-lg ps-1 leading-5'>+</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default Product
export type { ProductItem }