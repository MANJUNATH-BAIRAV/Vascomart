import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:8082/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const contentType = res.headers.get('content-type');
      const text = await res.text();

      let data = null;
      if (contentType && contentType.includes('application/json') && text) {
        data = JSON.parse(text);
      }

      if (res.ok) {
        localStorage.setItem('token', data?.token);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', data?.userId || '1');
        console.log('Login successful:', data);
        navigate('/');
      } else {
        const errMsg = data?.message || text || 'Login failed';
        setError(errMsg);
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: 'auto', marginTop: 100 }}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <hr />
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
};

export default Login;
