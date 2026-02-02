import { useState, useEffect } from 'react';

/**
 * LocationBanner - Shows detected location with option to change
 */
function LocationBanner({ location, onChangeLocation }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Auto-hide after 10 seconds
        const timer = setTimeout(() => setVisible(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible || !location) return null;

    return (
        <div style={styles.banner}>
            <div style={styles.content}>
                <span style={styles.icon}>📍</span>
                <div style={styles.text}>
                    <strong>Delivering to:</strong> {location.address}
                </div>
                <button style={styles.changeBtn} onClick={onChangeLocation}>
                    Change
                </button>
                <button style={styles.closeBtn} onClick={() => setVisible(false)}>
                    ✕
                </button>
            </div>
        </div>
    );
}

const styles = {
    banner: {
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        maxWidth: '600px',
        width: '90%',
        animation: 'slideDown 0.3s ease-out'
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.5rem',
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)',
        fontSize: '0.95rem'
    },
    icon: {
        fontSize: '1.5rem'
    },
    text: {
        flex: 1,
        lineHeight: '1.4'
    },
    changeBtn: {
        background: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.3)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'all 0.2s'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '0',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
        transition: 'opacity 0.2s'
    }
};

export default LocationBanner;
