import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrders, cancelOrder } from "../../api";
import toast from "react-hot-toast";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await getMyOrders();
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await cancelOrder(orderId);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel order");
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track all your purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h3>No orders yet</h3>
          <p style={{ marginBottom: 24 }}>
            Start shopping to see your orders here
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => (
            <div key={order._id} className="card fade-up">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--gray-400)",
                      marginBottom: 4,
                    }}
                  >
                    ORDER ID
                  </p>
                  <Link
                    to={`/orders/${order._id}`}
                    style={{
                      fontWeight: 700,
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "var(--amber-dark)",
                    }}
                  >
                    {order._id.slice(-12)}... →
                  </Link>
                  <p
                    style={{
                      color: "var(--gray-400)",
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    {new Date(order.createdAt).toLocaleDateString("en-GH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 18,
                      color: "var(--amber-dark)",
                    }}
                  >
                    GH₵{order.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div
                style={{
                  borderTop: "1px solid var(--gray-100)",
                  paddingTop: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      background: "var(--gray-50)",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 13,
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    <span>📦</span>
                    <span>{item.name}</span>
                    <span style={{ color: "var(--gray-400)" }}>
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment badge — add this after the items div */}
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    background: order.isPaid ? "#d1fae5" : "#fef3c7",
                    color: order.isPaid ? "#065f46" : "#92400e",
                  }}
                >
                  {order.isPaid ? "✓ Paid" : "⏳ Unpaid"}
                </span>
                <span style={{ fontSize: 12, color: "var(--gray-400)" }}>
                  {order.paymentMethod}
                </span>
              </div>

              {/* Shipping */}
              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "var(--gray-400)",
                }}
              >
                📍 {order.shippingAddress?.street},{" "}
                {order.shippingAddress?.city}, {order.shippingAddress?.country}
              </div>

              {order.status === "Pending" && (
                <div style={{ marginTop: 16 }}>
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
