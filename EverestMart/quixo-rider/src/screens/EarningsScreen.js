import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRiderAuth } from '../context/RiderAuthContext';
import { riderAPI } from '../services/api';

export default function EarningsScreen({ navigation }) {
    const { token } = useRiderAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEarnings();
    }, []);

    const loadEarnings = async () => {
        try {
            const res = await riderAPI.getEarnings(token);
            setStats(res.data);
        } catch (error) {
            console.error('Earnings error:', error);
        } finally {
            setLoading(false);
        }
    };

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
                <Text style={styles.headerTitle}>Earnings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Today's Earnings</Text>
                    <Text style={styles.statsAmount}>₹{stats?.todayEarnings || 0}</Text>
                    <Text style={styles.statsSubtitle}>
                        {stats?.todayDeliveries || 0} deliveries
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Breakdown</Text>

                    <View style={styles.breakdownCard}>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>💰 Weekly Earnings</Text>
                            <Text style={styles.breakdownValue}>₹{stats?.weeklyEarnings || 0}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>📦 Total Deliveries</Text>
                            <Text style={styles.breakdownValue}>{stats?.totalDeliveries || 0}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>📅 Today's Deliveries</Text>
                            <Text style={styles.breakdownValue}>{stats?.todayDeliveries || 0}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
    content: {
        flex: 1,
    },
    statsCard: {
        backgroundColor: '#10b981',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
    },
    statsTitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 12,
    },
    statsAmount: {
        fontSize: 48,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    statsSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
    },
    breakdownCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    breakdownLabel: {
        fontSize: 15,
        color: '#6b7280',
    },
    breakdownValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
    },
});
