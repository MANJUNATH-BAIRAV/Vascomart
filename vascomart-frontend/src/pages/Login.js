import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn, FiLock, FiPhone, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import '../styles/Auth.css';


const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { username, password } = formData;

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
    setIsLoading(true);

    try {
      console.log('Sending login request with:', { username, password });
      const requestBody = JSON.stringify({ username, password });
      console.log('Request body:', requestBody);
      
      const res = await fetch('http://localhost:8082/api/v1/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: requestBody,
      });

      console.log('Response status:', res.status);
      const contentType = res.headers.get('content-type');
      const text = await res.text();
      console.log('Response text:', text);

      let data = null;
      if (contentType && contentType.includes('application/json') && text) {
        data = JSON.parse(text);
        console.log('Parsed response data:', data);
      } else {
        console.error('Unexpected content type or empty response');
      }

      if (res.ok) {
        // Store user data in localStorage
        const userData = {
          id: data?.userId || '1',
          username: username,
          token: data?.token
        };
        localStorage.setItem('token', data?.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Force a page reload to update the header
        window.location.href = '/';
      } else {
        const errMsg = data?.message || text || 'Invalid username or password';
        setError(errMsg);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="message message-error">
            <FiPhone />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <div className="input-with-icon">
              <FiUser className="input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                className="form-control"
                placeholder="Enter your username or email"
                value={username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>
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
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              'Signing in...'
            ) : (
              <>
                <FiLogIn className="mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="divider">or continue with</div>

        <button className="btn btn-google">
          <FcGoogle size={20} />
          Sign in with Google
        </button>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
