import React, { useEffect, useState } from 'react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:8083/api/v1/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddProduct = async () => {
    try {
      const res = await fetch('http://localhost:8083/api/v1/products/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
        }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || 'Failed to add product');
      }

      setFormData({ name: '', description: '', price: '', quantity: '' });
      fetchProducts(); // Refresh product list
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Products</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {products.length === 0 && !error && <p>No products available</p>}

      <ul>
        {products.map((product, index) => (
          <li key={index} style={{ marginBottom: 10 }}>
            <strong>{product.name}</strong><br />
            {product.description}<br />
            Price: ₹{product.price}<br />
            Quantity: {product.quantity}
          </li>
        ))}
      </ul>

      <hr />
      <h3>Add Product</h3>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      /><br />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
      /><br />
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={e => setFormData({ ...formData, price: e.target.value })}
      /><br />
      <input
        type="number"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
      /><br />
      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
};

export default Products;
