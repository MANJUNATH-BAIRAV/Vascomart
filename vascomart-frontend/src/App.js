import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register'; // 👈 make sure this file exists

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* 👈 New Route */}
      </Routes>
    </Router>
  );
}

export default App;
