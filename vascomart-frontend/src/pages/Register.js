import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'USER' // Default role
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { name, lastName, username, email, password, role } = formData;

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
      console.log('Sending registration request with:', { name, lastName, username, email, role });
      
      // Register the user through the gateway
      const res = await fetch('http://localhost:8087/api/v1/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          name, 
          lastName, 
          username, 
          email, 
          password, 
          role 
        }),
      });

      console.log('Registration response status:', res.status);
      const contentType = res.headers.get('content-type');
      let data = null;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
          console.log('Parsed response data:', data);
        } else {
          const text = await res.text();
          console.log('Non-JSON response:', text);
          throw new Error(text || 'Received non-JSON response from server');
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Failed to process server response');
      }

      if (res.status === 201 || res.ok) {
        setSuccess('Registration successful! Redirecting to login page...');
        
        // Wait a moment to show success message, then redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        
        // Exit early to prevent further processing
        return;
      } else {
        const errMsg = data?.message || data?.error || 'Registration failed';
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
            <label htmlFor="lastName">Last Name</label>
            <div className="input-with-icon">
              <FiUser className="input-icon" />
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-control"
                placeholder="Enter your last name"
                value={lastName}
                onChange={handleChange}
                required
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
