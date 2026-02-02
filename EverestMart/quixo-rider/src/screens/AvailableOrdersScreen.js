import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRiderAuth } from '../context/RiderAuthContext';
import { riderAPI } from '../services/api';

export default function AvailableOrdersScreen({ navigation }) {
    const { token } = useRiderAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [accepting, setAccepting] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await riderAPI.getAvailableOrders(token);
            setOrders(res.data || []);
        } catch (error) {
            console.error('Load orders error:', error);
            Alert.alert('Error', 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const acceptOrder = async (orderId) => {
        Alert.alert(
            'Accept Order',
            'Are you sure you want to accept this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept',
                    onPress: async () => {
                        try {
                            setAccepting(orderId);
                            await riderAPI.acceptOrder(orderId, token);
                            Alert.alert('Success', 'Order accepted! Check dashboard for details', [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.navigate('Dashboard'),
                                },
                            ]);
                            loadOrders();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.error || 'Failed to accept order');
                        } finally {
                            setAccepting(null);
                        }
                    },
                },
            ]
        );
    };

    const renderOrder = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{item._id?.slice(-8).toUpperCase()}</Text>
                <Text style={styles.orderAmount}>₹{item.totalAmount}</Text>
            </View>

            <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📦 Items:</Text>
                    <Text style={styles.detailValue}>{item.items?.length || 0} items</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Location:</Text>
                    <Text style={styles.detailValue}>{item.shippingAddress?.city || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💳 Payment:</Text>
                    <Text style={styles.detailValue}>{item.paymentMethod}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.acceptButton, accepting === item._id && styles.acceptButtonDisabled]}
                onPress={() => acceptOrder(item._id)}
                disabled={!!(accepting === item._id)}
            >
                {accepting === item._id ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.acceptButtonText}>✓ Accept Order</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Available Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🔍</Text>
                        <Text style={styles.emptyText}>No orders available</Text>
                        <Text style={styles.emptySubtext}>Pull to refresh</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        fontSize: 28,
        color: '#1f2937',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    list: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
    },
    orderAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#10b981',
    },
    orderDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    acceptButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    acceptButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    acceptButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
    },
});
