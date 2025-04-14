import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, ScrollView, RefreshControl, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/cn';

type Period = 'daily' | 'weekly' | 'monthly';
type TimeDirection = 'current' | 'previous' | 'next';

type AnalyticsData = {
    totalSales: number;
    avgOrderValue: number;
    medianOrderValue: number;
    periodLabel: string;
    chartData: {
        labels: string[];
        values: number[];
    };
    topProducts: {
        _id: string;
        name: string;
        quantity: number;
        sales: number;
    }[];
    totalOrders: number;
    todayOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    growth: number;
    busyHours: { hour: number; count: number }[];
};

const StatCard = ({ title, value, subValue, bgColor, isLoading }: { 
    title: string; 
    value: string; 
    subValue?: { text: string; color?: string }; 
    bgColor: string;
    isLoading?: boolean;
}) => (
    <View className={`w-1/2 p-2`}>
        <View className={`${bgColor} p-4 rounded-xl`}>
            <Text className="text-xs text-gray-600">{title}</Text>
            {isLoading ? (
                <ActivityIndicator size="small" color="#4A9D5B" />
            ) : (
                <>
                    <Text className="text-lg font-bold text-gray-900">{value}</Text>
                    {subValue && (
                        <Text className={`text-xs ${subValue.color || 'text-gray-500'}`}>
                            {subValue.text}
                        </Text>
                    )}
                </>
            )}
        </View>
    </View>
);

const Dashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('weekly');
    const [timeDirection, setTimeDirection] = useState<TimeDirection>('current');
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const { getAuthHeader } = useAuthStore();
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [timeWindow, setTimeWindow] = useState(() => {
        const now = new Date();
        return {
            start: now,
            end: now
        };
    });

    const calculateTimeWindow = (period: Period, direction: TimeDirection) => {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch(period) {
            case 'monthly':
                end = new Date(now);
                start = new Date(now);
                start.setMonth(start.getMonth() - 1);
                break;
            case 'weekly':
                end = new Date(now);
                start = new Date(now);
                start.setDate(start.getDate() - 7);
                break;
            case 'daily':
                end = new Date(now);
                start = new Date(now);
                start.setHours(now.getHours() - 24);
                break;
        }

        if (direction !== 'current') {
            const duration = end.getTime() - start.getTime();
            if (direction === 'previous') {
                end = new Date(start);
                start = new Date(start.getTime() - duration);
            } else {
                start = new Date(end);
                end = new Date(end.getTime() + duration);
                if (end > now) {
                    end = now;
                    start = new Date(end.getTime() - duration);
                }
            }
        }

        setTimeWindow({ start, end });
        return { start, end };
    };

    const fetchAnalytics = async () => {
        try {
            setLoadingStats(true);
            const { start, end } = timeWindow;
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/vendor/dashboard?` + 
                `period=${selectedPeriod}&` +
                `direction=${timeDirection}&` +
                `startDate=${start.toISOString()}&` +
                `endDate=${end.toISOString()}`,
                { headers: getAuthHeader() }
            );
            const data = await response.json();
            console.log('Dashboard data:', data);
            setAnalytics(data);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            setAnalytics(null);
        } finally {
            setLoading(false);
            setLoadingStats(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchAnalytics();
    }, [selectedPeriod, timeDirection]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    const formatCurrency = (num: number | undefined) => 
        `₹${(num || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    const animateTransition = () => {
        Animated.parallel([
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0.7,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    };

    const handlePeriodChange = async (period: Period) => {
        if (period === selectedPeriod) return;
        setTimeDirection('current');
        setSelectedPeriod(period);
        calculateTimeWindow(period, 'current');
    };

    const handleDirectionChange = async (direction: TimeDirection) => {
        if (direction === timeDirection) return;
        setTimeDirection(direction);
        calculateTimeWindow(selectedPeriod, direction);
    };

    if (!analytics && loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4A9D5B" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: -28 }}>
            <ScrollView 
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                className="flex-1"
            >
                <View className="flex-row p-4 bg-gray-50 rounded-xl mx-4 mt-4">
                    {(['daily', 'weekly', 'monthly'] as Period[]).map((period) => (
                        <TouchableOpacity
                            key={period}
                            onPress={() => handlePeriodChange(period)}
                            className={`flex-1 py-2 items-center rounded-lg ${selectedPeriod === period ? 'bg-green-600' : ''}`}
                        >
                            <Text className={`font-semibold ${selectedPeriod === period ? 'text-white' : 'text-gray-600'}`}>
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="flex-row justify-between items-center px-4 mb-4">
                    <TouchableOpacity 
                        onPress={() => handleDirectionChange('previous')}
                        className="p-2"
                    >
                        <MaterialCommunityIcons name="chevron-left" size={24} color="#4A9D5B" />
                    </TouchableOpacity>
                    <Text className="text-base font-semibold text-gray-800">
                        {analytics?.periodLabel || 'Current Period'}
                    </Text>
                    <TouchableOpacity 
                        onPress={() => handleDirectionChange('next')}
                        className="p-2"
                    >
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#4A9D5B" />
                    </TouchableOpacity>
                </View>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                    <View className="rounded-xl">
                        <Text className="text-lg font-semibold mb-4 px-4">Sales Overview</Text>
                        <LineChart
                            data={{
                                labels: analytics?.chartData?.labels?.map(label => 
                                    label ? (label.includes(' ') ? label : `${label}`) : ''
                                ) || [],
                                datasets: [{
                                    data: analytics?.chartData?.values?.length ? 
                                        analytics.chartData.values : 
                                        [0, 0]
                                }]
                            }}
                            width={Dimensions.get('window').width - 32}
                            height={220}
                            chartConfig={{
                                // backgroundColor: '#059669',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(5, 170, 105, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                propsForDots: {
                                    r: '6',
                                    strokeWidth: '2',
                                    stroke: '#05AA69'
                                },
                                propsForBackgroundLines: {
                                    strokeDasharray: '',
                                    stroke: "rgba(0, 0, 0, 0.1)"
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                            withVerticalLabels
                            withHorizontalLabels
                            withInnerLines
                            withDots
                            segments={3}
                            fromZero
                        />
                    </View>

                    <View className="flex-row flex-wrap mx-2">
                        <StatCard
                            title="Total Sales"
                            value={formatCurrency(analytics?.totalSales)}
                            subValue={analytics?.growth !== undefined ? {
                                text: `${analytics.growth >= 0 ? '↑' : '↓'} ${Math.abs(analytics.growth)}%`,
                                color: analytics.growth >= 0 ? 'text-green-600' : 'text-red-600'
                            } : undefined}
                            bgColor="bg-green-50"
                            isLoading={loadingStats}
                        />
                        <StatCard
                            title="Total Orders"
                            value={String(analytics?.totalOrders || 0)}
                            subValue={{ text: `Completed ${analytics?.completedOrders || 0}` }}
                            bgColor="bg-blue-50"
                            isLoading={loadingStats}
                        />
                        <StatCard
                            title="Average Order"
                            value={formatCurrency(analytics?.avgOrderValue)}
                            subValue={{ text: `Median ${formatCurrency(analytics?.medianOrderValue)}` }}
                            bgColor="bg-purple-50"
                            isLoading={loadingStats}
                        />
                        <StatCard
                            title="Order Status"
                            value={String(analytics?.completedOrders || 0)}
                            subValue={{ 
                                text: `${analytics?.cancelledOrders || 0} cancelled`,
                                color: 'text-red-500'
                            }}
                            bgColor="bg-yellow-50"
                            isLoading={loadingStats}
                        />
                    </View>

                    <View className="mx-2 p-4">
                        <Text className="text-base font-semibold text-gray-800 mb-2">Peak Hours</Text>
                        <View className="flex-row flex-wrap">
                            {analytics?.busyHours?.map(({ hour, count }) => (
                                <View key={hour} className="w-1/3 p-1">
                                    <View className={`p-2 rounded-lg ${count > 5 ? 'bg-green-100' : 'bg-gray-50'}`}>
                                        <Text className="text-xs text-center">{`${hour}:00`}</Text>
                                        <Text className="text-center font-semibold">{count}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View className="m-4 bg-white rounded-xl p-4 shadow-sm">
                        <Text className="text-lg font-semibold text-gray-800 mb-4">Top Selling Items</Text>
                        {analytics?.topProducts?.map((product, index) => (
                            <View key={index} className={cn("flex-row justify-between items-center py-3 border-gray-100", {
                                "border-b": index < analytics.topProducts.length - 1,
                            })}>
                                <View className="flex-row items-center flex-1">
                                    <Text className="w-6 text-base font-semibold text-green-600">{index + 1}</Text>
                                    <Text className="flex-1 text-base text-gray-800" numberOfLines={3}>
                                        {product.name}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-sm text-gray-600 mr-2">x{product.quantity}</Text>
                                    <Text className="text-sm font-semibold text-green-600">{formatCurrency(product.sales)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Dashboard;
