import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">StoryCanvas</div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/view-stories">Explore Stories</Link></li>
          <li><Link to="/upload">Share Your Story</Link></li>
          <li><Link to="/account" className="account-link">Account</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;