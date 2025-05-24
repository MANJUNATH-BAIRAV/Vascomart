import React, { useEffect, useState } from 'react';
import { getProductImage } from '../utils/productImages';
import './Products.css';

// Icons (keep these icons as they are used in the UI)
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

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

// Product image handling is now imported from '../utils/productImages'

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8087/api/v1/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to fetch products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8087/api/v1/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity, 10)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.message || errorData.detail || errorData.error || 'Failed to add product. Please try again.');
      }

      // We don't need the response data, just refresh the products
      await response.json();
      setSuccess('Product added successfully!');
      setFormData({ name: '', description: '', price: '', quantity: '' });
      setIsAddingProduct(false);
      await fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        if (error) setError('');
        if (success) setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Browse and manage your product inventory</p>
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

      <div className="add-product-form">
        <div className="add-product-header">
          <h2 className="form-title">Add New Product</h2>
          <button 
            onClick={() => setIsAddingProduct(!isAddingProduct)}
            className="btn"
            style={{ 
              backgroundColor: isAddingProduct ? '#ef4444' : '#4f46e5',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              fontSize: '0.9rem',
              minWidth: 'auto',
              width: 'auto'
            }}
          >
            {isAddingProduct ? 'Cancel' : (
              <>
                <PlusIcon style={{ width: '16px', height: '16px' }} />
                <span>Add Product</span>
              </>
            )}
          </button>
        </div>

        {isAddingProduct && (
          <form onSubmit={handleAddProduct}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price (₹)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="3"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
                style={{
                  padding: '0.4rem 1rem',
                  fontSize: '0.9rem',
                  minWidth: '120px',
                  width: 'auto'
                }}
              >
                {isLoading ? 'Adding...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="products-grid">
        {isLoading && products.length === 0 ? (
          <div>Loading products...</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={getProductImage(product.name)} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getProductImage('default');
                  }}
                />
              </div>
              <div className="product-details">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">
                  {product.description || 'No description available.'}
                </p>
                <div className="product-meta">
                  <span className="product-price">₹{product.price?.toFixed(2)}</span>
                  <span className="product-stock">
                    {product.quantity || 0} in stock
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
