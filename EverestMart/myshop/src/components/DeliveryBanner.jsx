import { useState, useEffect } from 'react';

function DeliveryBanner({ onLocationClick }) {
    const [location, setLocation] = useState(
        localStorage.getItem('deliveryLocation') || 'Select your location'
    );

    // Listen for location updates
    useEffect(() => {
        const updateLocation = () => {
            const newLocation = localStorage.getItem('deliveryLocation') || 'Select your location';
            setLocation(newLocation);
            console.log('📍 Delivery banner updated:', newLocation);
        };

        window.addEventListener('storage', updateLocation);
        window.addEventListener('locationUpdated', updateLocation);

        return () => {
            window.removeEventListener('storage', updateLocation);
            window.removeEventListener('locationUpdated', updateLocation);
        };
    }, []);
    return (
        <div style={styles.banner}>
            <div style={styles.content}>
                <div style={styles.left}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" />
                    </svg>
                    <div style={styles.textContainer}>
                        <h3 style={styles.title}>Groceries in 10 minutes</h3>
                        <p style={styles.subtitle}>Fresh from farm to your doorstep</p>
                    </div>
                </div>

                <button
                    onClick={onLocationClick}
                    style={styles.locationBtn}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#059669" strokeWidth="2" fill="none" />
                        <circle cx="12" cy="10" r="3" stroke="#059669" strokeWidth="2" fill="none" />
                    </svg>
                    <span style={styles.locationText}>{location}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

const styles = {
    banner: {
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        borderBottom: '1px solid #FCD34D',
        padding: '1rem 2rem'
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    icon: {
        flexShrink: 0
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'column'
    },
    title: {
        fontSize: '1.125rem',
        fontWeight: '700',
        color: '#92400E',
        margin: 0,
        marginBottom: '0.25rem'
    },
    subtitle: {
        fontSize: '0.875rem',
        color: '#78350F',
        margin: 0,
        fontWeight: '500'
    },
    locationBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 1rem',
        background: '#FFFFFF',
        border: '2px solid #D1D5DB',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#1F2937'
    },
    locationText: {
        maxWidth: '200px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
};

export default DeliveryBanner;
