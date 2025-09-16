import React from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="home-container">
      <div className="hero-section animate-fade-in">
        <h1>Welcome to <span className="brand">RateSmart</span></h1>
        <p className="subtitle">Discover and Review Businesses powered by AI</p>
      </div>
      <div className="cards-container">
        <Card className="action-card animate-slide-up" style={{ '--delay': '0.1s' }}>
          <Card.Body>
            <h3> Business 🏢</h3>
            <div className="button-group">
              <Button 
                className="action-btn teal-btn"
                onClick={() => navigate('/business-login')}
              >
                Business Login
              </Button>
              <Button 
                className="action-btn mint-btn"
                onClick={() => navigate('/business-signup')}
              >
                Business Sign Up
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card className="action-card animate-slide-up" style={{ '--delay': '0.2s' }}>
          <Card.Body>
            <h3> Admin🛠</h3>
            <div className="button-group">
              <Button 
                className="action-btn dark-teal-btn"
                onClick={() => navigate('/admin-login')}
              >
                Admin Login
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card className="action-card animate-slide-up" style={{ '--delay': '0.3s' }}>
          <Card.Body>
            <h3> I'm a Customer👤</h3>
            <div className="button-group">
              <Button 
                className="action-btn teal-btn"
                onClick={() => navigate('/search-page')}
              >
                Search Businesses
              </Button>
              <Button 
                className="action-btn mint-btn"
                onClick={() => navigate('/review')}
              >
                Leave a Review
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default HomePage;