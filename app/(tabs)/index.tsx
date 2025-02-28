import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const Home = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-3xl font-bold mb-8">Welcome to College Management</Text>

      <View className="grid grid-cols-2 gap-4">
        <TouchableOpacity style={styles.card} className="bg-green-500 p-6 rounded-xl shadow-lg flex justify-center items-center">
          <MaterialCommunityIcons name="food" size={40} color="white" />
          <Text className="text-white text-lg mt-4">Canteen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} className="bg-blue-500 p-6 rounded-xl shadow-lg flex justify-center items-center">
          <MaterialCommunityIcons name="book-open" size={40} color="white" />
          <Text className="text-white text-lg mt-4">Library</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} className="bg-yellow-500 p-6 rounded-xl shadow-lg flex justify-center items-center">
          <MaterialCommunityIcons name="pencil" size={40} color="white" />
          <Text className="text-white text-lg mt-4">Stationary</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} className="bg-gray-600 p-6 rounded-xl shadow-lg flex justify-center items-center">
          <MaterialCommunityIcons name="briefcase" size={40} color="white" />
          <Text className="text-white text-lg mt-4">Office</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
  },
})

export default Home
