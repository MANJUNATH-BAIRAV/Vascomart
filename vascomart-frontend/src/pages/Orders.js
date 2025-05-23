import React, { useState, useEffect } from 'react';
import './Orders.css';

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = 'your-mock-jwt-token'; // In a real app, get this from auth context

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch('http://localhost:8083/api/v1/products', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
        
        // Initialize order items with quantity 0
        const initialItems = {};
        data.forEach(product => {
          initialItems[product.id] = 0;
        });
        setOrderItems(initialItems);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(`Failed to fetch products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

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

      const response = await fetch('http://localhost:8085/api/v1/orders/users/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ products: items })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to place order');
      }
      
      setSuccess('Order placed successfully!');
      
      // Reset form
      const resetItems = {};
      Object.keys(orderItems).forEach(key => {
        resetItems[key] = 0;
      });
      setOrderItems(resetItems);
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

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Create New Order</h2>
      </div>
      
      <div className="new-order">
        <h3>Select Products</h3>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <div className="product-list">
          {products.map(product => (
            <div key={product.id} className="product-item">
              <div className="product-info">
                <h4>{product.name}</h4>
                <p>Price: ₹{product.price?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="quantity-controls">
                <button 
                  onClick={() => updateQuantity(product.id, (orderItems[product.id] || 0) - 1)}
                  disabled={!orderItems[product.id]}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="0"
                  value={orderItems[product.id] || 0}
                  onChange={(e) => updateQuantity(product.id, e.target.value)}
                />
                <button onClick={() => updateQuantity(product.id, (orderItems[product.id] || 0) + 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="order-actions">
          <button 
            onClick={placeOrder} 
            className="place-order-btn"
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;
