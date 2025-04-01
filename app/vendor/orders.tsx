import React, { useState, useEffect } from 'react';
import { 
    View, Text, FlatList, ActivityIndicator, 
    TouchableOpacity, RefreshControl, StyleSheet, Alert 
} from 'react-native';
import axios from 'axios';
import useAuthStore from '@/store/authStore';
import { Order } from '@/store/orderStore';

export default function VendorOrders() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuthStore();
    
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/orders/vendor`);
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            Alert.alert("Error", "Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchOrders();
        
        const interval = setInterval(() => {
            fetchOrders();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);
    
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };
    
    const updateOrderStatus = async (orderId: string, status: 'preparing' | 'ready' | 'completed' | 'cancelled') => {
        try {
            await axios.patch(`${process.env.EXPO_PUBLIC_API_URL}/orders/${orderId}/status`, { status });
            
            setOrders(prev => 
                prev.map(order => 
                    order._id === orderId ? { ...order, status } : order
                ).filter(order => 
                    status !== 'completed' && status !== 'cancelled' || order._id !== orderId
                )
            );
        } catch (error) {
            console.error("Failed to update order status:", error);
            Alert.alert("Error", "Failed to update order status. Please try again.");
        }
    };
    
    const handleStatusUpdate = (order: Order, newStatus: 'preparing' | 'ready' | 'completed' | 'cancelled') => {
        Alert.alert(
            "Update Order Status",
            `Are you sure you want to mark order #${order.orderId} as ${newStatus}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Update", 
                    onPress: () => updateOrderStatus(order._id, newStatus)
                }
            ]
        );
    };
    
    const renderStatusActions = (order: Order) => {
        switch (order.status) {
            case 'preparing':
                return (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.readyButton]} 
                            onPress={() => handleStatusUpdate(order, 'ready')}
                        >
                            <Text style={styles.actionButtonText}>Mark Ready</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.cancelButton]} 
                            onPress={() => handleStatusUpdate(order, 'cancelled')}
                        >
                            <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'ready':
                return (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.completedButton]} 
                            onPress={() => handleStatusUpdate(order, 'completed')}
                        >
                            <Text style={styles.actionButtonText}>Mark Completed</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };
    
    const renderItem = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderId}>Order #{item.orderId}</Text>
                    <Text style={styles.orderTime}>
                        {new Date(item.createdAt).toLocaleTimeString()}
                    </Text>
                </View>
                <View style={[
                    styles.statusBadge, 
                    item.status === 'preparing' ? styles.preparingBadge : 
                    item.status === 'ready' ? styles.readyBadge : 
                    styles.completedBadge
                ]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            
            <View style={styles.orderItems}>
                {item.items.map((orderItem, index) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemName}>{orderItem.name}</Text>
                            <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>₹{orderItem.price.toFixed(2)}</Text>
                    </View>
                ))}
            </View>
            
            <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>₹{item.totalAmount.toFixed(2)}</Text>
            </View>
            
            {renderStatusActions(item)}
        </View>
    );
    
    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A9D5B" />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={["#4A9D5B"]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No orders yet</Text>
                        <Text style={styles.emptySubText}>
                            New orders will appear here
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#555',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    orderTime: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    preparingBadge: {
        backgroundColor: '#FFF0C2',
    },
    readyBadge: {
        backgroundColor: '#C7F9CC',
    },
    completedBadge: {
        backgroundColor: '#E6E6E6',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    orderItems: {
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        marginRight: 8,
    },
    itemQty: {
        fontSize: 14,
        color: '#666',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '500',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    readyButton: {
        backgroundColor: '#4CAF50',
    },
    completedButton: {
        backgroundColor: '#2196F3',
    },
    cancelButton: {
        backgroundColor: '#F44336',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
    },
    emptySubText: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
    }
});
