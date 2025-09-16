import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BusinessLogin.css';

function BusinessLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('business', JSON.stringify(response.data.business));
      localStorage.setItem('loggedInBusiness', JSON.stringify(response.data.business));
      
      navigate('/business-dashboard');
    } catch (err) {
      console.error('Login error:', err.response);
      setError(err.response?.data?.error || 'Invalid email or password 🚨');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Business Login </h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email "
          required
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password "
          required
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in... ' : 'Login '}
        </button>

        <p className="login-link">
          Don't have an account?{' '}
          <span onClick={() => navigate('/business-signup')}>Sign Up </span>
        </p>
      </form>
    </div>
  );
}

export default BusinessLogin;