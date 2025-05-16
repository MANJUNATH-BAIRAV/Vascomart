import React, { useEffect, useState } from 'react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/v1/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products.');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8083/api/v1/products/add', {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add product.');
      }

      setSuccess('Product added successfully.');
      setFormData({ name: '', description: '', price: '', quantity: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Products</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleAddProduct} style={{ marginBottom: '20px' }}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Product</button>
      </form>

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <strong>{product.name}</strong> – {product.description} | ₹{product.price} | Stock: {product.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
