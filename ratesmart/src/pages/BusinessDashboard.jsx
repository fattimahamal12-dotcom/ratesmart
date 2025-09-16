import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './BusinessDashboard.css';
import { useNavigate } from 'react-router-dom';
import '../styles/components.css';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, action: null, title: '', description: '', danger: false });
  const [reviewFilters, setReviewFilters] = useState({ rating: '', sentiment: '', hasReply: '', productId: '' });
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in. 🚪');
          navigate('/business-login');
          return;
        }
        const headers = getAuthHeaders();
        const businessRes = await axios.get('http://localhost:8000/api/businesses/me/', headers);
        const productsRes = await axios.get('http://localhost:8000/api/products/', headers);
        const reviewsRes = await axios.get(`http://localhost:8000/api/reviews/?business_id=${businessRes.data.id}`, headers);

        setBusinessData(businessRes.data);
        setProducts(productsRes.data.filter(p => p.business === businessRes.data.id));
        const myProductIds = productsRes.data
          .filter(p => p.business === businessRes.data.id)
          .map(p => p.id);

        const myReviews = reviewsRes.data.filter(r => myProductIds.includes(r.product));
        setReviews(myReviews);

        localStorage.setItem('business', JSON.stringify(businessRes.data));
        localStorage.setItem('loggedInBusiness', JSON.stringify(businessRes.data));
      } catch (err) {
        console.error('Fetch data error:', err.response);
        setError('Failed to load dashboard 🚨');
        if (err.response?.status === 401) {
          navigate('/business-login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('business');
    localStorage.removeItem('loggedInBusiness');
    navigate('/business-login');
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8000/api/businesses/${businessData.id}/`,
        businessData,
        getAuthHeaders()
      );
      localStorage.setItem('business', JSON.stringify(businessData));
      localStorage.setItem('loggedInBusiness', JSON.stringify(businessData));
      setSuccess('Business info updated successfully! 🎉');
    } catch (err) {
      console.error('Update error:', err.response);
      setError(err.response?.data?.message || 'Failed to update business info 🚨');
    }
  };

  const handleDelete = async () => {
    setConfirm({
      open: true,
      action: async () => {
        try {
          await axios.delete(
            `http://localhost:8000/api/businesses/${businessData.id}/`,
            getAuthHeaders()
          );
          handleLogout();
        } catch (err) {
          console.error('Delete error:', err.response);
          setError(err.response?.data?.message || 'Failed to delete business 🚨');
        } finally {
          setConfirm((c) => ({ ...c, open: false }));
        }
      },
      title: 'Delete your business?',
      description: 'This will permanently delete your account and data.',
      danger: true,
    });
  };

  const addProduct = async (name) => {
    try {
      const { data: newProd } = await axios.post(
        'http://localhost:8000/api/products/',
        { business: businessData.id, name },
        getAuthHeaders()
      );
      setProducts([...products, newProd]);
      setSuccess('Product added ✅');
    } catch (err) {
      console.error('Add product error:', err.response);
      setError(err.response?.data?.message || 'Failed to add product 🚨');
    }
  };

  const deleteProduct = async (id) => {
    setConfirm({
      open: true,
      action: async () => {
        try {
          await axios.delete(`http://localhost:8000/api/products/${id}/`, getAuthHeaders());
          setProducts(products.filter((p) => p.id !== id));
          setSuccess('Product deleted ✅');
        } catch (err) {
          console.error('Delete product error:', err.response);
          setError(err.response?.data?.message || 'Failed to delete product 🚨');
        } finally {
          setConfirm((c) => ({ ...c, open: false }));
        }
      },
      title: 'Delete product?',
      description: 'This action cannot be undone.',
      danger: true,
    });
  };

  const handleReplyChange = (index, value) => {
    const updated = [...reviews];
    updated[index].reply = value;
    setReviews(updated);
  };

  const saveReplies = async () => {
    try {
      await Promise.all(
        reviews.map((r) =>
          axios.put(
            `http://localhost:8000/api/reviews/${r.id}/`,
            { reply: r.reply },
            getAuthHeaders()
          )
        )
      );
      setSuccess('Replies saved successfully! 🎉');
    } catch (err) {
      console.error('Save replies error:', err.response);
      setError(err.response?.data?.message || 'Failed to save replies 🚨');
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const fakeCount = reviews.filter((r) => r.is_fake).length;
  const sentimentCounts = reviews.reduce(
    (acc, r) => {
      acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const filteredReviews = reviews.filter((r) => {
    const matchesRating = reviewFilters.rating ? String(r.rating) === reviewFilters.rating : true;
    const matchesSentiment = reviewFilters.sentiment ? r.sentiment === reviewFilters.sentiment : true;
    const matchesReply = reviewFilters.hasReply === '' ? true : reviewFilters.hasReply === 'yes' ? !!(r.reply && r.reply.trim()) : !(r.reply && r.reply.trim());
    const matchesProduct = reviewFilters.productId ? String(r.product) === reviewFilters.productId : true;
    return matchesRating && matchesSentiment && matchesReply && matchesProduct;
  });

  if (loading) return <div className="loading-screen">Loading dashboard... 📊</div>;
  if (error && !success) {
    // Non-blocking toast also used; keep this for critical errors that block view
    // but we still render main UI; so we will not early-return here to allow toast usage
  }

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
        <div className="sidebar-header">
          <h2>🧾</h2>
        </div>
        <ul className="sidebar-tabs">
          {['dashboard', 'products', 'reviews', 'preview', 'info'].map((tab) => (
            <li key={tab} onClick={() => toggleTab(tab)}>
              {tab === 'dashboard'
                ? '📊 Dashboard'
                : tab === 'products'
                ? '📦 Manage Products'
                : tab === 'reviews'
                ? '📝 Manage Reviews'
                : tab === 'preview'
                ? '👁 Preview Profile'
                : '⚙ Business Info'}
            </li>
          ))}
          <li onClick={handleLogout}>🚪 Logout</li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header-bar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <h1>{businessData?.name || 'Business Dashboard'}</h1>
        </div>

        <Toast kind={error ? 'error' : 'success'} message={error || success} onClose={() => { setError(null); setSuccess(null); }} />

        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <div className="card">Total Reviews: {reviews.length} 📝</div>
            <div className="card">Avg Rating: ⭐ {averageRating}</div>
            <div className="card">Fake Reviews: 🚫 {fakeCount}</div>
            <div className="card">
              Sentiment: 😊 {sentimentCounts.positive} | 😐 {sentimentCounts.neutral} | ☹ {sentimentCounts.negative}
            </div>
            <div className="card">Total Products: 📦 {products.length}</div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="manage-section">
            <h2>Manage Products 📦</h2>
            <div className="side-by-side">
              <ProductForm onAdd={addProduct} />
              <table>
                <thead>
                  <tr>
                    <th>Name 📝</th>
                    <th>Action 🚀</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>
                          <button className="btn btn-danger" onClick={() => deleteProduct(p.id)}>Delete 🚫</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No products found. 😞</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="manage-section">
            <h2>Manage Reviews 📝</h2>
            <div className="toolbar" style={{ marginBottom: 12 }}>
              <select className="input" value={reviewFilters.productId} onChange={(e) => setReviewFilters({ ...reviewFilters, productId: e.target.value })}>
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={String(p.id)}>{p.name}</option>
                ))}
              </select>
              <select className="input" value={reviewFilters.rating} onChange={(e) => setReviewFilters({ ...reviewFilters, rating: e.target.value })}>
                <option value="">All Ratings</option>
                {[5,4,3,2,1].map(r => <option key={r} value={String(r)}>{r} ⭐</option>)}
              </select>
              <select className="input" value={reviewFilters.sentiment} onChange={(e) => setReviewFilters({ ...reviewFilters, sentiment: e.target.value })}>
                <option value="">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <select className="input" value={reviewFilters.hasReply} onChange={(e) => setReviewFilters({ ...reviewFilters, hasReply: e.target.value })}>
                <option value="">Replies: All</option>
                <option value="yes">Has reply</option>
                <option value="no">No reply</option>
              </select>
              <button className="btn btn-primary" onClick={saveReplies}>💾 Save Replies</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Customer 👤</th>
                  <th>Product 📦</th>
                  <th>Rating ⭐</th>
                  <th>Review 📝</th>
                  <th>Sentiment 😊</th>
                  <th>Fake? 🚩</th>
                  <th>Reply ↪</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((r, i) => (
                    <tr key={r.id}>
                      <td>{r.customer_name}</td>
                      <td>{r.product_name}</td>
                      <td>{r.rating}</td>
                      <td>{r.text}</td>
                      <td>
                        {r.sentiment === 'positive' && '😊 Positive'}
                        {r.sentiment === 'neutral' && '😐 Neutral'}
                        {!r.sentiment && 'N/A'}
                      </td>
                      <td>{r.is_fake ? 'Yes 🚩' : 'No'}</td>
                      <td>
                        <textarea
                          value={r.reply || ''}
                          onChange={(e) => handleReplyChange(i, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No reviews match your filters. 😞</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-profile">
            <h2>Profile Preview 👁</h2>
            <p>
              <strong>Name:</strong> {businessData?.name || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong> {businessData?.email || 'N/A'}
            </p>
            <p>
              <strong>Phone:</strong> {businessData?.phone || 'N/A'}
            </p>
            <p>
              <strong>Location:</strong> {businessData?.country || 'N/A'}, {businessData?.state || 'N/A'}
            </p>
            <p>
              <strong>Hours:</strong> {businessData?.hours || 'N/A'}
            </p>
            <p>
              <strong>Description:</strong> {businessData?.description || 'N/A'}
            </p>
            <h3>Products 📦</h3>
            <ul>
              {products.length > 0 ? (
                products.map((p) => <li key={p.id}>{p.name}</li>)
              ) : (
                <li>No products found. 😞</li>
              )}
            </ul>
            <h3>Reviews 📝</h3>
            <ul>
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <li key={r.id}>
                    <strong>{r.customer_name}</strong>: {r.text} ({r.sentiment})
                  </li>
                ))
              ) : (
                <li>No reviews found. 😞</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="manage-section">
            <h2>Business Info ⚙</h2>
            <div className="info-fields">
              {['name', 'email', 'phone', 'country', 'state', 'hours', 'description'].map((field) => (
                <React.Fragment key={field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {field === 'description' ? (
                    <textarea
                      value={businessData?.[field] || ''}
                      onChange={(e) => setBusinessData({ ...businessData, [field]: e.target.value })}
                    />
                  ) : (
                    <input
                      value={businessData?.[field] || ''}
                      onChange={(e) => setBusinessData({ ...businessData, [field]: e.target.value })}
                    />
                  )}
                </React.Fragment>
              ))}
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={handleUpdate}>Save 💾</button>
                <button onClick={handleDelete} className="btn btn-danger">
                  Delete 🚫
                </button>
              </div>
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

const ProductForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  return (
    <div className="product-form">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New product name 📝"
        required
      />
      <button
        className="btn btn-primary"
        onClick={() => {
          if (name.trim()) {
            onAdd(name.trim());
            setName('');
          }
        }}
      >
        Add ➕
      </button>
    </div>
  );
};

export default BusinessDashboard;