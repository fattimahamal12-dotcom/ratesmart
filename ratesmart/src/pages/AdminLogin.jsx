import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const existingAdmin = localStorage.getItem('adminUser');
    if (!existingAdmin) {
      localStorage.setItem(
        'adminUser',
        JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
      );
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const storedAdmin = JSON.parse(localStorage.getItem('adminUser'));

    if (storedAdmin && storedAdmin.email === email && storedAdmin.password === password) {
      localStorage.setItem('admin_access_token', 'admin-token');
      localStorage.setItem('loggedInAdmin', JSON.stringify(storedAdmin));
      console.log('Admin login successful, redirecting to dashboard...');
      navigate('/admin-dashboard');
    } else {
      console.log('Invalid admin credentials');
      setErrorMsg('Invalid admin credentials!');
      setTimeout(() => setErrorMsg(''), 2000);
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h2>Admin Login</h2>
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p className="back-link" onClick={() => navigate('/')}>
          Not an admin? Go back to Homepage
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;