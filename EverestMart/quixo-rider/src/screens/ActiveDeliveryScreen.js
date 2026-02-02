import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { useRiderAuth } from '../context/RiderAuthContext';
import { riderAPI } from '../services/api';

export default function ActiveDeliveryScreen({ navigation, route }) {
    const { token } = useRiderAuth();
    const { order } = route.params;
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleMarkPickedUp = async () => {
        Alert.alert(
            'Mark as Picked Up',
            'Have you collected the order from the merchant?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Picked Up',
                    onPress: async () => {
                        try {
                            setActionLoading(true);
                            await riderAPI.markPickedUp(order._id, token);
                            Alert.alert('Success', 'Order marked as picked up!', [
                                { text: 'OK', onPress: () => navigation.goBack() },
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to update status');
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleDeliverOrder = async () => {
        try {
            setActionLoading(true);
            await riderAPI.generateOTP(order._id, token);
            setShowOTPModal(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate OTP');
        } finally {
            setActionLoading(false);
        }
    };

    const verifyAndDeliver = async () => {
        if (!otpInput || otpInput.length !== 6) {
            setOtpError('Please enter 6-digit OTP');
            return;
        }

        try {
            setOtpLoading(true);
            setOtpError('');
            await riderAPI.verifyDelivery(order._id, otpInput, token);

            setShowOTPModal(false);
            Alert.alert('Success', '✅ Order delivered successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
            ]);
        } catch (error) {
            setOtpError(error.response?.data?.error || 'Invalid OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const callCustomer = () => {
        const phone = order.shippingAddress?.phone;
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Delivery</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Order Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Details</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Order ID</Text>
                            <Text style={styles.infoValue}>#{order._id?.slice(-8)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Amount</Text>
                            <Text style={styles.infoValueBold}>₹{order.totalAmount}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status</Text>
                            <Text style={[styles.infoValue, styles.statusText]}>
                                {order.orderStatus}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Payment</Text>
                            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
                        </View>
                    </View>
                </View>

                {/* Customer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Details</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>
                                {order.shippingAddress?.name || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <TouchableOpacity onPress={callCustomer}>
                                <Text style={[styles.infoValue, styles.phoneLink]}>
                                    {order.shippingAddress?.phone || 'N/A'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.addressRow}>
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={styles.addressValue}>
                                {order.shippingAddress?.street}, {order.shippingAddress?.city},{' '}
                                {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.callButton} onPress={callCustomer}>
                        <Text style={styles.callButtonText}>📞 Call Customer</Text>
                    </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    {order.orderStatus === 'preparing' && (
                        <TouchableOpacity
                            style={[styles.actionButton, actionLoading && styles.actionButtonDisabled]}
                            onPress={handleMarkPickedUp}
                            disabled={!!actionLoading}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.actionButtonText}>📦 Mark as Picked Up</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {(order.orderStatus === 'shipped' || order.orderStatus === 'out_for_delivery') && (
                        <TouchableOpacity
                            style={[styles.deliverButton, actionLoading && styles.actionButtonDisabled]}
                            onPress={handleDeliverOrder}
                            disabled={!!actionLoading}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.actionButtonText}>✓ Mark as Delivered</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* OTP Modal */}
            <Modal
                visible={showOTPModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowOTPModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🔐 Enter Delivery OTP</Text>
                        <Text style={styles.modalSubtitle}>
                            Ask customer for the 6-digit OTP
                        </Text>

                        <TextInput
                            style={styles.otpInput}
                            value={otpInput}
                            onChangeText={(text) => {
                                setOtpInput(text.replace(/\D/g, ''));
                                setOtpError('');
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholder="000000"
                            placeholderTextColor="#9ca3af"
                        />

                        {otpError ? (
                            <Text style={styles.errorText}>❌ {otpError}</Text>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.verifyButton, otpLoading && styles.actionButtonDisabled]}
                            onPress={verifyAndDeliver}
                            disabled={!!otpLoading}
                        >
                            {otpLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.verifyButtonText}>✓ Verify & Deliver</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowOTPModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    content: {
        flex: 1,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    addressRow: {
        marginTop: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    infoValueBold: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10b981',
    },
    statusText: {
        textTransform: 'uppercase',
        color: '#3b82f6',
    },
    phoneLink: {
        color: '#3b82f6',
        textDecorationLine: 'underline',
    },
    addressValue: {
        fontSize: 14,
        color: '#1f2937',
        marginTop: 4,
        lineHeight: 20,
    },
    callButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    callButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    actionsSection: {
        padding: 20,
    },
    actionButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    deliverButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    otpInput: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    verifyButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    verifyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '600',
    },
});
