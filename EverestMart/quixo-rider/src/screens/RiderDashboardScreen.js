import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRiderAuth } from '../context/RiderAuthContext';
import { riderAPI } from '../services/api';

export default function RiderDashboardScreen({ navigation }) {
    const { rider, token, logout, updateRider } = useRiderAuth();
    const [stats, setStats] = useState({
        todayDeliveries: 0,
        todayEarnings: 0,
        weeklyEarnings: 0,
        totalDeliveries: 0,
    });
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const [isOnline, setIsOnline] = useState(rider?.isAvailable || false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [earningsRes, ordersRes] = await Promise.all([
                riderAPI.getEarnings(token),
                riderAPI.getOrders(token),
            ]);

            setStats(earningsRes.data);

            const orders = ordersRes.data.orders || ordersRes.data || [];
            const active = orders.find(o =>
                ['preparing', 'shipped', 'out_for_delivery'].includes(o.orderStatus)
            );
            setActiveOrder(active);

            loadAvailableOrders();
        } catch (error) {
            console.error('Dashboard load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const ordersRes = await riderAPI.getOrders(token);
            const orders = ordersRes.data.orders || ordersRes.data || [];
            const active = orders.find(o =>
                ['preparing', 'shipped', 'out_for_delivery'].includes(o.orderStatus)
            );
            setActiveOrder(active);
        } catch (error) {
            console.error('Orders load error:', error);
        }
    };

    const loadAvailableOrders = async () => {
        try {
            const res = await riderAPI.getAvailableOrders(token);
            setAvailableOrders(res.data || []);
        } catch (error) {
            console.error('Available orders error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    const toggleOnlineStatus = async () => {
        try {
            const newStatus = !isOnline;
            await riderAPI.updateAvailability(newStatus, token);
            setIsOnline(newStatus);
            await updateRider({ isAvailable: newStatus });

            if (newStatus) {
                Alert.alert('Online', 'You are now online and will receive order notifications');
                loadAvailableOrders();
            } else {
                Alert.alert('Offline', 'You are now offline. You will not receive new orders');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout,
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {rider?.name}!</Text>
                    <Text style={styles.subgreeting}>Ready to deliver?</Text>
                </View>
                <TouchableOpacity
                    style={[styles.statusButton, isOnline && styles.statusButtonOnline]}
                    onPress={toggleOnlineStatus}
                >
                    <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
                    <Text style={[styles.statusText, isOnline && styles.statusTextOnline]}>
                        {isOnline ? 'Online' : 'Offline'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>💰</Text>
                    <Text style={styles.statValue}>₹{stats.todayEarnings || 0}</Text>
                    <Text style={styles.statLabel}>Today's Earnings</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>📦</Text>
                    <Text style={styles.statValue}>{stats.todayDeliveries || 0}</Text>
                    <Text style={styles.statLabel}>Today's Deliveries</Text>
                </View>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>💵</Text>
                    <Text style={styles.statValue}>₹{stats.weeklyEarnings || 0}</Text>
                    <Text style={styles.statLabel}>Weekly Earnings</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>🚀</Text>
                    <Text style={styles.statValue}>{availableOrders.length}</Text>
                    <Text style={styles.statLabel}>Available Orders</Text>
                </View>
            </View>

            {/* Active Order */}
            {activeOrder && (
                <TouchableOpacity
                    style={styles.activeOrderCard}
                    onPress={() => navigation.navigate('ActiveDelivery', { order: activeOrder })}
                >
                    <View style={styles.activeOrderHeader}>
                        <Text style={styles.activeOrderTitle}>🚚 Active Delivery</Text>
                        <Text style={styles.activeOrderStatus}>{activeOrder.orderStatus}</Text>
                    </View>
                    <View style={styles.activeOrderInfo}>
                        <Text style={styles.activeOrderId}>Order #{activeOrder._id?.slice(-8)}</Text>
                        <Text style={styles.activeOrderAmount}>₹{activeOrder.totalAmount}</Text>
                    </View>
                    <Text style={styles.activeOrderCTA}>Tap to manage →</Text>
                </TouchableOpacity>
            )}

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AvailableOrders')}
                >
                    <Text style={styles.actionEmoji}>📋</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Available Orders</Text>
                        <Text style={styles.actionSubtitle}>
                            {availableOrders.length} orders waiting
                        </Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Earnings')}
                >
                    <Text style={styles.actionEmoji}>💰</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Earnings</Text>
                        <Text style={styles.actionSubtitle}>View detailed breakdown</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.actionEmoji}>🚪</Text>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Logout</Text>
                        <Text style={styles.actionSubtitle}>Sign out of your account</Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
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
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'white',
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
    },
    subgreeting: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    statusButtonOnline: {
        backgroundColor: '#d1fae5',
        borderColor: '#10b981',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#9ca3af',
        marginRight: 8,
    },
    statusDotOnline: {
        backgroundColor: '#10b981',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    statusTextOnline: {
        color: '#047857',
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    statEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
    activeOrderCard: {
        marginHorizontal: 16,
        marginTop: 20,
        backgroundColor: '#eff6ff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#3b82f6',
    },
    activeOrderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    activeOrderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    activeOrderStatus: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
        textTransform: 'uppercase',
    },
    activeOrderInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    activeOrderId: {
        fontSize: 14,
        color: '#4b5563',
    },
    activeOrderAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    activeOrderCTA: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b82f6',
    },
    actionsSection: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    actionEmoji: {
        fontSize: 32,
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#6b7280',
    },
    actionArrow: {
        fontSize: 24,
        color: '#9ca3af',
    },
});
