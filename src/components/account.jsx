import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import '../styles/AccountPage.css';

function Account() {
  const [user] = useAuthState(auth);
  const [likedStories, setLikedStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchLikedStories();
    }
  }, [user]);

  const fetchLikedStories = async () => {
    try {
      const q = query(
        collection(db, 'stories'),
        where('likes', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLikedStories(storiesData);
    } catch (error) {
      console.error("Error fetching liked stories: ", error);
      alert('Error fetching liked stories. Please try again.');
    }
  };

  const handleStoryClick = (storyId) => {
    navigate(`/liked-story/${storyId}`);
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Navbar />
      <div className="account-page-container">
        <h2>Your Liked Stories</h2>
        <div className="liked-stories-grid">
          {likedStories.map(story => (
            <div key={story.id} className="story-card" onClick={() => handleStoryClick(story.id)}>
              {story.imageUrl && <img src={story.imageUrl} alt={story.title} className="story-card-image" />}
              <div className="story-card-content">
                <h4 className="story-card-title">{story.title}</h4>
                <p className="story-card-description">{story.content.substring(0, 100)}...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Account;