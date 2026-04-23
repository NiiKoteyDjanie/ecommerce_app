import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav
      style={{
        background: "var(--navy)",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 76,
              height: 36,
              background: "var(--amber)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--navy)",
            }}
          >
            TNM
          </div>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 500,
              fontSize: 15,
              color: "white",
            }}
          >
            The Nima Market
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!user && (
            <>
              <Link
                to="/"
                style={{
                  color: "var(--gray-400)",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Browse
              </Link>
              <Link
                to="/login"
                className="btn btn-outline"
                style={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  padding: "8px 20px",
                  fontSize: 14,
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ padding: "8px 20px", fontSize: 14 }}
              >
                Register
              </Link>
            </>
          )}

          {user?.role === "buyer" && (
            <>
              <Link
                to="/"
                style={{
                  color: "var(--gray-400)",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                Browse
              </Link>
              <Link
                to="/orders"
                style={{
                  color: "var(--gray-400)",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                My Orders
              </Link>
              <Link
                to="/cart"
                style={{ position: "relative", padding: "8px 16px" }}
              >
                <span style={{ fontSize: 20 }}>🛒</span>
                {cart.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      background: "var(--amber)",
                      color: "var(--navy)",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cart.length}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "none",
                }}
              >
                Logout
              </button>
            </>
          )}

          {user?.role === "seller" && (
            <>
              <Link
                to="/seller"
                style={{
                  color: "var(--gray-400)",
                  padding: "8px 16px",
                  fontSize: 14,
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/seller/products"
                style={{
                  color: "var(--gray-400)",
                  padding: "8px 16px",
                  fontSize: 14,
                }}
              >
                Products
              </Link>
              <Link
                to="/seller/orders"
                style={{
                  color: "var(--gray-400)",
                  padding: "8px 16px",
                  fontSize: 14,
                }}
              >
                Orders
              </Link>
              <Link
                to="/seller/store"
                style={{
                  color: "var(--gray-400)",
                  padding: "8px 16px",
                  fontSize: 14,
                }}
              >
                My Store
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "none",
                }}
              >
                Logout
              </button>
            </>
          )}

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link to="/settings" title="Account Settings">
                <div
                  style={{
                    background: "var(--amber)",
                    color: "var(--navy)",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
