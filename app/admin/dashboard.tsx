import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import useAuthStore from '@/store/authStore';

type AnalyticsData = {
    totalSales: number;
    totalOrders: number;
    productCount: number;
    avgOrderValue: number;
    medianOrderValue: number;
    totalToday: number;
    totalWeek: number;
    totalMonth: number;
    uniqueItemsSold: number;
    topProducts: { _id: string; sales: number }[];
};

const colors = {
    blue: '#1E3A8A',
    green: '#10B981',
    yellow: '#F59E0B',
    purple: '#9333EA',
    red: '#DC2626',
    indigo: '#4C51BF',
    teal: '#14B8A6',
    gray: '#6B7280',
    background: '#F3F4F6',
    orange: '#F97316',
};

const StatsCard = ({ title, value, bgColor, textColor, }: { title: string; value: number | string; bgColor: string; textColor: string; }) => (
    <View className="p-4 rounded-lg mb-4"
        style={{
            backgroundColor: bgColor,
        }}
    >
        <Text className="font-semibold text-lg mb-2" style={{ color: textColor }}>{title}</Text>
        <Text className="font-bold text-2xl" style={{ color: textColor }}>{value}</Text>
    </View>
);

const ChartCard = () => (
    <View className="mb-12 rounded-lg p-4"
        style={{
            backgroundColor: colors.blue,
        }}
    >
        <Text className="text-white font-semibold text-lg mb-4">Sales Over Time</Text>
        <LineChart
            data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        data: [65, 59, 80, 81, 56, 55],
                    },
                ],
            }}
            width={Dimensions.get('window').width - 70}
            height={220}
            chartConfig={{
                backgroundColor: colors.blue,
                backgroundGradientFrom: colors.blue,
                backgroundGradientTo: colors.blue,
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#ffa726',
                },
            }}
            bezier
        />
    </View>
);

const Dashboard = () => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { getAuthHeader } = useAuthStore();

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/vendor/dashboard`, {
                headers: getAuthHeader(),
            });
            const data: AnalyticsData = await response.json();
            setAnalytics(data);
        } catch {
            setAnalytics(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    const formatCurrency = (num: number | undefined) => {
        if (num === undefined || num === null) return '₹0.00';
        return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    };

    const formatNumber = (num: number | undefined) => {
        if (num === undefined || num === null) return '0';
        return num.toLocaleString('en-IN');
    };

    const statsData = [
        { title: 'Total Sales', value: formatCurrency(analytics?.totalSales), bgColor: colors.blue, textColor: 'white' },
        { title: 'Total Orders', value: formatNumber(analytics?.totalOrders), bgColor: colors.green, textColor: 'white' },
        { title: 'Average Order Value', value: formatCurrency(analytics?.avgOrderValue), bgColor: colors.yellow, textColor: 'black' },
        { title: 'Median Order Value', value: formatCurrency(analytics?.medianOrderValue), bgColor: colors.purple, textColor: 'white' },
        { title: 'Total Sales Today', value: formatCurrency(analytics?.totalToday), bgColor: colors.red, textColor: 'white' },
        { title: 'Total Sales This Week', value: formatCurrency(analytics?.totalWeek), bgColor: colors.indigo, textColor: 'white' },
        { title: 'Total Sales This Month', value: formatCurrency(analytics?.totalMonth), bgColor: colors.teal, textColor: 'white' },
        { title: 'Unique Items Sold', value: formatNumber(analytics?.uniqueItemsSold), bgColor: colors.gray, textColor: 'white' },
    ];

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color={colors.blue} />
            </SafeAreaView>
        );
    }

    if (!analytics) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <Text style={{ color: colors.gray }}>Failed to load analytics</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingTop: -28 }}>
            <ScrollView className="px-4 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View className="flex mb-4 rounded-lg bg-white shadow-md p-4"
                    style={{
                        backgroundColor: colors.orange,
                    }}
                >
                    <Text className="text-white font-semibold text-lg mb-2">Top Products</Text>
                    {analytics.topProducts.length === 0 ? (
                        <Text style={{ color: 'white' }}>No products available</Text>
                    ) : (
                        analytics.topProducts.map((product, index) => (
                            <View key={index} className="flex-row justify-between">
                                <Text className="text-white flex-1 mr-2" numberOfLines={1}>
                                    {index + 1}. {product._id}
                                </Text>
                                <Text className="text-white">
                                    {formatCurrency(product.sales)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                <View className="grid grid-cols-2 gap-x-2 justify-center">
                    {statsData.map((stat, index) => (
                        <StatsCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            bgColor={stat.bgColor}
                            textColor={stat.textColor}
                        />
                    ))}
                </View>
                <ChartCard />
            </ScrollView>
        </SafeAreaView>
    );
};

export default Dashboard;
