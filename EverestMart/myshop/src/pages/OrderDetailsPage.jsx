import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import { io } from 'socket.io-client';
import config from '../config/config';

const API_URL = config.API_BASE_URL;
const SOCKET_URL = config.SOCKET_URL;

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
};

const getStepStatus = (currentStatus, stepStatus) => {
    const steps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(stepStatus);

    if (currentStatus === 'cancelled') return 'cancelled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
};

const OrderTimeline = ({ status }) => {
    const steps = [
        { key: 'confirmed', label: 'Confirmed', icon: '📝' },
        { key: 'preparing', label: 'Preparing', icon: '🍳' },
        { key: 'out_for_delivery', label: 'On the Way', icon: '🛵' },
        { key: 'delivered', label: 'Delivered', icon: '🎉' }
    ];

    return (
        <div style={styles.timeline}>
            {steps.map((step, index) => {
                const stepStatus = getStepStatus(status, step.key);
                return (
                    <div key={step.key} style={styles.timelineStep}>
                        <div style={{
                            ...styles.timelineIcon,
                            background: stepStatus === 'completed' || stepStatus === 'active' ? '#0c831f' : '#e2e8f0',
                            color: stepStatus === 'completed' || stepStatus === 'active' ? 'white' : '#94a3b8',
                            border: stepStatus === 'active' ? '4px solid #dcfce7' : '4px solid transparent'
                        }}>
                            {step.icon}
                        </div>
                        <div style={styles.timelineContent}>
                            <span style={{
                                ...styles.timelineLabel,
                                color: stepStatus === 'pending' ? '#94a3b8' : '#0f172a',
                                fontWeight: stepStatus === 'active' ? 'bold' : '500'
                            }}>{step.label}</span>
                            {index < steps.length - 1 && (
                                <div style={{
                                    ...styles.timelineLine,
                                    background: stepStatus === 'completed' ? '#0c831f' : '#e2e8f0'
                                }}></div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const libraries = ['places'];

function OrderDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [riderLocation, setRiderLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const mapRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        fetchOrderDetails();
        initializeSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [orderId]);

    // Update directions when rider moves
    useEffect(() => {
        if (riderLocation && order?.shippingAddress?.location && window.google) {
            calculateRoute();
        }
    }, [riderLocation, order]);

    const initializeSocket = () => {
        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            console.log('🔌 Connected to socket for tracking');
            socketRef.current.emit('join-order', orderId);
        });

        socketRef.current.on('live-location', (data) => {
            console.log('📍 Live location update:', data);
            if (data.orderId === orderId && data.location) {
                setRiderLocation(data.location);
            }
        });

        socketRef.current.on('order-update-' + orderId, (update) => {
            console.log('📦 Order status update:', update);
            fetchOrderDetails(); // Reload order data
        });
    };

    const fetchOrderDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const { data } = await axios.get(`${API_URL}/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrder(data.order);

            // Set initial rider location if available
            if (data.order.rider?.currentLocation) {
                setRiderLocation(data.order.rider.currentLocation);
            }

        } catch (err) {
            console.error('Failed to fetch order:', err);
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const calculateRoute = async () => {
        if (!window.google || !riderLocation || !order?.shippingAddress?.location) return;

        try {
            const directionsService = new window.google.maps.DirectionsService();

            const destination = {
                lat: order.shippingAddress.location.latitude,
                lng: order.shippingAddress.location.longitude
            };

            const result = await directionsService.route({
                origin: riderLocation,
                destination: destination,
                travelMode: window.google.maps.TravelMode.DRIVING
            });

            setDirections(result);
        } catch (error) {
            console.error('Route calculation failed:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return '#10b981';
            case 'cancelled': return '#ef4444';
            case 'out_for_delivery': return '#3b82f6';
            default: return '#f59e0b';
        }
    };

    if (loading) return <div style={styles.loading}>Loading order details...</div>;
    if (error) return <div style={styles.error}>{error}</div>;
    if (!order) return <div style={styles.error}>Order not found</div>;

    const showMap = ['shipped', 'out_for_delivery'].includes(order.orderStatus);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/orders')} style={styles.backBtn}>← Back</button>
                <h1 style={styles.title}>Order #{order._id.slice(-8).toUpperCase()}</h1>
                <span style={{ ...styles.statusBadge, background: getStatusColor(order.orderStatus) }}>
                    {order.orderStatus.replace(/_/g, ' ')}
                </span>
            </div>

            <div style={styles.contentGrid}>
                {/* Left Column: Details */}
                <div style={styles.detailsColumn}>

                    {/* OTP Section for Customer */}
                    {order.deliveryOTP && order.orderStatus === 'out_for_delivery' && (
                        <div style={styles.otpCard}>
                            <div style={styles.otpLabel}>Share this OTP with Rider</div>
                            <div style={styles.otpCode}>{order.deliveryOTP}</div>
                            <p style={styles.otpHint}>Only share when you receive the package</p>
                        </div>
                    )}

                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Items</h3>
                        {order.items.map((item, idx) => (
                            <div key={idx} style={styles.itemRow}>
                                <img
                                    src={item.product?.image || item.image || '/placeholder.png'}
                                    alt={item.name}
                                    style={styles.itemImage}
                                    onError={(e) => e.target.src = '/placeholder.png'}
                                />
                                <div>
                                    <div style={styles.itemName}>{item.product?.name || item.name}</div>
                                    <div style={styles.itemMeta}>{item.quantity} x ₹{item.price}</div>
                                </div>
                                <div style={styles.itemTotal}>₹{item.quantity * item.price}</div>
                            </div>
                        ))}
                        <div style={styles.totalRow}>
                            <span>Total Amount</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Delivery Address</h3>
                        <p style={styles.addressText}>
                            <strong>{order.shippingAddress?.name}</strong><br />
                            {order.shippingAddress?.street}, {order.shippingAddress?.area}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}<br />
                            Phone: {order.shippingAddress?.phone}
                        </p>
                    </div>
                </div>

                {/* Right Column: Map & Tracking */}
                <div style={styles.mapColumn}>
                    {showMap ? (
                        <div style={styles.mapCard}>
                            <h3 style={styles.cardTitle}>Live Tracking</h3>
                            <LoadScript googleMapsApiKey="AIzaSyBxYHyG4YD4aNXR84uRcTZQdX6XvxJwxYk" libraries={libraries}>
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={riderLocation || (order.shippingAddress?.location ? {
                                        lat: order.shippingAddress.location.latitude,
                                        lng: order.shippingAddress.location.longitude
                                    } : { lat: 19.0760, lng: 72.8777 })}
                                    zoom={15}
                                    onLoad={map => mapRef.current = map}
                                >
                                    {/* Rider Marker */}
                                    {riderLocation && (
                                        <Marker
                                            position={riderLocation}
                                            icon={{
                                                url: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png', // Delivery Scoot Icon
                                                scaledSize: new window.google.maps.Size(40, 40)
                                            }}
                                            title="Rider"
                                        />
                                    )}

                                    {/* Destination Marker */}
                                    {order.shippingAddress?.location && (
                                        <Marker
                                            position={{
                                                lat: order.shippingAddress.location.latitude,
                                                lng: order.shippingAddress.location.longitude
                                            }}
                                            title="Delivery Location"
                                        />
                                    )}

                                    {/* Route Line */}
                                    {directions && (
                                        <DirectionsRenderer
                                            directions={directions}
                                            options={{
                                                suppressMarkers: true,
                                                polylineOptions: { strokeColor: '#0c831f', strokeOpacity: 0.8, strokeWeight: 5 }
                                            }}
                                        />
                                    )}
                                </GoogleMap>
                            </LoadScript>

                            {riderLocation && (
                                <div style={styles.trackingInfo}>
                                    <div style={styles.trackingStatus}>
                                        <span style={styles.pulseDot}></span>
                                        Rider is on the way
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={styles.statusCard}>
                            <div style={styles.statusIcon}>
                                {order.orderStatus === 'delivered' ? '✅' : '🕒'}
                            </div>
                            <h3>Order {order.orderStatus.replace(/_/g, ' ')}</h3>
                            <p>Live tracking available when out for delivery.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
    loading: { display: 'flex', justifyContent: 'center', padding: '4rem', color: '#666' },
    error: { textAlign: 'center', padding: '4rem', color: '#ef4444' },

    header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' },
    backBtn: { padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer' },
    title: { fontSize: '1.5rem', fontWeight: 'bold' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '20px', color: 'white', fontSize: '0.875rem', textTransform: 'capitalize' },

    contentGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' },

    detailsColumn: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #eee' },
    cardTitle: { fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.75rem' },

    itemRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
    itemImage: { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' },
    itemName: { fontWeight: '500' },
    itemMeta: { fontSize: '0.875rem', color: '#666' },
    itemTotal: { marginLeft: 'auto', fontWeight: 'bold' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '0.5rem' },

    addressText: { lineHeight: '1.6', color: '#444' },

    otpCard: { background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' },
    otpLabel: { color: '#92400e', fontSize: '0.9rem', marginBottom: '0.5rem' },
    otpCode: { fontSize: '2rem', fontWeight: 'bold', color: '#b45309', letterSpacing: '2px' },
    otpHint: { fontSize: '0.8rem', color: '#92400e', marginTop: '0.5rem' },

    mapColumn: {},
    mapCard: { background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #eee' },
    statusCard: { background: 'white', borderRadius: '12px', padding: '3rem', border: '1px solid #eee', textAlign: 'center' },
    statusIcon: { fontSize: '3rem', marginBottom: '1rem' },

    trackingInfo: { marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    trackingStatus: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0c831f', fontWeight: '600' },
    pulseDot: { width: '10px', height: '10px', background: '#0c831f', borderRadius: '50%', boxShadow: '0 0 0 0 rgba(12, 131, 31, 0.7)', animation: 'pulse 1.5s infinite' },

    // Timeline Styles
    trackingSection: { marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #eee' },
    timeline: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' },
    timelineStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' },
    timelineIcon: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', zIndex: 2, marginBottom: '0.5rem' },
    timelineContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
    timelineLabel: { fontSize: '0.875rem', textAlign: 'center' },
    timelineLine: { position: 'absolute', top: '20px', left: '50%', width: '100%', height: '3px', zIndex: 1 },

    // Rider Card Styles
    riderCard: { background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' },
    riderHeader: { display: 'flex', alignItems: 'center', gap: '1rem' },
    riderAvatar: { width: '48px', height: '48px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: '#475569' },
    riderName: { fontSize: '1rem', fontWeight: '600', color: '#0f172a', margin: 0 },
    riderRole: { fontSize: '0.875rem', color: '#64748b', margin: 0 },
    callBtn: { marginLeft: 'auto', padding: '0.5rem 1rem', background: '#e0f2fe', color: '#0284c7', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' },

    orderId: { fontSize: '0.875rem', color: '#64748b', margin: 0 }
};

// Add styles for pulse animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(12, 131, 31, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(12, 131, 31, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(12, 131, 31, 0); }
  }
`;
document.head.appendChild(styleSheet);

export default OrderDetailsPage;
