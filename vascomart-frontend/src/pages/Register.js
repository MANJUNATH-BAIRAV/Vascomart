import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    console.log("Register button clicked"); // 🔍 Debug check

    try {
      const res = await fetch('http://localhost:8082/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });

      const contentType = res.headers.get('content-type');
      const text = await res.text();

      let data = null;
      if (contentType && contentType.includes('application/json') && text) {
        data = JSON.parse(text);
      }

      if (res.ok) {
        console.log('Registration success:', data);
        navigate('/login'); // go to login after registration
      } else {
        const errMsg = data?.message || text || 'Registration failed';
        setError(errMsg);
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: 'auto', marginTop: 100 }}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      /><br />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      /><br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br />
      <button onClick={handleRegister}>Register</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <hr />
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default Register;
