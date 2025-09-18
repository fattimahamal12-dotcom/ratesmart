import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import '../styles/components.css';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchBusiness, setSearchBusiness] = useState('');
  const [searchReview, setSearchReview] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, action: null, title: '', description: '', danger: false });
  const navigate = useNavigate();

  const getAdminToken = () =>
    localStorage.getItem('admin_access_token') || localStorage.getItem('access_token');
  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const fetchWithAuth = useCallback(
    async (url, setter) => {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        });
        setter(res.data);
      } catch (err) {
        console.error(`Error fetching ${url}:`, err);
        setError(err?.response?.data?.error || `Could not load data from ${url} 🚨`);
      }
    },
    []
  );

  const fetchBusinesses = useCallback(() => {
    return fetchWithAuth('http://localhost:8000/api/businesses/', setBusinesses);
  }, [fetchWithAuth]);

  const fetchReviews = useCallback(() => {
    return fetchWithAuth('http://localhost:8000/api/reviews/', setReviews);
  }, [fetchWithAuth]);

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([fetchBusinesses(), fetchReviews()]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data 🚨');
    } finally {
      setLoading(false);
    }
  }, [fetchBusinesses, fetchReviews]);
  useEffect(() => {
    const token = getAdminToken();
    const adminUser = localStorage.getItem('loggedInAdmin');
    if (token && adminUser) {
      fetchData();
    } else {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate, fetchData]);

  const handleDeleteBusiness = (id) => {
    setConfirm({
      open: true,
      action: async () => {
        setError(null);
        setSuccess(null);
        try {
          await axios.delete(`http://localhost:8000/api/businesses/${id}/`, {
            headers: { Authorization: `Bearer ${getAdminToken()}` },
          });
          setSuccess('Business deleted successfully! ✅');
          fetchBusinesses();
        } catch (err) {
          console.error('Error deleting business:', err?.response || err);
          setError(err?.response?.data?.error || 'Failed to delete business. 🚨');
        } finally {
          setConfirm((c) => ({ ...c, open: false }));
        }
      },
      title: 'Delete business?',
      description: 'This action cannot be undone.',
      danger: true,
    });
  };

  const handleDeleteReview = (id) => {
    setConfirm({
      open: true,
      action: async () => {
        setError(null);
        setSuccess(null);
        try {
          await axios.delete(`http://localhost:8000/api/reviews/${id}/`, {
            headers: { Authorization: `Bearer ${getAdminToken()}` },
          });
          setSuccess('Review deleted successfully! ✅');
          fetchReviews();
        } catch (err) {
          console.error('Error deleting review:', err?.response || err);
          setError(err?.response?.data?.error || 'Failed to delete review. 🚨');
        } finally {
          setConfirm((c) => ({ ...c, open: false }));
        }
      },
      title: 'Delete review?',
      description: 'This will permanently remove the review.',
      danger: true,
    });
  };

  const handleReset = () => {
    setConfirm({
      open: true,
      action: async () => {
        setError(null);
        setSuccess(null);
        try {
          const token = getAdminToken();
          await axios.post(
            'http://localhost:8000/api/admin/reset/',
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSuccess('System reset successfully! ✅');
          fetchBusinesses();
          fetchReviews();
        } catch (err) {
          console.error('Error resetting system:', err?.response || err);
          setError(err?.response?.data?.error || 'Failed to reset. 🚨');
        } finally {
          setConfirm((c) => ({ ...c, open: false }));
        }
      },
      title: 'Reset entire system?',
      description: 'Deletes all businesses (except superuser), products, and reviews.',
      danger: true,
    });
  };

  const filteredBusinesses = businesses.filter((b) =>
    b.name?.toLowerCase().includes(searchBusiness.toLowerCase())
  );

  const filteredReviews = reviews.filter((r) =>
    r.business_name?.toLowerCase().includes(searchReview.toLowerCase())
  );

  if (loading) return <div>Loading... 📊</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1 style={{ textAlign: 'center' }}>Admin Dashboard 📈</h1>
        <div className="admin-actions">
          <button className="btn btn-danger" onClick={handleReset}>
            🔄 Reset System
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('admin_access_token');
              localStorage.removeItem('loggedInAdmin');
              navigate('/admin-login', { replace: true });
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      <Toast
        kind={error ? 'error' : 'success'}
        message={error || success}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      />

      <div className="admin-tabs">
        <div
          className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview 📊
        </div>
        <div
          className={`tab ${selectedTab === 'businesses' ? 'active' : ''}`}
          onClick={() => setSelectedTab('businesses')}
        >
          Manage Businesses 🏢
        </div>
        <div
          className={`tab ${selectedTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setSelectedTab('reviews')}
        >
          Manage Reviews 📝
        </div>
      </div>

      <div className="tab-content">
        {selectedTab === 'overview' && (
          <div className="overview-cards">
            <div className="card">
              <h2>Total Registered Businesses 📈</h2>
              <p>{businesses.length}</p>
            </div>
            <div className="card">
              <h2>Total Reviews 📝</h2>
              <p>{reviews.length}</p>
            </div>
            <div className="card">
              <h2>Fake Reviews Detected 🚩</h2>
              <p>{reviews.filter((r) => r.is_fake).length}</p>
            </div>
          </div>
        )}

        {selectedTab === 'businesses' && (
          <div className="manage-section">
            <input
              type="text"
              placeholder="Search business... 🔍"
              value={searchBusiness}
              onChange={(e) => setSearchBusiness(e.target.value)}
            />
            <div className="business-cards">
              {filteredBusinesses.length === 0 ? (
                <p>No businesses found. 😞</p>
              ) : (
                filteredBusinesses.map((biz) => (
                  <div className="business-card" key={biz.id}>
                    <h3>{biz.name}</h3>
                    <p>Country: {biz.country}</p>
                    <p>State: {biz.state}</p>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteBusiness(biz.id)}
                    >
                      Delete 🚫
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedTab === 'reviews' && (
          <div className="manage-section">
            <input
              type="text"
              placeholder="Search by business... 🔍"
              value={searchReview}
              onChange={(e) => setSearchReview(e.target.value)}
            />
            <div className="review-cards">
              {filteredReviews.length === 0 ? (
                <p>No reviews found. 😞</p>
              ) : (
                filteredReviews.map((review) => (
                  <div className="review-card" key={review.id}>
                    <h3>{review.business_name}</h3>
                    <p>Product: {review.product_name || 'N/A'}</p>
                    <p>Customer: {review.customer_name}</p>
                    <p>Rating: {review.rating} ⭐</p>
                    <p>Review: {review.text}</p>
                    <p>Sentiment: {review.sentiment || 'N/A'} 😊</p>
                    <p>Fake? {review.is_fake ? 'Yes 🚩' : 'No'}</p>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      Delete 🚫
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        danger={confirm.danger}
        onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
        onConfirm={confirm.action}
      />
    </div>
  );
};

export default AdminDashboard;
