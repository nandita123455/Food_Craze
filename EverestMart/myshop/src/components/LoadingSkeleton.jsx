import PropTypes from 'prop-types';

/**
 * LoadingSkeleton Component
 * 
 * Reusable loading skeleton with shimmer animation
 * for better perceived performance
 */

function LoadingSkeleton({ type = 'card', count = 1 }) {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return <ProductCardSkeleton />;
            case 'text':
                return <TextSkeleton />;
            case 'list':
                return <ListSkeleton />;
            default:
                return <ProductCardSkeleton />;
        }
    };

    return (
        <>
            {[...Array(count)].map((_, idx) => (
                <div key={idx} className="fade-in">
                    {renderSkeleton()}
                </div>
            ))}
        </>
    );
}

// Product Card Skeleton
function ProductCardSkeleton() {
    return (
        <div style={styles.card}>
            <div style={styles.imageSkeleton}></div>
            <div style={styles.content}>
                <div style={styles.title}></div>
                <div style={styles.subtitle}></div>
                <div style={styles.price}></div>
                <div style={styles.button}></div>
            </div>
        </div>
    );
}

// Text Skeleton
function TextSkeleton() {
    return (
        <div style={styles.textContainer}>
            <div style={styles.textLine}></div>
            <div style={{ ...styles.textLine, width: '80%' }}></div>
            <div style={{ ...styles.textLine, width: '60%' }}></div>
        </div>
    );
}

// List Item Skeleton
function ListSkeleton() {
    return (
        <div style={styles.listItem}>
            <div style={styles.circle}></div>
            <div style={{ flex: 1 }}>
                <div style={styles.listTitle}></div>
                <div style={styles.listSubtitle}></div>
            </div>
        </div>
    );
}

const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
`;

// Inject shimmer animation
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = shimmerKeyframes;
    document.head.appendChild(style);
}

const shimmerBackground = {
    background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
    backgroundSize: '1000px 100%',
    animation: 'shimmer 2s infinite linear'
};

const styles = {
    card: {
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        overflow: 'hidden'
    },
    imageSkeleton: {
        width: '100%',
        paddingTop: '100%',
        ...shimmerBackground
    },
    content: {
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
    },
    title: {
        height: '20px',
        borderRadius: '4px',
        ...shimmerBackground
    },
    subtitle: {
        height: '16px',
        width: '60%',
        borderRadius: '4px',
        ...shimmerBackground
    },
    price: {
        height: '24px',
        width: '40%',
        borderRadius: '4px',
        ...shimmerBackground
    },
    button: {
        height: '40px',
        borderRadius: '8px',
        marginTop: '0.5rem',
        ...shimmerBackground
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem'
    },
    textLine: {
        height: '16px',
        borderRadius: '4px',
        ...shimmerBackground
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
    },
    circle: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        ...shimmerBackground
    },
    listTitle: {
        height: '18px',
        width: '70%',
        borderRadius: '4px',
        marginBottom: '0.5rem',
        ...shimmerBackground
    },
    listSubtitle: {
        height: '14px',
        width: '50%',
        borderRadius: '4px',
        ...shimmerBackground
    }
};

LoadingSkeleton.propTypes = {
    type: PropTypes.oneOf(['card', 'text', 'list']),
    count: PropTypes.number
};

export default LoadingSkeleton;
