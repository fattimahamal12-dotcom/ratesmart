import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './BusinessProfile.css';
import '../styles/components.css';

const BusinessProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [business, setBusiness] = useState({});
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Public fetch, no token required
        const { data: biz } = await axios.get(`http://localhost:8000/api/businesses/${id}/`);
        const { data: allProducts } = await axios.get('http://localhost:8000/api/products/');
        const { data: allReviews } = await axios.get('http://localhost:8000/api/reviews/');

        setBusiness(biz);
        setProducts(
          allProducts.filter(
            p =>
              (typeof p.business === 'object' && p.business !== null
                ? p.business.id
                : p.business) === biz.id
          )
        );
        
        const businessReviews = allReviews.filter(review => review.business_id === biz.id);
        setReviews(businessReviews);

        const distribution = {};
        businessReviews.forEach(review => {
          const star = review.rating;
          distribution[star] = (distribution[star] || 0) + 1;
        });
        setRatingDistribution(distribution);
      } catch (err) {
        console.error('Failed to load profile:', err.response);
        setError('Failed to load business profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 'N/A';

  if (loading) {
    return (
      <div className="profile-container">
        <h1>Loading Business Profile... 📊</h1>
        <p>Please wait while we fetch your business information.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <h1>Error Loading Profile 🚨</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/search-page')}>Search for Business</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>{business.name || 'Business Profile 👤'}</h1>

      <div className="business-contact card">
        <p><strong>Phone:</strong> {business.phone || 'N/A'}</p>
        <p><strong>Location:</strong> {business.country}, {business.state}</p>
        <p><strong>Email:</strong> {business.email || 'N/A'}</p>
        <p><strong>Opening Hours:</strong> {business.hours || 'N/A'}</p>
        <p><strong>Average Rating:</strong> {averageRating} ⭐</p>
      </div>

      <div className="description card">
        <h2>About Us 📝</h2>
        <p>{business.description || 'No description available. 😞'}</p>
      </div>

      <div className="products-section card">
        <h2>Our Products 📦</h2>
        {products.length > 0 ? (
          <ul className="product-list">
            {products.map((prod, index) => (
              <li key={index}>{prod.name}</li>
            ))}
          </ul>
        ) : (
          <p>No products listed. 😞</p>
        )}
      </div>

      <div className="rating-distribution card">
        <h2>Rating Distribution 📊</h2>
        {[5, 4, 3, 2, 1].map(star => {
          const count = ratingDistribution[star] || 0;
          const percent = totalReviews ? (count / totalReviews) * 100 : 0;
          return (
            <div key={star} className="rating-bar">
              <span>{star}⭐</span>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <span>{count}</span>
            </div>
          );
        })}
      </div>

      <div className="reviews-section card">
        <h2>Customer Reviews 📝</h2>
        {reviews.length > 0 ? (
          <div className="review-list">
            {reviews.map((r, index) => (
              <div key={index} className="review-line">
                <p>
                  <strong>{r.customer_name}</strong> • {r.product_name} • {r.rating}⭐ • 
                  <span className="review-text">"{r.text}"</span> • 
                  Sentiment: {r.sentiment || 'Unknown'}
                  {r.is_fake && <span className="fake-inline"> • 🚩 Fake</span>}
                </p>
                {r.reply && (
                  <p className="reply-line">↪ <strong>Business Reply:</strong> {r.reply}</p>
                )}
                <hr className="review-divider" />
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet. 😞</p>
        )}
      </div>

      <div className="nav-buttons">
        <button className="btn btn-muted" onClick={() => navigate('/')}>🏠 Back to Home</button>
        <button className="btn btn-primary" onClick={() => navigate('/search-page')}>🔍 Search Businesses</button>
      </div>
    </div>
  );
};

export default BusinessProfile;