import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">StoryCanvas</div>
        <div className={`menu-icon ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
          <li><Link to="/view-stories" onClick={toggleMenu}>Explore Stories</Link></li>
          <li><Link to="/upload" onClick={toggleMenu}>Share Your Story</Link></li>
          <li><Link to="/account" className="account-link" onClick={toggleMenu}>Your Liked Stories</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;