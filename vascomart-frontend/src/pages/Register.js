import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { name, username, email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Register the user
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
        // After successful registration, automatically log the user in
        const loginRes = await fetch('http://localhost:8082/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (loginRes.ok) {
          const loginData = await loginRes.json();
          
          // Get user profile after successful login
          const userRes = await fetch('http://localhost:8081/api/v1/users/me', {
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Content-Type': 'application/json',
            },
          });

          if (userRes.ok) {
            const userData = await userRes.json();
            // Store user data in localStorage (AuthContext will handle this)
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', loginData.token);
            
            setSuccess('Registration successful! Redirecting to your profile...');
            setTimeout(() => {
              navigate('/profile');
            }, 1500);
          } else {
            throw new Error('Failed to load user profile');
          }
        } else {
          // If auto-login fails, redirect to login page
          setSuccess('Registration successful! Please log in.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        const errMsg = data?.message || text || 'Registration failed';
        setError(errMsg);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create an Account</h1>
          <p>Join us today and start shopping</p>
        </div>

        {error && (
          <div className="message message-error">
            <FiPhone />
            {error}
          </div>
        )}

        {success && (
          <div className="message message-success">
            <FiCheck />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <FiUser className="input-icon" />
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                placeholder="Enter your full name"
                value={name}
                onChange={handleChange}
                required
              />
            </div>
          </div>


          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <FiUser className="input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                className="form-control"
                placeholder="Choose a username"
                value={username}
                onChange={handleChange}
                required
                minLength="3"
              />
            </div>
          </div>


          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="your@email.com"
                value={email}
                onChange={handleChange}
                required
              />
            </div>
          </div>


          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="divider">or sign up with</div>

        <button className="btn btn-google">
          <FcGoogle size={20} />
          Sign up with Google
        </button>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
