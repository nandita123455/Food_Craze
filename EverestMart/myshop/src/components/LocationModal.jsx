import { useState, useEffect, useRef } from 'react';
import { reverseGeocode, loadGoogleMapsScript } from '../utils/googlePlaces';

function LocationModal({ isOpen, onClose }) {
    const [tab, setTab] = useState('detect'); // 'detect' or 'manual'
    const [pincode, setPincode] = useState('');
    const [area, setArea] = useState('');
    const [detecting, setDetecting] = useState(false);
    const areaInputRef = useRef(null);
    const autocompleteRef = useRef(null);

    // Load Google Maps script when modal opens
    useEffect(() => {
        if (isOpen) {
            loadGoogleMapsScript()
                .then(() => console.log('✅ Google Maps loaded'))
                .catch((err) => console.error('❌ Google Maps load failed:', err));
        }
    }, [isOpen]);

    // Initialize autocomplete when switching to manual tab
    useEffect(() => {
        if (tab === 'manual' && areaInputRef.current && window.google) {
            try {
                // Initialize Places Autocomplete
                autocompleteRef.current = new window.google.maps.places.Autocomplete(
                    areaInputRef.current,
                    {
                        componentRestrictions: { country: 'in' }, // India only
                        fields: ['formatted_address', 'address_components', 'geometry']
                    }
                );

                // Listen for place selection
                autocompleteRef.current.addListener('place_changed', () => {
                    const place = autocompleteRef.current.getPlace();
                    if (place.formatted_address) {
                        setArea(place.formatted_address);
                        console.log('📍 Place selected:', place.formatted_address);
                    }
                });

                console.log('✅ Autocomplete initialized');
            } catch (_error) {
                console.error('Autocomplete error:', error);
            }
        }
    }, [tab]);

    if (!isOpen) return null;

    const handleDetectLocation = () => {
        setDetecting(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('📍 GPS detected:', position.coords);

                    // Save GPS coordinates
                    localStorage.setItem('deliveryCoords', JSON.stringify({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }));

                    setDetecting(false);
                    setTab('manual');

                    // Ask user to enter their actual area
                    alert(`GPS location detected!\n\nCoordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}\n\nPlease enter your area name below (e.g., Pochampally, Tamil Nadu)`);
                },
                (error) => {
                    alert('Could not detect location. Please enter manually.');
                    setDetecting(false);
                    setTab('manual');
                }
            );
        } else {
            alert('Geolocation not supported');
            setDetecting(false);
            setTab('manual');
        }
    };

    const handleManualSubmit = () => {
        // Area is more important than pincode
        if (!area && !pincode) {
            alert('Please enter your area name or pincode');
            return;
        }

        if (pincode && pincode.length !== 6) {
            alert('Pincode should be 6 digits (or leave blank and enter area only)');
            return;
        }

        const location = area || `Pincode ${pincode}`;
        localStorage.setItem('deliveryLocation', location);
        console.log('✅ Location saved:', location);
        onClose(location);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={styles.backdrop}
                onClick={onClose}
            />

            {/* Modal */}
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Select Delivery Location</h2>
                    <button
                        style={styles.closeBtn}
                        onClick={onClose}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(tab === 'detect' ? styles.activeTab : {}) }}
                        onClick={() => setTab('detect')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                        </svg>
                        Detect Location
                    </button>
                    <button
                        style={{ ...styles.tab, ...(tab === 'manual' ? styles.activeTab : {}) }}
                        onClick={() => setTab('manual')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 13l-1-1 1-1 1 1-1 1zm0-4V7m0 11a9 9 0 110-18 9 9 0 010 18z" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                        Enter  Manually
                    </button>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {tab === 'detect' ? (
                        <div style={styles.detectSection}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={styles.locationIcon}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#059669" strokeWidth="2" fill="none" />
                                <circle cx="12" cy="10" r="3" stroke="#059669" strokeWidth="2" fill="none" />
                            </svg>
                            <h3 style={styles.detectTitle}>Use my current location</h3>
                            <p style={styles.detectText}>
                                We'll automatically detect your location to show available products
                            </p>
                            <button
                                style={styles.detectBtn}
                                onClick={handleDetectLocation}
                                disabled={detecting}
                                onMouseEnter={(e) => !detecting && (e.currentTarget.style.background = '#047857')}
                                onMouseLeave={(e) => !detecting && (e.currentTarget.style.background = '#059669')}
                            >
                                {detecting ? 'Detecting...' : 'Detect Location'}
                            </button>
                        </div>
                    ) : (
                        <div style={styles.manualSection}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Pincode</label>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit pincode"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    style={styles.input}
                                    maxLength={6}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Area Name</label>
                                <input
                                    ref={areaInputRef}
                                    type="text"
                                    placeholder="Start typing your area..."
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            <button
                                style={styles.submitBtn}
                                onClick={handleManualSubmit}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#059669'}
                            >
                                Confirm Location
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

const styles = {
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        backdropFilter: 'blur(4px)'
    },
    modal: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '500px',
        width: '90%',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        maxHeight: '90vh',
        overflow: 'auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        borderBottom: '1px solid #E5E7EB'
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#111827',
        margin: 0
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        fontSize: '1.5rem',
        color: '#6B7280',
        cursor: 'pointer',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s'
    },
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #E5E7EB'
    },
    tab: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: '#F9FAFB',
        border: '2px solid transparent',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#6B7280',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    activeTab: {
        background: '#ECFDF5',
        borderColor: '#059669',
        color: '#059669'
    },
    content: {
        padding: '2rem 1.5rem'
    },
    detectSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
    },
    locationIcon: {
        marginBottom: '1.5rem'
    },
    detectTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '0.5rem'
    },
    detectText: {
        fontSize: '0.875rem',
        color: '#6B7280',
        marginBottom: '2rem',
        lineHeight: '1.6'
    },
    detectBtn: {
        width: '100%',
        padding: '0.875rem 2rem',
        background: '#059669',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    manualSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151'
    },
    input: {
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        border: '2px solid #E5E7EB',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit'
    },
    submitBtn: {
        width: '100%',
        padding: '0.875rem 2rem',
        background: '#059669',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s'
    }
};

export default LocationModal;
