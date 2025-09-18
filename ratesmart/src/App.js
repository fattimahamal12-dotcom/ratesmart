import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import BusinessSignup from './pages/BusinessSignup';
import BusinessLogin from './pages/BusinessLogin';
import BusinessDashboard from './pages/BusinessDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SearchPage from './pages/SearchPage';
import BusinessProfile from './pages/BusinessProfile';
import ReviewPage from './pages/ReviewPage';
import ThankYouPage from './pages/ThankYouPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/business-signup" element={<BusinessSignup />} />
        <Route path="/business-login" element={<BusinessLogin />} />
        <Route path="/business-dashboard" element={<BusinessDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/search-page" element={<SearchPage />} />
        <Route path="/profile/:id" element={<BusinessProfile />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;