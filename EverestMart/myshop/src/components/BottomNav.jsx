import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        updateCartCount();
        window.addEventListener('cartUpdated', updateCartCount);
        return () => window.removeEventListener('cartUpdated', updateCartCount);
    }, []);

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
    };

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const NavItem = ({ icon, label, path, badge }) => (
        <button
            style={{
                ...styles.navItem,
                ...(isActive(path) ? styles.navItemActive : {})
            }}
            onClick={() => navigate(path)}
        >
            <div style={styles.iconContainer}>
                {icon}
                {badge > 0 && (
                    <span style={styles.badge}>{badge > 99 ? '99+' : badge}</span>
                )}
            </div>
            <span style={styles.label}>{label}</span>
        </button>
    );

    return (
        <div style={styles.container}>
            <NavItem
                path="/"
                label="Home"
                icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                }
            />

            <NavItem
                path="/products"
                label="Products"
                icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
                        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
                        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
                        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                }
            />

            <NavItem
                path="/cart"
                label="Cart"
                badge={cartCount}
                icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 2C7.89543 2 7 2.89543 7 4V6H5C3.89543 6 3 6.89543 3 8V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8C21 6.89543 20.1046 6 19 6H17V4C17 2.89543 16.1046 2 15 2H9Z" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                }
            />

            <NavItem
                path="/orders"
                label="Orders"
                icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 3h6m-6 0a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-6 0H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2m6-16h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M10 12h4m-4 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                }
            />

            <NavItem
                path="/profile"
                label="Profile"
                icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                }
            />
        </div>
    );
}

const styles = {
    container: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '0.5rem 0',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        zIndex: 100,
        // Only show on mobile
        '@media (min-width: 768px)': {
            display: 'none'
        }
    },
    navItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        background: 'transparent',
        border: 'none',
        color: '#9CA3AF',
        cursor: 'pointer',
        padding: '0.5rem 1rem',
        transition: 'color 0.2s',
        fontSize: '0.75rem',
        fontWeight: '500',
        minWidth: '60px'
    },
    navItemActive: {
        color: '#059669'
    },
    iconContainer: {
        position: 'relative',
        width: '24px',
        height: '24px'
    },
    badge: {
        position: 'absolute',
        top: '-6px',
        right: '-8px',
        background: '#EF4444',
        color: '#FFFFFF',
        fontSize: '0.625rem',
        fontWeight: '700',
        padding: '0.125rem 0.375rem',
        borderRadius: '10px',
        minWidth: '18px',
        textAlign: 'center',
        lineHeight: '1.2'
    },
    label: {
        fontSize: '0.75rem',
        fontWeight: '500',
        letterSpacing: '0.025em'
    }
};

export default BottomNav;
