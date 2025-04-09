import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import useOrderStore from '@/store/orderStore'
import useAuthStore from '@/store/authStore'
import { useFocusEffect } from '@react-navigation/native'

const Orders = () => {
    const [activeTab, setActiveTab] = useState<'preparing' | 'ready'>('preparing')
    const [refreshing, setRefreshing] = useState(false)
    const { orders, updateOrderStatus, fetchOrders, fetchNewOrders, loading } = useOrderStore()
    const { getAuthHeader } = useAuthStore()

    useFocusEffect(
        useCallback(() => {
            const authHeader = getAuthHeader()
            fetchOrders(authHeader)

            const interval = setInterval(() => fetchNewOrders(authHeader), 30000)

            return () => clearInterval(interval)
        }, [getAuthHeader, fetchOrders, fetchNewOrders])
    )

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchOrders(getAuthHeader()).finally(() => setRefreshing(false))
    }, [getAuthHeader, fetchOrders])

    const handleUpdateStatus = useCallback((orderId: string, newStatus: 'preparing' | 'ready' | 'completed') => {
        Alert.alert('Update Order Status', `Mark this order as ${newStatus}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Yes',
                onPress: async () => {
                    try {
                        await updateOrderStatus(orderId, newStatus, getAuthHeader())
                    } catch {
                        Alert.alert('Error', 'Failed to update order status.')
                    }
                }
            }
        ])
    }, [updateOrderStatus, getAuthHeader])

    const filteredOrders = useMemo(() => orders.filter(order => order.status === activeTab), [orders, activeTab])

    return (
        <SafeAreaView className="flex-1 bg-white -mt-2" edges={['top', 'left', 'right']}>
            <StatusBar style="inverted" />
            <View className="flex-row gap-4 px-4">
                {['preparing', 'ready'].map(tab => (
                    <TouchableOpacity 
                        key={tab}
                        onPress={() => setActiveTab(tab as 'preparing' | 'ready')} 
                        className={`rounded-xl border py-2 px-4 ${activeTab === tab ? 'border-green-800 bg-green-50' : 'border-gray-200'}`}
                    >
                        <Text className={`${activeTab === tab ? 'font-bold text-green-800' : ''}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#0000ff" className="mt-4" />
            ) : (
                <ScrollView 
                    className="p-4"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#00f']} />}
                >
                    {filteredOrders.length === 0 ? (
                        <Text className="text-center text-gray-500 my-8">No {activeTab} orders</Text>
                    ) : (
                        filteredOrders.map(order => (
                            <View key={order._id} className="bg-white rounded-xl shadow-sm mb-4 p-4 border border-gray-100">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="font-bold text-lg">Order #{order.orderId}</Text>
                                    <Text className="text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</Text>
                                </View>
                                <View>
                                    {order.items.map((item, index) => (
                                        <View key={index} className="mb-2 flex-row items-center">
                                            <Text className="flex-1 text-base font-medium pr-2">{item.name} x{item.quantity}</Text>
                                            <Text className="text-base text-right w-20 truncate">₹{(item.price * item.quantity).toFixed(2)}</Text>
                                        </View>
                                    ))}
                                    
                                    <View className="border-t border-gray-200 my-3" />
                                    
                                    <View className="flex-row justify-between mb-4">
                                        <Text className="text-lg font-bold">Total:</Text>
                                        <Text className="text-lg font-bold text-right w-20 truncate">₹{order.totalAmount.toFixed(2)}</Text>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        onPress={() => handleUpdateStatus(order._id, activeTab === 'preparing' ? 'ready' : 'completed')}
                                        className={activeTab === 'preparing' ? 'bg-green-600 py-2 rounded-md' : 'bg-blue-600 py-2 rounded-md'}
                                    >
                                        <Text className="text-white font-medium text-center">{activeTab === 'preparing' ? 'Mark as Ready' : 'Mark as Completed'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    )
}

export default Orders
