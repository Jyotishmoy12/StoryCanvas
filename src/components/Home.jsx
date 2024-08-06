import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleStartStory = () => {
    navigate('/signup');
  };

  return (
    <div className="home-container">
      <Navbar />
      <main className="home-content">
        <div className="glass-card main-card">
          <h1>Craft Your Life's Story</h1>
          <p>Turn your experiences into captivating narratives. Join our platform and start sharing your unique journey today.</p>
          <button className="cta-button" onClick={handleStartStory}>Start Your Story</button>
        </div>
        <div className="features-container">
          <div className="glass-card feature-card">
            <h2>Share</h2>
            <p>Create and share your personal stories with our community.</p>
          </div>
          <div className="glass-card feature-card">
            <h2>Connect</h2>
            <p>Engage with other storytellers and find inspiration.</p>
          </div>
          <div className="glass-card feature-card">
            <h2>Grow</h2>
            <p>Develop your writing skills and build your audience.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;