import React, { useState, useEffect } from 'react';
import { getProductImage } from '../utils/productImages';
import './Orders.css';

// Icons (you can replace with actual icon components if using an icon library)
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = 'your-mock-jwt-token'; // In a real app, get this from auth context

  // Fetch products function
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch products from inventory service
      const response = await fetch('http://localhost:8087/api/v1/products', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
      
      // Initialize order items with quantity 0
      const initialItems = {};
      data.forEach(product => {
        initialItems[product.id] = 0;
      });
      setOrderItems(initialItems);
      
      return data; // Return the data for potential use
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Failed to fetch products: ${err.message}`);
      throw err; // Re-throw to handle in the calling function
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Place new order
  const placeOrder = async () => {
    try {
      // Convert order items to array format
      const items = Object.entries(orderItems)
        .filter(([_, quantity]) => quantity > 0)
        .map(([productId, quantity]) => ({
          productId: parseInt(productId),
          quantity: parseInt(quantity)
        }));

      if (items.length === 0) {
        setError('Please add at least one product to your order');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('http://localhost:8087/order-service/api/v1/orders', {
        method: 'POST',
        credentials: 'include',  // Include cookies for CORS
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ products: items })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to place order');
      }
      
      // We don't need the response data, just refresh the products
      await response.json();
      setSuccess('Order placed successfully!');
      
      // Reset form
      const resetItems = {};
      Object.keys(orderItems).forEach(key => {
        resetItems[key] = 0;
      });
      setOrderItems(resetItems);
      
      // Refresh products to update stock
      await fetchProducts();
    } catch (err) {
      console.error('Error placing order:', err);
      setError(`Failed to place order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update quantity for a product
  const updateQuantity = (productId, quantity) => {
    setOrderItems(prev => ({
      ...prev,
      [productId]: Math.max(0, parseInt(quantity) || 0)
    }));
  };

  // Calculate order summary
  const totalItems = Object.values(orderItems).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
  const subtotal = products.reduce((sum, product) => {
    const qty = orderItems[product.id] || 0;
    return sum + (product.price * qty);
  }, 0);
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;

  if (loading && products.length === 0) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h1>Create New Order</h1>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Create New Order</h1>
        <p>Select the products you'd like to order</p>
      </div>

      {error && (
        <div className="message message-error">
          <ErrorIcon />
          {error}
        </div>
      )}

      {success && (
        <div className="message message-success">
          <CheckIcon />
          {success}
        </div>
      )}

      <div className="order-layout">
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card fade-in">
              <div className="product-image">
                <img 
                  src={getProductImage(product.name)} 
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getProductImage('default');
                  }}
                />
              </div>
              <div className="product-details">
                <h3 className="product-title">{product.name}</h3>
                <div className="product-price">₹{product.price?.toFixed(2) || '0.00'}</div>
                <div className="product-stock">{product.quantity || 0} in stock</div>
                
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(product.id, (orderItems[product.id] || 0) - 1)}
                    disabled={!orderItems[product.id]}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    min="0"
                    max={product.quantity || 0}
                    value={orderItems[product.id] || 0}
                    onChange={(e) => updateQuantity(product.id, e.target.value)}
                    className="quantity-input"
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(product.id, (orderItems[product.id] || 0) + 1)}
                    disabled={(orderItems[product.id] || 0) >= (product.quantity || 0)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items ({totalItems}):</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (18%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button 
            onClick={placeOrder} 
            className="btn btn-primary"
            disabled={loading || totalItems === 0}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
