import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import OrderHistory from './pages/OrderHistory';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import RiderDashboard from './pages/rider/RiderDashboard';
import RiderLogin from './pages/rider/RiderLogin';
import RiderRegister from './pages/rider/RiderRegister';
import AddressBook from './pages/AddressBook';
import LocationModal from './components/LocationModal';
import useAutoLocation from './hooks/useAutoLocation';
import LocationBanner from './components/LocationBanner';
import { CartProvider } from './context/CartContext';
import { BehaviorProvider } from './context/BehaviorProvider';

function App() {
  const [user, setUser] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Auto-detect location on page load
  const { location, loading, error } = useAutoLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        <BehaviorProvider>
          <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
            <Navbar user={user} setUser={setUser} />

            {/* Location Banner */}
            {location && !loading && (
              <LocationBanner
                location={location}
                onChangeLocation={() => setShowLocationModal(true)}
              />
            )}

            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />

              {/* Payment Pages */}
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failure" element={<PaymentFailure />} />

              {/* Order Routes */}
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/order-history" element={<OrderHistory />} />

              {/* Wishlist Route */}
              <Route path="/wishlist" element={<Wishlist />} />

              {/* Auth Pages */}
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register />} />

              {/* Rider Routes */}
              <Route path="/rider/login" element={<RiderLogin />} />
              <Route path="/rider/register" element={<RiderRegister />} />
              <Route path="/rider/dashboard" element={<RiderDashboard />} />

              {/* Address Management */}
              <Route path="/addresses" element={<AddressBook />} />
              <Route path="/address-book" element={<AddressBook />} />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Location Modal */}
            {showLocationModal && (
              <LocationModal onClose={() => setShowLocationModal(false)} />
            )}

            <Footer />
          </div>
        </BehaviorProvider>
      </Router>
    </CartProvider>
  );
}

// ✅ 404 Page Component
function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: '#1A1A1A' }}>404</h1>
      <p style={{ fontSize: '1.5rem', color: '#8B8B8B', marginBottom: '2rem' }}>
        Page not found
      </p>
      <a href="/" style={{
        padding: '1rem 2rem',
        background: '#1A1A1A',
        color: '#FFFFFF',
        textDecoration: 'none',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '0.875rem',
        borderRadius: '8px',
        transition: 'all 0.2s'
      }}>
        ← Go Home
      </a>
    </div>
  );
}

export default App;
