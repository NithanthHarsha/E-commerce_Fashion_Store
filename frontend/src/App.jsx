import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ManageOrders from './pages/ManageOrders';
import Register from './pages/Register';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loggedUser = localStorage.getItem('username');
    const adminStatus = localStorage.getItem('is_admin') === 'true';
    if (loggedUser) {
      setUser(loggedUser);
      setIsAdmin(adminStatus);
      fetchNotifications(loggedUser);
    }
  }, []);

  const fetchNotifications = async (username) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/notifications/${username}/`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('is_admin');
    setUser(null);
    setIsAdmin(false);
    window.location.href = '/'; 
  };

  const handleLoginSuccess = (username, admin) => {
    setUser(username);
    setIsAdmin(admin);
    fetchNotifications(username);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <Link to="/" className="logo">FASHION STORE</Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            
            {/* Admin links */}
            {isAdmin && (
              <>
                <li><Link to="/admin">Products</Link></li>
                <li><Link to="/manage-orders">Orders</Link></li>
              </>
            )}
            
            {!user ? (
              <>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
              </>
            ) : (
              <>
                <li className="notification-wrapper">
                  <button 
                    className="notif-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    🔔 {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
                  </button>
                  {showNotifications && (
                    <div className="notif-dropdown">
                      <h4>Notifications</h4>
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div key={n.id} className="notif-item">
                            <p>{n.message}</p>
                            <small>{new Date(n.created_at).toLocaleString()}</small>
                          </div>
                        ))
                      ) : (
                        <p className="no-notif">No new updates</p>
                      )}
                    </div>
                  )}
                </li>
                <li className="user-welcome">Hello, {user} {isAdmin && "(Admin)"}</li>
                <li><button onClick={handleLogout} className="btn-logout-nav">Logout</button></li>
              </>
            )}
          </ul>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={isAdmin ? <Admin /> : <Home />} />
            <Route path="/manage-orders" element={isAdmin ? <ManageOrders /> : <Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>FASHION STORE</h3>
              <p>Defining the modern wardrobe through timeless silhouettes and premium craftsmanship.</p>
            </div>
            <div className="footer-section">
              <h4>Shop</h4>
              <ul>
                <li><Link to="/">New Arrivals</Link></li>
                <li><a href="#">Best Sellers</a></li>
                <li><a href="#">Collections</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Shipping</a></li>
                <li><a href="#">Returns</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Social</h4>
              <ul>
                <li><a href="#">Instagram</a></li>
                <li><a href="#">Pinterest</a></li>
                <li><a href="#">Vogue</a></li>
              </ul>
            </div>
          </div>
          <p className="copyright">&copy; 2025 Fashion Store. Crafted for the Modern Lifestyle.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;