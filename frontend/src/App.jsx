import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import OrderDetail from './pages/buyer/OrderDetail';
import AccountSettings from './pages/shared/AccountSettings';


// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import SetupStore from './pages/seller/SetupStore';
import ManageProducts from './pages/seller/ManageProducts';
import SellerOrders from './pages/seller/Orders';

// Buyer pages
import Home from './pages/buyer/Home';
import ProductDetail from './pages/buyer/ProductDetail';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import OrderHistory from './pages/buyer/OrderHistory';
import SellerProfile from './pages/buyer/SellerProfile';

// Shared
import Navbar from './components/Navbar';

// Protected Route wrapper
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
      <Route path="/orders/:id" element={<ProtectedRoute role="buyer"><OrderDetail /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:id"     element={<ProductDetail />} />
        <Route path="/sellers/:id"      element={<SellerProfile />} />

        {/* Buyer only */}
        <Route path="/cart"     element={<ProtectedRoute role="buyer"><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute role="buyer"><Checkout /></ProtectedRoute>} />
        <Route path="/orders"   element={<ProtectedRoute role="buyer"><OrderHistory /></ProtectedRoute>} />

        {/* Seller only */}
        <Route path="/seller"          element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />
        <Route path="/seller/store"    element={<ProtectedRoute role="seller"><SetupStore /></ProtectedRoute>} />
        <Route path="/seller/products" element={<ProtectedRoute role="seller"><ManageProducts /></ProtectedRoute>} />
        <Route path="/seller/orders"   element={<ProtectedRoute role="seller"><SellerOrders /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;