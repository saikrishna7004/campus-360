import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useCartStore from '@/store/cartStore';

const CartSummary = () => {
  const router = useRouter();
  const totalItems = useCartStore(state => state.getTotalItems());
  const carts = useCartStore(state => state.getVendorCarts());
  
  if (totalItems === 0) {
    return null;
  }
  
  const totalPrice = carts.reduce((total, cart) => {
    return total + cart.items.reduce((cartTotal, item) => {
      return cartTotal + (item.price * item.quantity);
    }, 0);
  }, 0);

  return (
    <TouchableOpacity 
      onPress={() => router.push('/cart')}
      className="absolute bottom-4 left-4 right-4 bg-green-700 px-4 py-3 rounded-lg shadow-md flex-row justify-between items-center"
    >
      <View className="flex-row items-center">
        <View className="bg-white rounded-full w-6 h-6 items-center justify-center mr-2">
          <Text className="text-green-700 font-bold">{totalItems}</Text>
        </View>
        <Text className="text-white font-bold">View Cart</Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-white font-bold mr-2">₹{totalPrice.toFixed(2)}</Text>
        <FontAwesome name="arrow-right" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );
};

export default CartSummary;
