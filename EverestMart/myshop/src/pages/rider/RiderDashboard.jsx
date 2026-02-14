import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import io from 'socket.io-client';
import config from '../../config/config';

let socket = null;

function RiderDashboard() {
  const [rider, setRider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    totalDeliveries: 0
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [locationPermission, setLocationPermission] = useState('pending');
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [mapsLoaded, setMapsLoaded] = useState(false); // ✅ Add this

  // ✅ OTP Delivery Verification States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const mapContainerStyle = {
    width: '100%',
    height: '450px',
    borderRadius: '0'
  };


  // ✅ Add token debugging
  useEffect(() => {
    const token = localStorage.getItem('riderToken');
    const rider = localStorage.getItem('rider');

    console.log('🔍 Dashboard mounted');
    console.log('Token exists:', !!token);
    console.log('Rider data exists:', !!rider);

    if (!token || !rider) {
      console.log('❌ Missing credentials, redirecting to login...');
      window.location.href = '/rider/login';
      return;
    }

    try {
      const riderData = JSON.parse(rider);
      console.log('✅ Rider data:', riderData);

      // Check if approved
      if (riderData.status !== 'approved') {
        alert(`Your account is ${riderData.status}. Please contact admin.`);
        localStorage.clear();
        window.location.href = '/rider/login';
      }
    } catch (error) {
      console.error('❌ Invalid rider data:', error);
      localStorage.clear();
      window.location.href = '/rider/login';
    }
  }, []);

  const mapCenter = currentLocation || { lat: 19.0760, lng: 72.8777 };

  useEffect(() => {
    loadRiderData();
    requestLocationPermission();
    initializeSocket();

    return () => {
      if (socket) {
        socket.off('new-order-available');
        socket.disconnect();
      }
    };
  }, []);

  const initializeSocket = () => {
    if (!socket) {
      socket = io(config.SOCKET_URL || window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        setConnectionStatus('connected');
        const riderId = JSON.parse(localStorage.getItem('rider'))?._id;
        if (riderId) {
          socket.emit('rider-online', riderId);
        }
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        setConnectionStatus('disconnected');
      });

      socket.on('reconnecting', () => {
        setConnectionStatus('reconnecting');
      });

      socket.on('new-order-available', (orderData) => {
        console.log('🔔 NEW ORDER:', orderData);
        playNotificationSound();
        showBrowserNotification(orderData);
        setNewOrderAlert(orderData);
        loadOrders();
      });
    }

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const showBrowserNotification = (orderData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🚀 New Delivery Order!', {
        body: `₹${orderData.totalAmount} | ${orderData.items} items | ${orderData.city}`,
        icon: '/logo.png',
        badge: '/logo.png',
        requireInteraction: true,
        tag: 'new-order-' + orderData.orderId
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt');
      audio.play();
    } catch (e) {
      console.log('Sound play failed:', e);
    }

    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const loadRiderData = async () => {
    try {
      setLoading(true);
      const riderData = JSON.parse(localStorage.getItem('rider'));
      const token = localStorage.getItem('riderToken');

      if (!riderData || !token) {
        window.location.href = '/rider/login';
        return;
      }

      setRider(riderData);
      setIsAvailable(riderData.isAvailable || false);

      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rider/earnings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(data);
      await loadOrders();
    } catch (error) {
      console.error('Failed to load rider data:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/rider/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('riderToken');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rider/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ Extract orders array from response
      const ordersArray = data.orders || data || [];
      setOrders(ordersArray);

      // ✅ Find active order - includes 'preparing', 'shipped', and 'out_for_delivery'
      const active = ordersArray.find(o =>
        ['preparing', 'shipped', 'out_for_delivery'].includes(o.orderStatus) &&
        (o.rider?._id === rider?._id || o.rider === rider?._id)
      );

      if (active) {
        setActiveOrder(active);
        if (active.shippingAddress?.location) {
          calculateRoute(active);
        }
      } else {
        // ✅ Clear active order if none found
        setActiveOrder(null);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setLocationPermission('granted');
          updateLocationInterval();
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const updateLocationInterval = () => {
    setInterval(() => {
      if (navigator.geolocation && isAvailable) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(location);

            // ✅ Emit socket event if there's an active order
            if (activeOrder && (activeOrder.orderStatus === 'shipped' || activeOrder.orderStatus === 'out_for_delivery')) {
              if (socket) {
                socket.emit('update-location', {
                  orderId: activeOrder._id,
                  location: location,
                  heading: position.coords.heading || 0
                });
                console.log('📡 Sent location update for order:', activeOrder._id);
              }
            }

            try {
              const token = localStorage.getItem('riderToken');
              await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rider/location`,
                { location },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (error) {
              console.error('Location update failed:', error);
            }
          },
          null,
          { enableHighAccuracy: true }
        );
      }
    }, 10000); // 10 seconds interval
  };

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem('riderToken');
      const newStatus = !isAvailable;

      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rider/availability`,
        { isAvailable: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsAvailable(newStatus);

      const updatedRider = { ...rider, isAvailable: newStatus };
      localStorage.setItem('rider', JSON.stringify(updatedRider));
      setRider(updatedRider);

      if (newStatus) {
        socket?.emit('rider-online', rider._id);
        loadOrders();
      } else {
        socket?.emit('rider-offline', rider._id);
      }
    } catch (error) {
      console.error('Availability toggle failed:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('riderToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rider/orders/${orderId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Order accepted:', response.data);

      // Close the alert modal
      setNewOrderAlert(null);

      // Reload orders to update the UI
      await loadOrders();

      // Show success message
      alert('Order accepted successfully! You can now pick it up.');

    } catch (error) {
      console.error('Accept order failed:', error);
      alert(error.response?.data?.error || 'Failed to accept order');
    }
  };

  const calculateRoute = async (order) => {
    // Check if Google Maps is loaded
    if (!mapsLoaded || !window.google || !window.google.maps) {
      console.log('⏳ Google Maps not loaded yet, skipping route calculation');
      return;
    }

    if (!currentLocation) {
      console.log('⏳ Current location not available yet');
      return;
    }

    if (!order.shippingAddress?.location?.latitude || !order.shippingAddress?.location?.longitude) {
      console.log('⏳ Order location not available');
      return;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();

      const result = await directionsService.route({
        origin: currentLocation,
        destination: {
          lat: order.shippingAddress.location.latitude,
          lng: order.shippingAddress.location.longitude
        },
        travelMode: window.google.maps.TravelMode.DRIVING
      });

      setDirections(result);
      console.log('✅ Route calculated successfully');
    } catch (error) {
      console.error('❌ Route calculation failed:', error);
    }
  };

  const markPickedUp = async () => {
    if (!activeOrder) return;

    try {
      const token = localStorage.getItem('riderToken');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rider/orders/${activeOrder._id}/pickup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadOrders();
    } catch (error) {
      console.error('Pickup failed:', error);
      alert('Failed to mark as picked up');
    }
  };

  const markDelivered = async () => {
    if (!activeOrder) return;

    try {
      // First, generate OTP via API
      const token = localStorage.getItem('riderToken');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rider/orders/${activeOrder._id}/generate-otp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Then show OTP input modal
      setShowOTPModal(true);
      setOtpInput('');
      setOtpError('');
    } catch (error) {
      console.error('OTP generation failed:', error);
      alert('Failed to generate OTP. Please try again.');
    }
  };

  const verifyOTPAndDeliver = async () => {
    if (!activeOrder || !otpInput) {
      setOtpError('Please enter the OTP');
      return;
    }

    if (otpInput.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError('');

      const token = localStorage.getItem('riderToken');
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rider/orders/${activeOrder._id}/verify-delivery`,
        { otp: otpInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Success!
      alert('✅ Order delivered successfully!');
      setShowOTPModal(false);
      setActiveOrder(null);
      setDirections(null);

      // Reload orders list (without full page loading flash)
      await loadOrders();

      // Also refresh stats in the background
      try {
        const statsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rider/earnings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);
      } catch (e) { /* stats refresh is non-critical */ }

    } catch (error) {
      console.error('OTP verification failed:', error);
      const message = error.response?.data?.error || 'Invalid OTP. Please try again.';
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const logout = () => {
    if (socket) socket.disconnect();
    localStorage.removeItem('rider');
    localStorage.removeItem('riderToken');
    window.location.href = '/rider/login';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  if (!rider) return null;

  return (
    <div style={styles.container}>
      {/* NEW ORDER ALERT */}
      {newOrderAlert && (
        <div style={styles.alertOverlay} onClick={() => setNewOrderAlert(null)}>
          <div style={styles.alertBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.alertHeader}>
              <div style={styles.alertIcon}>🚀</div>
              <h2 style={styles.alertTitle}>New Delivery Request</h2>
            </div>

            <div style={styles.alertContent}>
              <div style={styles.alertRow}>
                <span style={styles.alertLabel}>Amount</span>
                <span style={styles.alertValue}>₹{newOrderAlert.totalAmount}</span>
              </div>
              <div style={styles.alertRow}>
                <span style={styles.alertLabel}>Items</span>
                <span style={styles.alertValue}>{newOrderAlert.items} items</span>
              </div>
              <div style={styles.alertRow}>
                <span style={styles.alertLabel}>Location</span>
                <span style={styles.alertValue}>{newOrderAlert.city}</span>
              </div>
            </div>

            <div style={styles.alertButtons}>
              <button
                style={{ ...styles.alertBtn, ...styles.acceptBtn }}
                onClick={() => acceptOrder(newOrderAlert.orderId)}
              >
                ✓ Accept Order
              </button>
              <button
                style={{ ...styles.alertBtn, ...styles.declineBtn }}
                onClick={() => setNewOrderAlert(null)}
              >
                ✕ Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP VERIFICATION MODAL */}
      {showOTPModal && (
        <div style={styles.otpOverlay} onClick={() => setShowOTPModal(false)}>
          <div style={styles.otpModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.otpHeader}>
              <div style={styles.otpIcon}>🔐</div>
              <h2 style={styles.otpTitle}>Enter Delivery OTP</h2>
              <p style={styles.otpSubtitle}>Ask customer for the 6-digit delivery code</p>
            </div>

            <div style={styles.otpInputContainer}>
              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                value={otpInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtpInput(value);
                  setOtpError('');
                }}
                style={styles.otpInput}
                placeholder="000000"
                autoFocus
              />
            </div>

            {otpError && (
              <div style={styles.otpError}>
                ❌ {otpError}
              </div>
            )}

            <div style={styles.otpButtons}>
              <button
                style={{ ...styles.otpBtn, ...styles.verifyBtn }}
                onClick={verifyOTPAndDeliver}
                disabled={otpLoading || otpInput.length !== 6}
              >
                {otpLoading ? 'Verifying...' : '✓ Verify & Deliver'}
              </button>
              <button
                style={{ ...styles.otpBtn, ...styles.cancelBtn }}
                onClick={() => setShowOTPModal(false)}
                disabled={otpLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Rider Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {rider.name}</p>
          <div style={styles.connectionBadge}>
            <span style={{
              ...styles.connectionDot,
              background: connectionStatus === 'connected' ? '#10b981' : '#ef4444'
            }}></span>
            {connectionStatus === 'connected' ? 'Connected' : 'Reconnecting...'}
          </div>
        </div>

        <div style={styles.headerRight}>
          <button
            style={{
              ...styles.statusBtn,
              background: isAvailable ? '#10b981' : '#8B8B8B'
            }}
            onClick={toggleAvailability}
          >
            <span style={styles.statusDot}></span>
            {isAvailable ? 'Online' : 'Offline'}
          </button>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* LOCATION PERMISSION WARNING */}
      {locationPermission === 'denied' && (
        <div style={styles.warningBanner}>
          <span>⚠️</span>
          <span>Location access denied. Please enable location to receive orders.</span>
          <button style={styles.enableBtn} onClick={requestLocationPermission}>
            Enable Location
          </button>
        </div>
      )}

      {/* STATS GRID */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>₹{stats.todayEarnings || 0}</div>
            <div style={styles.statLabel}>Today's Earnings</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📦</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.todayDeliveries || 0}</div>
            <div style={styles.statLabel}>Today's Deliveries</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>💵</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>₹{stats.weeklyEarnings || 0}</div>
            <div style={styles.statLabel}>This Week</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, position: 'relative' }}>
          <div style={styles.statIcon}>🚀</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{orders.filter(o => !o.rider).length}</div>
            <div style={styles.statLabel}>Available Orders</div>
          </div>
          {orders.filter(o => !o.rider).length > 0 && (
            <div style={styles.newBadge}>NEW</div>
          )}
        </div>
      </div>

      {/* ACTIVE ORDER SECTION */}
      {activeOrder && (
        <div style={styles.activeOrderSection}>
          <div style={styles.activeOrderHeader}>
            <h3 style={styles.activeOrderTitle}>🚚 Active Delivery</h3>
            <span style={styles.orderStatus}>{activeOrder.orderStatus}</span>
          </div>

          <div style={styles.activeOrderContent}>
            <div style={styles.orderInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Order ID</span>
                <span style={styles.infoValue}>#{activeOrder._id.slice(-8).toUpperCase()}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Amount</span>
                <span style={styles.infoValue}>₹{activeOrder.totalAmount}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Customer</span>
                <span style={styles.infoValue}>{activeOrder.shippingAddress?.name || 'N/A'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Phone</span>
                <span style={styles.infoValue}>
                  {activeOrder.shippingAddress?.phone ? (
                    <a href={`tel:${activeOrder.shippingAddress.phone}`} style={styles.phoneLink}>
                      {activeOrder.shippingAddress.phone}
                    </a>
                  ) : 'N/A'}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Address</span>
                <span style={styles.infoValue}>
                  {activeOrder.shippingAddress?.street || 'N/A'}, {activeOrder.shippingAddress?.city || 'N/A'}
                </span>
              </div>
            </div>

            <div style={styles.orderActions}>
              {activeOrder.orderStatus === 'preparing' && (
                <button style={{ ...styles.actionBtn, ...styles.pickupBtn }} onClick={markPickedUp}>
                  📦 Mark as Picked Up
                </button>
              )}
              {(activeOrder.orderStatus === 'shipped' || activeOrder.orderStatus === 'out_for_delivery') && activeOrder.orderStatus !== 'delivered' && (
                <button style={{ ...styles.actionBtn, ...styles.deliverBtn }} onClick={markDelivered}>
                  ✓ Mark as Delivered
                </button>
              )}
              {activeOrder.orderStatus === 'delivered' && (
                <div style={{ padding: '1rem', background: '#10b981', color: '#FFFFFF', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ✅ Delivery Completed
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAP */}
      {locationPermission === 'granted' && (
        <div style={styles.mapSection}>
          <h3 style={styles.sectionTitle}>📍 Live Location</h3>
          <LoadScript
            googleMapsApiKey="AIzaSyBxYHyG4YD4aNXR84uRcTZQdX6XvxJwxYk"
            onLoad={() => {
              console.log('✅ Google Maps loaded');
              setMapsLoaded(true);
            }}
            onError={(error) => {
              console.error('❌ Google Maps load error:', error);
            }}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={14}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false
              }}
            >
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  }}
                  title="Your Location"
                />
              )}
              {activeOrder?.shippingAddress?.location && (
                <Marker
                  position={{
                    lat: activeOrder.shippingAddress.location.latitude,
                    lng: activeOrder.shippingAddress.location.longitude
                  }}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  }}
                  title="Delivery Location"
                />
              )}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </LoadScript>
        </div>
      )}

      {/* AVAILABLE ORDERS */}
      <div style={styles.ordersSection}>
        <h3 style={styles.sectionTitle}>📦 Available Orders</h3>

        {!isAvailable ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔴</div>
            <p style={styles.emptyText}>You're currently offline</p>
            <p style={styles.emptySubtext}>Go online to see and accept orders</p>
            <button style={styles.goOnlineBtn} onClick={toggleAvailability}>
              Go Online
            </button>
          </div>
        ) : orders.filter(o => !o.rider).length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⏳</div>
            <p style={styles.emptyText}>No orders available</p>
            <p style={styles.emptySubtext}>You'll be notified when new orders arrive</p>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {orders.filter(o => !o.rider).map(order => (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderCardHeader}>
                  <span style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                  <span style={styles.orderAmount}>₹{order.totalAmount}</span>
                </div>
                <div style={styles.orderCardBody}>
                  <div style={styles.orderDetail}>
                    <span style={styles.orderDetailLabel}>Items:</span>
                    <span style={styles.orderDetailValue}>{order.items?.length || 0} items</span>
                  </div>
                  <div style={styles.orderDetail}>
                    <span style={styles.orderDetailLabel}>Location:</span>
                    <span style={styles.orderDetailValue}>{order.shippingAddress?.city}</span>
                  </div>
                  <div style={styles.orderDetail}>
                    <span style={styles.orderDetailLabel}>Distance:</span>
                    <span style={styles.orderDetailValue}>~2.5 km</span>
                  </div>
                </div>
                <button
                  style={styles.acceptOrderBtn}
                  onClick={() => acceptOrder(order._id)}
                >
                  Accept Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Map styling
const mapStyles = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#F8F7F5' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#E5E2DD' }]
  }
];

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#FFFFFF'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #F0EDE8',
    borderTop: '3px solid #1A1A1A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '1rem',
    color: '#8B8B8B',
    fontSize: '0.875rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem',
    borderBottom: '1px solid #E5E2DD',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '300',
    color: '#1A1A1A',
    margin: 0,
    letterSpacing: '0.5px'
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: '#8B8B8B',
    margin: '0.5rem 0'
  },
  connectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#5A5A5A',
    marginTop: '0.5rem'
  },
  connectionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  headerRight: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  statusBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0',
    color: '#FFFFFF',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'opacity 0.2s'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#FFFFFF',
    animation: 'pulse 2s infinite'
  },
  logoutBtn: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: '1px solid #E5E2DD',
    color: '#5A5A5A',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  warningBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 2rem',
    background: '#FEF3C7',
    borderBottom: '1px solid #FCD34D',
    fontSize: '0.875rem',
    color: '#92400E'
  },
  enableBtn: {
    marginLeft: 'auto',
    padding: '0.5rem 1rem',
    background: '#92400E',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.8125rem',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    padding: '2rem',
    gap: '1.5rem'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: '#F8F7F5',
    border: '1px solid #E5E2DD'
  },
  statIcon: {
    fontSize: '2.5rem'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#1A1A1A'
  },
  statLabel: {
    fontSize: '0.8125rem',
    color: '#8B8B8B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '0.25rem'
  },
  newBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '0.25rem 0.75rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: '0.625rem',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  activeOrderSection: {
    margin: '0 2rem 2rem',
    background: '#F0EDE8',
    border: '2px solid #1A1A1A'
  },
  activeOrderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #E5E2DD'
  },
  activeOrderTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: 0
  },
  orderStatus: {
    padding: '0.5rem 1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  activeOrderContent: {
    padding: '1.5rem'
  },
  orderInfo: {
    marginBottom: '1.5rem'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid #E5E2DD'
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '0.9375rem',
    color: '#1A1A1A',
    fontWeight: '400'
  },
  phoneLink: {
    color: '#1A1A1A',
    textDecoration: 'underline'
  },
  orderActions: {
    display: 'flex',
    gap: '1rem'
  },
  actionBtn: {
    flex: 1,
    padding: '1rem',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  pickupBtn: {
    background: '#8B7355'
  },
  deliverBtn: {
    background: '#1A1A1A'
  },
  mapSection: {
    margin: '0 2rem 2rem'
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  ordersSection: {
    padding: '0 2rem 2rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#F8F7F5'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyText: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: '0.5rem 0'
  },
  emptySubtext: {
    fontSize: '0.875rem',
    color: '#8B8B8B'
  },
  goOnlineBtn: {
    marginTop: '1.5rem',
    padding: '1rem 2rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  ordersList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  orderCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E2DD',
    padding: '1.5rem'
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #E5E2DD'
  },
  orderId: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    fontWeight: '500',
    letterSpacing: '0.5px'
  },
  orderAmount: {
    fontSize: '1.25rem',
    fontWeight: '400',
    color: '#1A1A1A'
  },
  orderCardBody: {
    marginBottom: '1.5rem'
  },
  orderDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.875rem'
  },
  orderDetailLabel: {
    color: '#8B8B8B'
  },
  orderDetailValue: {
    color: '#1A1A1A',
    fontWeight: '400'
  },
  acceptOrderBtn: {
    width: '100%',
    padding: '1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  alertOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)'
  },
  alertBox: {
    background: '#FFFFFF',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
  },
  alertHeader: {
    padding: '2rem',
    borderBottom: '1px solid #E5E2DD',
    textAlign: 'center'
  },
  alertIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  alertTitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#1A1A1A',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  alertContent: {
    padding: '2rem'
  },
  alertRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0',
    borderBottom: '1px solid #F0EDE8'
  },
  alertLabel: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  alertValue: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#1A1A1A'
  },
  alertButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderTop: '1px solid #E5E2DD'
  },
  alertBtn: {
    padding: '1.25rem',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  acceptBtn: {
    background: '#1A1A1A',
    color: '#FFFFFF',
    borderRight: '1px solid #E5E2DD'
  },
  declineBtn: {
    background: '#FFFFFF',
    color: '#5A5A5A'
  },
  // OTP Modal Styles
  otpOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  },
  otpModal: {
    background: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.3s ease-out'
  },
  otpHeader: {
    textAlign: 'center',
    padding: '2rem 1.5rem 1rem',
    borderBottom: '1px solid #E5E2DD'
  },
  otpIcon: {
    fontSize: '3rem',
    marginBottom: '0.5rem'
  },
  otpTitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    margin: '0 0 0.5rem',
    color: '#1A1A1A'
  },
  otpSubtitle: {
    fontSize: '0.875rem',
    color: '#8B8B8B',
    margin: 0
  },
  otpInputContainer: {
    padding: '2rem 1.5rem'
  },
  otpInput: {
    width: '100%',
    padding: '1.5rem',
    fontSize: '2rem',
    textAlign: 'center',
    letterSpacing: '1rem',
    border: '2px solid #E5E2DD',
    borderRadius: '8px',
    outline: 'none',
    fontWeight: '600',
    color: '#1A1A1A'
  },
  otpError: {
    padding: '0 1.5rem 1rem',
    color: '#ef4444',
    fontSize: '0.875rem',
    textAlign: 'center',
    fontWeight: '500'
  },
  otpButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderTop: '1px solid #E5E2DD'
  },
  otpBtn: {
    padding: '1.25rem',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'opacity 0.2s'
  },
  verifyBtn: {
    background: '#10b981',
    color: 'white',
    borderRight: '1px solid #E5E2DD'
  },
  cancelBtn: {
    background: '#FFFFFF',
    color: '#5A5A5A'
  }
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  input:focus {
    border-color: #10b981 !important;
  }
  button:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }
`;
document.head.appendChild(styleSheet);

export default RiderDashboard;
