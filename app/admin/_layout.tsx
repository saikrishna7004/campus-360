import React, { useState } from 'react'
import { View, Text, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Orders from './orders'
import Menu from './menu'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const Tab = createBottomTabNavigator()

const AdminLayout = () => {
    const [isOnline, setIsOnline] = useState(true)

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    header: () => (
                        <View className="flex-row justify-between items-center p-4 bg-gray-100">
                            <Text className="text-lg font-bold">{route.name}</Text>
                            <View className="flex-row items-center">
                                <Text className="text-sm me-2">{isOnline ? 'Online' : 'Offline'}</Text>
                                <Switch value={isOnline} onValueChange={setIsOnline} />
                            </View>
                        </View>
                    ),
                })}           
            >
                <Tab.Screen 
                    name="Orders" 
                    component={Orders} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="clipboard-list" color={color} size={size} />
                        ),
                    }}
                />
                <Tab.Screen 
                    name="Menu" 
                    component={Menu} 
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="food" color={color} size={size} />
                        ),
                    }}
                />
            </Tab.Navigator>
        </SafeAreaView>
    )
}

export default AdminLayout
