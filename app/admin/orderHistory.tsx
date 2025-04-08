import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '@/store/authStore';

type OrderHistoryData = {
    orders: Array<{
        _id: string;
        totalAmount: number;
        status: string;
        createdAt: string;
        user: {
            name: string;
            email: string;
        };
        items: Array<{
            productId: {
                name: string;
                price: number;
            };
            quantity: number;
            price: number;
        }>;
    }>;
    summary: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
    };
    hasMore: boolean;
    page: number;
};

const OrderHistory = () => {
    const [historyData, setHistoryData] = useState<OrderHistoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const { getAuthHeader } = useAuthStore();

    const fetchHistory = async (pageNum = 1, append = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/vendor/history?page=${pageNum}&limit=10`, {
                headers: getAuthHeader(),
            });
            const data = await response.json();
            
            if (append && historyData) {
                setHistoryData({
                    ...data,
                    orders: [...historyData.orders, ...data.orders],
                });
            } else {
                setHistoryData(data);
            }
            setPage(pageNum);
        } catch {
            if (!append) setHistoryData(null);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    const loadMore = () => {
        if (!loadingMore && historyData?.hasMore && !refreshing) {
            fetchHistory(page + 1, true);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory(1);
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN');
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };

    const groupOrdersByMonth = (orders: OrderHistoryData['orders']) => {
        const grouped = orders.reduce((acc, order) => {
            const date = new Date(order.createdAt);
            const monthYear = formatMonthYear(date);
            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(order);
            return acc;
        }, {} as Record<string, OrderHistoryData['orders']>);

        return Object.entries(grouped).sort((a, b) => 
            new Date(b[1][0].createdAt).getTime() - new Date(a[1][0].createdAt).getTime()
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#1E3A8A" />
            </SafeAreaView>
        );
    }

    if (!historyData) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <Text style={{ color: '#6B7280', marginBottom: 16 }}>Failed to load order history</Text>
                <TouchableOpacity 
                    onPress={onRefresh}
                    className="bg-blue-900 px-4 py-2 rounded-lg"
                >
                    <Text className="text-white">Try Again</Text>
                </TouchableOpacity>
                {refreshing && <ActivityIndicator size="small" color="#1E3A8A" className="mt-4" />}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingTop: -28 }}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                className="p-4"
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const paddingToBottom = 50;
                    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
                        contentSize.height - paddingToBottom;
                    
                    if (isCloseToBottom) {
                        loadMore();
                    }
                }}
                scrollEventThrottle={16}
            >
                <View className="bg-blue-900 p-4 rounded-lg mb-4">
                    <Text className="text-white text-lg font-bold mb-2">Summary</Text>
                    <View className="flex-row justify-between">
                        <View>
                            <Text className="text-white">Total Orders</Text>
                            <Text className="text-white font-bold">{historyData.summary.totalOrders}</Text>
                        </View>
                        <View>
                            <Text className="text-white">Total Revenue</Text>
                            <Text className="text-white font-bold">{formatCurrency(historyData.summary.totalRevenue)}</Text>
                        </View>
                        <View>
                            <Text className="text-white">Average Order</Text>
                            <Text className="text-white font-bold">{formatCurrency(historyData.summary.averageOrderValue)}</Text>
                        </View>
                    </View>
                </View>

                <View className="mb-4">
                    {groupOrdersByMonth(historyData.orders).map(([monthYear, monthOrders]) => (
                        <View key={monthYear}>
                            <Text className="text-lg font-bold text-gray-600 mb-3 mt-4 px-1">
                                {monthYear}
                            </Text>
                            {monthOrders.map((order) => (
                                <View key={order._id} className="bg-gray-50 p-4 rounded-lg mb-3">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="font-bold flex-1 mr-2" numberOfLines={1}>
                                            {order.user.name}
                                        </Text>
                                        <Text className="text-gray-600">
                                            {new Date(order.createdAt).toLocaleString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                day: '2-digit',
                                                month: 'short',
                                            })}
                                        </Text>
                                    </View>
                                    
                                    {order.items.map((item, index) => (
                                        <View key={index} className="flex-row justify-between items-end py-1">
                                            <Text className="flex-1 mr-2" numberOfLines={2}>{item.quantity} x {item.productId.name}</Text>
                                            <Text>{formatCurrency(item.price * item.quantity)}</Text>
                                        </View>
                                    ))}
                                    
                                    <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-200">
                                        <Text className="font-bold">Total</Text>
                                        <Text className="font-bold">{formatCurrency(order.totalAmount)}</Text>
                                    </View>
                                    <Text className={`mt-2 ${
                                        order.status === 'completed' ? 'text-green-600' :
                                        order.status === 'cancelled' ? 'text-red-600' :
                                        'text-yellow-600'
                                    }`} numberOfLines={1}>
                                        Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {loadingMore && (
                    <View className="items-center mb-8">
                        <ActivityIndicator size="small" color="#1E3A8A" />
                        <Text className="text-gray-600 text-sm mb-4">Loading more orders...</Text>
                    </View>
                )}

                {!loadingMore && !historyData.hasMore && historyData.orders.length > 0 && (
                    <Text className="text-center text-gray-600 py-2 mb-12">No more orders to load</Text>
                )}

                {!loadingMore && historyData.orders.length === 0 && (
                    <Text className="text-center text-gray-600 py-2 mb-12">No orders found</Text>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

export default OrderHistory;
