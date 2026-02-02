import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddNewForm, setShowAddNewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const autocompleteRef = useRef(null);

  const FREE_DELIVERY_THRESHOLD = 250;

  // ✅ Extract addresses from any response format
  const extractAddressesFromResponse = (responseData) => {
    console.log('🔍 Extracting addresses from:', responseData);
    
    if (Array.isArray(responseData)) {
      console.log('✅ Format: Direct array');
      return responseData;
    }
    
    if (responseData.addresses && Array.isArray(responseData.addresses)) {
      console.log('✅ Format: Nested in addresses');
      return responseData.addresses;
    }
    
    if (responseData.data && Array.isArray(responseData.data)) {
      console.log('✅ Format: Nested in data');
      return responseData.data;
    }
    
    console.warn('⚠️ Unknown format, returning empty array');
    return [];
  };

  // ✅ Load cart and listen for updates
  useEffect(() => {
    loadCartFromStorage();
    
    const handleCartUpdate = () => {
      console.log('🔄 Cart updated event received in Checkout');
      loadCartFromStorage();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [navigate]);

  // ✅ Load cart from localStorage
  const loadCartFromStorage = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      console.log('📦 Loading cart in Checkout:', cart.length, 'items');
      
      if (cart.length === 0) {
        console.log('⚠️ Cart is empty, redirecting...');
        navigate('/cart');
        return;
      }
      
      setCartItems(cart);
    } catch (error) {
      console.error('Failed to load cart:', error);
      navigate('/cart');
    }
  };

  // ✅ Load user data and Google Maps
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }

    loadGoogleMapsScript();
  }, []);

  // ✅ Load saved addresses
  useEffect(() => {
    loadSavedAddresses();
  }, []);

  // ✅ Load Google Maps Script
  const loadGoogleMapsScript = () => {
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps already loaded');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE.mapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => console.log('✅ Google Maps loaded');
    script.onerror = () => console.error('❌ Failed to load Google Maps');
    document.head.appendChild(script);
  };

  // ✅ Load saved addresses from backend
  const loadSavedAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token - guest checkout');
        return;
      }
      
      console.log('📍 [Checkout] Loading addresses...');
      console.log('API URL:', `${config.API_BASE_URL}/addresses`);
      
      const response = await axios.get(`${config.API_BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📦 [Checkout] Full response:', response.data);

      const addressList = extractAddressesFromResponse(response.data);
      
      console.log('📍 [Checkout] Extracted addresses:', addressList);
      console.log('📊 [Checkout] Count:', addressList.length);
      
      setAddresses(addressList);
      
      if (addressList.length === 0) {
        console.log('⚠️ No addresses found');
        return;
      }

      // Auto-select last used or default
      const lastUsedId = localStorage.getItem('lastUsedAddressId');
      let selectedAddr = null;

      if (lastUsedId) {
        selectedAddr = addressList.find(addr => addr._id === lastUsedId);
        if (selectedAddr) {
          console.log('📍 Auto-selecting last used:', selectedAddr.label);
        }
      }

      if (!selectedAddr) {
        selectedAddr = addressList.find(addr => addr.isDefault);
        if (selectedAddr) {
          console.log('📍 Auto-selecting default:', selectedAddr.label);
        }
      }

      if (selectedAddr) {
        setSelectedAddressId(selectedAddr._id);
        setFormData(prev => ({
          ...prev,
          name: selectedAddr.fullName || prev.name,
          phone: selectedAddr.phone || prev.phone,
          address: selectedAddr.addressLine1,
          city: selectedAddr.city,
          state: selectedAddr.state || '',
          pincode: selectedAddr.pincode
        }));
      }
    } catch (error) {
      console.error('❌ [Checkout] Failed to load addresses:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  // ✅ GPS Auto-Detection
  const detectCurrentLocation = () => {
    setDetectingLocation(true);
    
    if (!navigator.geolocation) {
      alert('❌ Geolocation is not supported by your browser');
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 GPS Location:', latitude, longitude);
        
        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlat=${latitude},${longitude}&key=${config.GOOGLE.mapsApiKey}`
          );

          if (response.data.results[0]) {
            const addressComponents = response.data.results[0].address_components;
            const extractedAddress = extractAddressFromComponents(addressComponents);

            setFormData(prev => ({
              ...prev,
              address: extractedAddress.street || response.data.results[0].formatted_address,
              city: extractedAddress.city,
              state: extractedAddress.state,
              pincode: extractedAddress.pincode
            }));

            setSelectedAddressId(null);
            setShowAddNewForm(true);

            alert(
              `✅ Location Detected!\n\n` +
              `${extractedAddress.street}\n` +
              `${extractedAddress.city}, ${extractedAddress.state} - ${extractedAddress.pincode}`
            );
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          alert('⚠️ Location detected but could not fetch address. Please enter manually.');
        }
        
        setDetectingLocation(false);
      },
      (error) => {
        let errorMsg = '❌ Location Error: ';
        if (error.code === 1) errorMsg += 'Please enable location permission';
        else if (error.code === 2) errorMsg += 'Location unavailable';
        else errorMsg += 'Request timeout';
        
        alert(errorMsg);
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // ✅ Extract address from Google Maps components
  const extractAddressFromComponents = (components) => {
    let street = '';
    let city = '';
    let state = '';
    let pincode = '';

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('route') || types.includes('sublocality_level_2')) {
        street += (street ? ', ' : '') + component.long_name;
      }
      if (types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      if (types.includes('postal_code')) {
        pincode = component.long_name;
      }
    });

    return { street, city, state, pincode };
  };

  // ✅ Initialize Google Places Autocomplete
  const initAutocomplete = (input) => {
    if (!window.google || !window.google.maps || !input) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: ['in', 'np'] },
        fields: ['address_components', 'geometry', 'formatted_address']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const addressComponents = place.address_components;
        const extractedAddress = extractAddressFromComponents(addressComponents);

        setFormData(prev => ({
          ...prev,
          address: extractedAddress.street || place.formatted_address,
          city: extractedAddress.city,
          state: extractedAddress.state,
          pincode: extractedAddress.pincode
        }));

        setSelectedAddressId(null);
      });

      autocompleteRef.current = autocomplete;
      console.log('✅ Autocomplete initialized');
    } catch (error) {
      console.error('Failed to initialize autocomplete:', error);
    }
  };

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Calculate totals
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getDeliveryCharges = () => {
    const total = getTotalPrice();
    return total >= FREE_DELIVERY_THRESHOLD ? 0 : 40;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getDeliveryCharges();
  };

  // ✅ Save manually entered address
  const saveManualAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Guest checkout - return simple object
      if (!token) {
        console.log('⚠️ Guest checkout - address not saved');
        return {
          name: formData.name,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.pincode
        };
      }

      // Logged-in user - save to database
      console.log('💾 Saving address to database...');
      
      const addressData = {
        label: 'Home',
        fullName: formData.name,
        phone: formData.phone,
        addressLine1: formData.address,
        addressLine2: '',
        landmark: '',
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        isDefault: addresses.length === 0
      };

      console.log('📝 Address data:', addressData);

      const response = await axios.post(
        `${config.API_BASE_URL}/addresses`,
        addressData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('✅ Address save response:', response.data);

      const savedAddress = response.data.address || response.data;
      const newAddressId = savedAddress._id;
      
      if (!newAddressId) {
        throw new Error('No address ID returned');
      }

      console.log('✅ Address saved with ID:', newAddressId);
      
      // Reload addresses
      await loadSavedAddresses();
      
      return { _id: newAddressId };
      
    } catch (error) {
      console.error('❌ Failed to save address:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.message || 
                       'Failed to save address';
      
      alert(`⚠️ Address Save Warning\n\n${errorMsg}\n\nOrder will continue, but address won't be saved for reuse.`);
      
      // Return simple object so order can proceed
      return {
        name: formData.name,
        phone: formData.phone,
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.pincode
      };
    }
  };

  // ✅ Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting || loading) {
      console.warn('⚠️ Order already being placed...');
      return;
    }

    setLoading(true);
    setSubmitting(true);

    try {
      // Re-check cart
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (currentCart.length === 0) {
        alert('❌ Your cart is empty!');
        navigate('/cart');
        return;
      }

      console.log('📦 Starting order placement...');

      let shippingAddress;
      let savedAddressId = null;

      // SCENARIO 1: User selected saved address
      if (selectedAddressId) {
        console.log('✅ Using saved address:', selectedAddressId);
        shippingAddress = { _id: selectedAddressId };
        savedAddressId = selectedAddressId;
      } 
      // SCENARIO 2: User entered new address
      else {
        // Validate fields
        if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
          alert('❌ Please fill all address fields:\n• Address/Street\n• City\n• State\n• Pincode');
          setLoading(false);
          setSubmitting(false);
          return;
        }

        console.log('📝 Saving new address...');
        shippingAddress = await saveManualAddress();
        savedAddressId = shippingAddress._id || null;
      }

      // Save last used address
      if (savedAddressId) {
        localStorage.setItem('lastUsedAddressId', savedAddressId);
        console.log('💾 Saved lastUsedAddressId:', savedAddressId);
      }

      // Prepare order
      const orderPayload = {
        items: currentCart.map(item => ({
          productId: item._id,
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: shippingAddress,
        totalAmount: currentCart.reduce((total, item) => total + (item.price * item.quantity), 0),
        deliveryCharges: getDeliveryCharges(),
        paymentMethod: formData.paymentMethod.toUpperCase() === 'COD' ? 'COD' : 'ONLINE'
      };

      console.log('📦 Order payload:', orderPayload);

      // Create order
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_BASE_URL}/orders`,
        orderPayload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 15000
        }
      );

      console.log('✅ Order created:', response.data);

      if (response.data.success || response.data.order) {
        console.log('🗑️ Clearing cart...');
        
        // Clear cart
        localStorage.removeItem('cart');
        localStorage.setItem('cart', JSON.stringify([]));
        setCartItems([]);
        
        // Dispatch events
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('storage'));
        
        setTimeout(() => {
          window.dispatchEvent(new Event('cartUpdated'));
        }, 100);

        const order = response.data.order;
        const orderId = order?._id?.slice(-8).toUpperCase() || 'PENDING';

        // ✅ FIXED: Don't show OTP to customer
        alert(
          `✅ Order Placed Successfully!\n\n` +
          `Order ID: #${orderId}\n` +
          `${savedAddressId ? '📍 Address saved for reuse!\n' : ''}` +
          `\n🚚 Your order will be delivered in 10 minutes!\n` +
          `\n💡 Track your order in "My Orders" section.`
        );

        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 500);

      } else {
        throw new Error('Order creation failed');
      }

    } catch (error) {
      console.error('❌ Order error:', error);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.error || 
                       error.response.data?.message ||
                       `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Check internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      }

      alert(`❌ Order Error\n\n${errorMessage}`);

    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Checkout</h1>

        <div style={styles.grid}>
          {/* Left Column - Form */}
          <div style={styles.formSection}>
            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Contact Information</h2>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    pattern="[0-9]{10}"
                    title="10-digit phone number"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Delivery Address</h2>

                {/* GPS Button */}
                <button
                  type="button"
                  onClick={detectCurrentLocation}
                  disabled={detectingLocation || loading}
                  style={{
                    ...styles.gpsBtn,
                    ...(detectingLocation ? styles.gpsButtonLoading : {})
                  }}
                >
                  {detectingLocation ? '⏳ Detecting Location...' : '📍 Use My Current Location (GPS)'}
                </button>

                {/* Saved Addresses */}
                {addresses.length > 0 && !showAddNewForm && (
                  <div style={styles.savedAddresses}>
                    <h3 style={styles.subsectionTitle}>Your Saved Addresses</h3>
                    {addresses.map(address => (
                      <div
                        key={address._id}
                        onClick={() => {
                          if (loading) return;
                          setSelectedAddressId(address._id);
                          setFormData(prev => ({
                            ...prev,
                            name: address.fullName || prev.name,
                            phone: address.phone || prev.phone,
                            address: address.addressLine1,
                            city: address.city,
                            state: address.state || '',
                            pincode: address.pincode
                          }));
                        }}
                        style={{
                          ...styles.addressCard,
                          ...(selectedAddressId === address._id ? styles.addressCardSelected : {}),
                          ...(loading ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                        }}
                      >
                        <div style={styles.addressHeader}>
                          <span style={styles.addressLabel}>
                            {address.label === 'Home' ? '🏠' : address.label === 'Work' ? '💼' : '📍'} 
                            {' '}{address.label}
                          </span>
                          {address.isDefault && <span style={styles.defaultBadge}>Default</span>}
                          {selectedAddressId === address._id && <span style={styles.selectedBadge}>✓ Selected</span>}
                        </div>
                        <p style={styles.addressDetails}>
                          <strong>{address.fullName}</strong> • {address.phone}
                        </p>
                        <p style={styles.addressDetails}>
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </p>
                        <p style={styles.addressDetails}>
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setShowAddNewForm(true);
                        setSelectedAddressId(null);
                      }}
                      style={styles.addAddressBtn}
                      disabled={loading}
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {/* Manual Address Form */}
                {(showAddNewForm || addresses.length === 0) && (
                  <>
                    {addresses.length > 0 && (
                      <div style={styles.divider}>
                        <hr style={styles.dividerLine} />
                        <span style={styles.dividerText}>ADD NEW ADDRESS</span>
                        <hr style={styles.dividerLine} />
                      </div>
                    )}

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Search Address (Google)</label>
                      <input
                        ref={(input) => input && initAutocomplete(input)}
                        type="text"
                        placeholder="Search for area, street..."
                        style={styles.input}
                        disabled={loading}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Address / Street *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={(e) => {
                          handleChange(e);
                          if (selectedAddressId) setSelectedAddressId(null);
                        }}
                        style={styles.textarea}
                        rows="3"
                        required
                        placeholder="House no., Street, Area"
                        disabled={loading}
                      />
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={(e) => {
                            handleChange(e);
                            if (selectedAddressId) setSelectedAddressId(null);
                          }}
                          style={styles.input}
                          required
                          disabled={loading}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={(e) => {
                            handleChange(e);
                            if (selectedAddressId) setSelectedAddressId(null);
                          }}
                          style={styles.input}
                          required
                          placeholder="e.g., Tamil Nadu"
                          disabled={loading}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={(e) => {
                            handleChange(e);
                            if (selectedAddressId) setSelectedAddressId(null);
                          }}
                          style={styles.input}
                          required
                          pattern="[0-9]{6}"
                          title="6-digit pincode"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddNewForm(false);
                          loadSavedAddresses();
                        }}
                        style={styles.backToSavedBtn}
                        disabled={loading}
                      >
                        ← Back to Saved Addresses
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Payment Method */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Payment Method</h2>

                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      style={styles.radio}
                      disabled={loading}
                    />
                    <div>
                      <span style={styles.radioText}>💵 Cash on Delivery</span>
                      <p style={styles.radioDesc}>Pay when order arrives</p>
                    </div>
                  </label>

                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleChange}
                      style={styles.radio}
                      disabled
                    />
                    <div>
                      <span style={styles.radioText}>💳 Online Payment</span>
                      <p style={styles.radioDesc}>Coming Soon</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  ...(loading ? styles.submitBtnDisabled : {})
                }}
                disabled={loading || submitting}
              >
                {loading ? '⏳ Placing Order...' : `🚀 Place Order - ₹${getFinalTotal()}`}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div style={styles.summarySection}>
            <div style={styles.summaryCard}>
              <h2 style={styles.summaryTitle}>Order Summary</h2>

              <div style={styles.summaryItems}>
                {cartItems.map((item) => (
                  <div key={item._id} style={styles.summaryItem}>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                      alt={item.name}
                      style={styles.summaryItemImage}
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                    />
                    <div style={styles.itemInfo}>
                      <span style={styles.itemName}>{item.name}</span>
                      <span style={styles.itemQty}>Qty: {item.quantity}</span>
                    </div>
                    <span style={styles.itemPrice}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={styles.summaryDivider}></div>

              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal ({getTotalItems()} items)</span>
                <span style={styles.summaryValue}>₹{getTotalPrice()}</span>
              </div>

              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Delivery Charges</span>
                {getDeliveryCharges() === 0 ? (
                  <span style={styles.deliveryFree}>FREE 🎉</span>
                ) : (
                  <span style={styles.summaryValue}>₹{getDeliveryCharges()}</span>
                )}
              </div>

              {getTotalPrice() < FREE_DELIVERY_THRESHOLD && (
                <div style={styles.deliveryHint}>
                  💡 Add ₹{FREE_DELIVERY_THRESHOLD - getTotalPrice()} more for FREE delivery!
                </div>
              )}

              <div style={styles.summaryDivider}></div>

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalValue}>₹{getFinalTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    padding: '2rem'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: '2rem',
    letterSpacing: '0.5px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '3rem'
  },
  formSection: {},
  section: {
    marginBottom: '2.5rem'
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '1.5rem',
    letterSpacing: '0.3px'
  },
  formGroup: {
    marginBottom: '1.25rem',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#5A5A5A',
    marginBottom: '0.5rem',
    letterSpacing: '0.2px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    fontSize: '0.9375rem',
    border: '1px solid #E5E2DD',
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#1A1A1A',
    transition: 'border-color 0.2s'
  },
  textarea: {
    width: '100%',
    padding: '0.875rem',
    fontSize: '0.9375rem',
    border: '1px solid #E5E2DD',
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#1A1A1A',
    resize: 'vertical'
  },
  gpsBtn: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    borderRadius: '6px',
    letterSpacing: '0.3px',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },
  gpsButtonLoading: {
    background: '#8B8B8B',
    cursor: 'not-allowed'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    cursor: 'pointer',
    padding: '1rem',
    border: '1px solid #E5E2DD',
    borderRadius: '6px',
    transition: 'border-color 0.2s'
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    marginTop: '2px'
  },
  radioText: {
    fontSize: '0.9375rem',
    color: '#1A1A1A',
    fontWeight: '500'
  },
  radioDesc: {
    fontSize: '0.8125rem',
    color: '#8B8B8B',
    margin: '0.25rem 0 0 0'
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.9375rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderRadius: '6px'
  },
  submitBtnDisabled: {
    background: '#8B8B8B',
    cursor: 'not-allowed'
  },
  summarySection: {
    position: 'sticky',
    top: '2rem',
    alignSelf: 'start'
  },
  summaryCard: {
    background: '#F8F7F5',
    padding: '2rem',
    borderRadius: '8px'
  },
  summaryTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '1.5rem',
    letterSpacing: '0.3px'
  },
  summaryItems: {
    marginBottom: '1.5rem'
  },
  summaryItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  },
  summaryItemImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #E5E2DD'
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1
  },
  itemName: {
    fontSize: '0.9375rem',
    color: '#1A1A1A'
  },
  itemQty: {
    fontSize: '0.8125rem',
    color: '#8B8B8B'
  },
  itemPrice: {
    fontSize: '0.9375rem',
    color: '#1A1A1A',
    fontWeight: '500'
  },
  summaryDivider: {
    height: '1px',
    background: '#E5E2DD',
    margin: '1.5rem 0'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  },
  summaryLabel: {
    fontSize: '0.9375rem',
    color: '#5A5A5A'
  },
  summaryValue: {
    fontSize: '0.9375rem',
    color: '#1A1A1A'
  },
  deliveryFree: {
    fontSize: '0.9375rem',
    color: '#10b981',
    fontWeight: '700'
  },
  deliveryHint: {
    background: '#FFF3CD',
    color: '#856404',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    marginTop: '0.5rem',
    marginBottom: '1rem',
    fontWeight: '500',
    textAlign: 'center'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem'
  },
  totalLabel: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A'
  },
  totalValue: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1A1A1A'
  },
  savedAddresses: {
    marginBottom: '2rem'
  },
  subsectionTitle: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: '1rem'
  },
  addressCard: {
    padding: '1rem',
    border: '2px solid #E5E2DD',
    borderRadius: '8px',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  addressCardSelected: {
    borderColor: '#2563eb',
    background: '#f0f9ff'
  },
  addressHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem'
  },
  addressLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1A1A1A'
  },
  defaultBadge: {
    fontSize: '0.7rem',
    background: '#10b981',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontWeight: '600'
  },
  selectedBadge: {
    fontSize: '0.7rem',
    background: '#2563eb',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontWeight: '600'
  },
  addressDetails: {
    fontSize: '0.85rem',
    color: '#6b7280',
    margin: '0.25rem 0',
    lineHeight: '1.5'
  },
  addAddressBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'transparent',
    border: '2px dashed #E5E2DD',
    borderRadius: '8px',
    color: '#2563eb',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  backToSavedBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'transparent',
    border: '1px solid #E5E2DD',
    borderRadius: '6px',
    color: '#5A5A5A',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'all 0.2s'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '2rem 0 1.5rem'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#E5E2DD',
    border: 'none'
  },
  dividerText: {
    fontSize: '0.75rem',
    color: '#6b7280',
    whiteSpace: 'nowrap',
    fontWeight: '500'
  }
};

export default Checkout;
