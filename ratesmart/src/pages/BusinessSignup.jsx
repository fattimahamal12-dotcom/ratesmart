import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BusinessSignup.css';

const countryStates = {
  Nigeria: ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo'],
  Ghana: ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Sunyani'],
  Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']
};

const BusinessSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    email: '',
    country: '',
    state: '',
    openingHours: '',
    description: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = e => {
    setFormData({ ...formData, country: e.target.value, state: '' });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return password.length >= minLength && hasUpperCase && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      businessName, phone, email,
      country, state, openingHours, description,
      password, confirmPassword
    } = formData;
    if (!businessName || !phone || !email || !country || !state || !openingHours || !password || !confirmPassword || !description) {
      return setError('Please fill in all fields 🚨');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match 🚨');
    }

    if (!validatePassword(password)) {
      return setError('Password must be 8+ characters with uppercase and number 🚨');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Please enter a valid email 🚨');
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/signup/', {
        name: businessName,
        phone,
        email,
        country,
        state,
        hours: openingHours,
        description,
        password
      });
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('business', JSON.stringify(response.data.business));
        localStorage.setItem('loggedInBusiness', JSON.stringify(response.data.business));
        navigate('/business-dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err.response);
      const errorMsg = err.response?.data?.error ||
                       err.response?.data?.message ||
                       'Signup failed. Please try again. 🚨';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Business Signup </h2>
        {error && <div className="error-message">{error}</div>}

        <input 
          type="text" 
          name="businessName" 
          placeholder="Business Name " 
          onChange={handleChange} 
          value={formData.businessName} 
          required
        />
        
        <input 
          type="tel" 
          name="phone" 
          placeholder="Phone Number " 
          onChange={handleChange} 
          value={formData.phone} 
          required
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email " 
          onChange={handleChange} 
          value={formData.email} 
          required
        />

        <select 
          name="country" 
          value={formData.country} 
          onChange={handleCountryChange}
          required
        >
          <option value="">Select Country </option>
          {Object.keys(countryStates).map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <select 
          name="state" 
          value={formData.state} 
          onChange={handleChange}
          required
          disabled={!formData.country}
        >
          <option value="">Select State </option>
          {(countryStates[formData.country] || []).map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <input 
          type="text" 
          name="openingHours" 
          placeholder="Opening Hours (e.g. 9AM - 5PM) " 
          onChange={handleChange} 
          value={formData.openingHours} 
          required
        />

        <textarea 
          name="description" 
          placeholder="Business description... " 
          value={formData.description} 
          onChange={handleChange} 
          required
          minLength="20"
        />

        <input 
          type="password" 
          name="password" 
          placeholder="Password (min 8 characters with uppercase and number) " 
          onChange={handleChange} 
          value={formData.password} 
          required
          minLength="8"
        />
        
        <input 
          type="password" 
          name="confirmPassword" 
          placeholder="Confirm Password " 
          onChange={handleChange} 
          value={formData.confirmPassword} 
          required
          minLength="8"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up... ' : 'Sign Up '}
        </button>

        <p className="login-link">
          Already have an account? <span onClick={() => navigate('/business-login')}>Login </span>
        </p>
      </form>
    </div>
  );
};

export default BusinessSignup;