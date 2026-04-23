import API from './axios';

// --- AUTH ---
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser   = (data) => API.post('/auth/login', data);

// --- PUBLIC PRODUCTS ---
export const getAllProducts   = (params) => API.get('/products', { params });
export const getProductById   = (id)     => API.get(`/products/${id}`);

// --- SELLER ---
export const setupStore       = (data)   => API.post('/seller/store', data);
export const getMyStore        = ()       => API.get('/seller/store');
export const addProduct        = (data)   => API.post('/seller/products', data);
export const getMyProducts     = ()       => API.get('/seller/products');
export const updateProduct     = (id, d)  => API.put(`/seller/products/${id}`, d);
export const deleteProduct     = (id)     => API.delete(`/seller/products/${id}`);
export const getReceivedOrders = ()       => API.get('/seller/orders');
export const updateOrderStatus = (id, s)  => API.put(`/seller/orders/${id}/status`, { status: s });

// --- BUYER ---
export const placeOrder        = (data)   => API.post('/buyer/orders', data);
export const getMyOrders       = ()       => API.get('/buyer/orders');
export const getOrderById      = (id)     => API.get(`/buyer/orders/${id}`);
export const cancelOrder       = (id)     => API.put(`/buyer/orders/${id}/cancel`);
export const getSellerProfile  = (id)     => API.get(`/buyer/sellers/${id}`);
export const getSellerProducts = (id)     => API.get(`/buyer/sellers/${id}/products`);

// --- PAYMENT ---

// --- UPLOAD ---
export const uploadImage = (formData) => API.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// --- PAYMENT ---
export const initializePayment = (data) => API.post('/payment/initialize', data);
export const verifyPayment     = (ref)  => API.get(`/payment/verify/${ref}`);
export const markOrderPaid     = (id, data) => API.put(`/buyer/orders/${id}/pay`, data);